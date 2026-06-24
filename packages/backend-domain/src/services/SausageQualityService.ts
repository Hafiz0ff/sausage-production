import {
  CreateSausageQualityCheckInput,
  AcceptSausageBatchInput,
  RejectSausageBatchInput,
  ApproveSausageLossInput,
  SausageQualityCheckDto,
  SausageProductionBatchDto,
  SausageLossDto,
  SAUSAGE_ERROR_CODES,
  SausageQualitySummaryDto,
  SausageLossSummaryDto
} from 'sausage-shared-types';
import { v4 as uuidv4 } from 'uuid';
import { SausageRepositories } from '../repositories/SausageRepositories';
import { SausageAuthPort } from '../ports/SausageAuthPort';

export class SausageQualityService {
  constructor(
    private repos: SausageRepositories,
    private authPort: SausageAuthPort
  ) {}

  async checkQuality(batchId: string, input: CreateSausageQualityCheckInput): Promise<SausageQualityCheckDto> {
    if (input.checkedQty <= 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Checked quantity must be > 0' } };
    }
    if (input.acceptedQty < 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Accepted quantity must be >= 0' } };
    }
    if (input.rejectedQty < 0) {
      throw { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message: 'Rejected quantity must be >= 0' } };
    }
    if (input.acceptedQty + input.rejectedQty > input.checkedQty) {
      throw { error: { code: SAUSAGE_ERROR_CODES.RELEASE_QTY_INVALID, message: 'acceptedQty + rejectedQty <= checkedQty' } };
    }

    const user = this.authPort.getCurrentUser();

    return await this.repos.runTransaction(async (tx) => {
      const batch = await tx.batches.findById(batchId, user.companyId);
      if (!batch) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Batch not found' } };
      }
      
      if (batch.status === 'CANCELLED') {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Cancelled batch cannot be quality checked' } };
      }

      if (batch.status !== 'RELEASED' && batch.status !== 'QUALITY_PENDING') {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Batch is not available for quality check' } };
      }

      const qualityStatus = input.rejectedQty === 0
        ? 'PASSED'
        : input.acceptedQty === 0
          ? 'FAILED'
          : 'PARTIAL';
      const batchStatus = qualityStatus === 'PASSED'
        ? 'ACCEPTED'
        : qualityStatus === 'FAILED'
          ? 'REJECTED'
          : 'PARTIALLY_ACCEPTED';
      const now = new Date().toISOString();

      const qualityCheck: SausageQualityCheckDto = {
        id: uuidv4(),
        companyId: user.companyId,
        productionBatchId: batch.id,
        productionOrderId: batch.productionOrderId,
        batchNo: batch.batchNo,
        finishedProductId: batch.finishedProductId,
        finishedProductName: batch.finishedProductName,
        checkedQty: input.checkedQty,
        acceptedQty: input.acceptedQty,
        rejectedQty: input.rejectedQty,
        qualityStatus,
        temperatureCelsius: input.temperatureCelsius,
        humidityPercent: input.humidityPercent,
        sampleWeightQty: input.sampleWeightQty,
        note: input.note,
        checkedByUserId: user.id,
        checkedByName: user.name,
        checkedAt: now,
        createdAt: now,
        updatedAt: now
      };

      const createdQualityCheck = await tx.qualityChecks.create(qualityCheck);

      await tx.batches.update(batch.id, user.companyId, {
        qualityStatus,
        qualityCheckedByUserId: user.id,
        qualityCheckedByName: user.name,
        qualityCheckedAt: now,
        qualityNote: input.note,
        status: batchStatus,
        updatedAt: now
      });

      if (input.rejectedQty > 0) {
        await tx.losses.create({
          id: uuidv4(),
          companyId: user.companyId,
          docNo: `QL-${Date.now()}`,
          itemKind: 'FINISHED_PRODUCT',
          itemId: batch.finishedProductId,
          itemName: batch.finishedProductName,
          reason: 'QUALITY_REJECT',
          category: 'QUALITY_REJECT',
          stage: 'QUALITY_CONTROL',
          quantityQty: input.rejectedQty,
          productionOrderId: batch.productionOrderId,
          productionBatchId: batch.id,
          isRecoverable: false,
          createdByUserId: user.id,
          createdByName: user.name,
          createdAt: now
        });
      }

      return createdQualityCheck;
    });
  }

  async getQualityChecks(): Promise<SausageQualityCheckDto[]> {
    const user = this.authPort.getCurrentUser();
    return this.repos.qualityChecks.findMany(user.companyId);
  }

  async getQualityCheckById(id: string): Promise<SausageQualityCheckDto | null> {
    const user = this.authPort.getCurrentUser();
    return this.repos.qualityChecks.findById(id, user.companyId);
  }

  async acceptBatch(batchId: string, input: AcceptSausageBatchInput): Promise<SausageProductionBatchDto> {
    const user = this.authPort.getCurrentUser();

    return await this.repos.runTransaction(async (tx) => {
      const batch = await tx.batches.findById(batchId, user.companyId);
      if (!batch) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Batch not found' } };
      }
      
      if (batch.qualityStatus !== 'PASSED') {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Batch quality is not passed' } };
      }
      
      if (batch.status === 'ACCEPTED') {
        return batch;
      }

      const now = new Date().toISOString();
      return await tx.batches.update(batch.id, user.companyId, {
        status: 'ACCEPTED',
        qualityNote: input.note ? `${batch.qualityNote ? batch.qualityNote + ' | ' : ''}${input.note}` : batch.qualityNote,
        updatedAt: now
      });
    });
  }

  async rejectBatch(batchId: string, input: RejectSausageBatchInput): Promise<SausageProductionBatchDto> {
    const user = this.authPort.getCurrentUser();

    return await this.repos.runTransaction(async (tx) => {
      const batch = await tx.batches.findById(batchId, user.companyId);
      if (!batch) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Batch not found' } };
      }
      
      const now = new Date().toISOString();
      return await tx.batches.update(batch.id, user.companyId, {
        status: 'REJECTED',
        qualityStatus: 'FAILED',
        qualityNote: input.note ? `${batch.qualityNote ? batch.qualityNote + ' | ' : ''}${input.note}` : batch.qualityNote,
        updatedAt: now
      });
    });
  }

  async reopenQuality(batchId: string): Promise<SausageProductionBatchDto> {
    const user = this.authPort.getCurrentUser();

    return await this.repos.runTransaction(async (tx) => {
      const batch = await tx.batches.findById(batchId, user.companyId);
      if (!batch) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Batch not found' } };
      }
      if (batch.status === 'CANCELLED') {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Cancelled batch cannot be reopened for quality' } };
      }

      return await tx.batches.update(batch.id, user.companyId, {
        status: 'QUALITY_PENDING',
        qualityStatus: 'NOT_CHECKED',
        qualityCheckedByUserId: undefined,
        qualityCheckedByName: undefined,
        qualityCheckedAt: undefined,
        qualityNote: undefined,
        updatedAt: new Date().toISOString()
      });
    });
  }

  async approveLoss(lossId: string, input: ApproveSausageLossInput): Promise<SausageLossDto> {
    const user = this.authPort.getCurrentUser();

    return await this.repos.runTransaction(async (tx) => {
      const loss = await tx.losses.findById(lossId, user.companyId);
      if (!loss) {
        throw { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message: 'Loss not found' } };
      }
      
      if (loss.approvedByUserId) {
        throw { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message: 'Loss is already approved' } };
      }

      const now = new Date().toISOString();
      return await tx.losses.update(loss.id, user.companyId, {
        approvedByUserId: user.id,
        approvedByName: user.name,
        approvedAt: now,
      });
    });
  }

  async getQualitySummary(): Promise<SausageQualitySummaryDto> {
    const user = this.authPort.getCurrentUser();
    const batches = await this.repos.batches.findMany(user.companyId);
    
    let totalBatches = batches.length;
    let acceptedBatches = 0;
    let rejectedBatches = 0;
    let partialBatches = 0;
    
    let totalProducedQty = 0;
    let totalAcceptedQty = 0;
    let totalRejectedQty = 0;
    let sumYieldPercent = 0;
    let sumVariancePercent = 0;
    let yieldCount = 0;
    let varianceCount = 0;

    for (const batch of batches) {
      if (batch.status === 'ACCEPTED') acceptedBatches++;
      else if (batch.status === 'REJECTED') rejectedBatches++;
      else if (batch.qualityStatus === 'PARTIAL') partialBatches++; // For future expansion
      
      totalProducedQty += batch.producedQty;
      totalAcceptedQty += batch.acceptedQty;
      totalRejectedQty += batch.rejectedQty;
      
      if (batch.yieldPercent != null) {
        sumYieldPercent += batch.yieldPercent;
        yieldCount++;
      }
      if (batch.variancePercent != null) {
        sumVariancePercent += batch.variancePercent;
        varianceCount++;
      }
    }

    return {
      totalBatches,
      acceptedBatches,
      rejectedBatches,
      partialBatches,
      totalProducedQty,
      totalAcceptedQty,
      totalRejectedQty,
      averageYieldPercent: yieldCount > 0 ? sumYieldPercent / yieldCount : 0,
      averageVariancePercent: varianceCount > 0 ? sumVariancePercent / varianceCount : 0,
    };
  }

  async getLossSummary(): Promise<SausageLossSummaryDto> {
    const user = this.authPort.getCurrentUser();
    const losses = await this.repos.losses.findMany(user.companyId);
    
    let totalLossQty = 0;
    const lossQtyByCategory: Record<string, number> = {};
    const lossQtyByStage: Record<string, number> = {};
    const lossQtyByReason: Record<string, number> = {};
    let approvedLossCount = 0;
    let unapprovedLossCount = 0;

    for (const loss of losses) {
      totalLossQty += loss.quantityQty;
      
      if (loss.category) {
        lossQtyByCategory[loss.category] = (lossQtyByCategory[loss.category] || 0) + loss.quantityQty;
      }
      if (loss.stage) {
        lossQtyByStage[loss.stage] = (lossQtyByStage[loss.stage] || 0) + loss.quantityQty;
      }
      if (loss.reason) {
        lossQtyByReason[loss.reason] = (lossQtyByReason[loss.reason] || 0) + loss.quantityQty;
      }
      
      if (loss.approvedByUserId) {
        approvedLossCount++;
      } else {
        unapprovedLossCount++;
      }
    }

    return {
      totalLossQty,
      lossQtyByCategory,
      lossQtyByStage,
      lossQtyByReason,
      approvedLossCount,
      unapprovedLossCount,
    };
  }

  getLossCategories() {
    return {
      categories: ['RAW_MATERIAL', 'PRODUCTION', 'QUALITY_REJECT', 'PACKAGING', 'EXPIRY', 'ADJUSTMENT', 'OTHER'],
      stages: ['RAW_WAREHOUSE', 'WORKSHOP_PREP', 'MIXING', 'THERMAL_PROCESSING', 'PACKAGING', 'FINISHED_WAREHOUSE', 'QUALITY_CONTROL', 'OTHER'],
      reasons: ['TRIMMING', 'THERMAL_LOSS', 'DEFECT', 'EXPIRY', 'CALIBRATION', 'PACKAGING_DAMAGE', 'QUALITY_REJECT', 'WEIGHT_VARIANCE', 'OTHER']
    };
  }
}
