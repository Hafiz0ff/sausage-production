import { 
  CreateSausageDocumentInput,
  SausageDocumentDto,
  SausageDocumentPrintViewDto,
  SausageDocumentFilterDto,
  PostSausageDocumentInput,
  CancelSausageDocumentInput,
  CreateRawReceiptDocumentInput,
  CreateRawTransferDocumentInput,
  CreateWriteOffDocumentInput,
  CreateStockAdjustmentDocumentInput,
  CreateProductionBatchActInput,
  CreateQualityCheckActInput,
  SausageDocumentItemKind,
  SausageStockLocation,
  SAUSAGE_ERROR_CODES
} from 'sausage-shared-types';
import { SausageRepositories } from '../repositories/SausageRepositories';
import { SausageAuditService } from './SausageAuditService';
import { SausageAuthPort } from '../ports/SausageAuthPort';
import { randomUUID } from 'crypto';

export class SausageDocumentService {
  constructor(
    private repos: SausageRepositories,
    private auditService: SausageAuditService,
    private authPort: SausageAuthPort
  ) {}

  private generateDocumentNumber(type: string): string {
    const prefix = type.split('_').map(w => w[0]).join('');
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${rand}`;
  }

  private getCurrentUser() {
    return this.authPort.getCurrentUser();
  }

  private validationError(message: string) {
    return { error: { code: SAUSAGE_ERROR_CODES.VALIDATION_ERROR, message } };
  }

  private notFound(message: string) {
    return { error: { code: SAUSAGE_ERROR_CODES.NOT_FOUND, message } };
  }

  private forbiddenTransition(message: string) {
    return { error: { code: SAUSAGE_ERROR_CODES.FORBIDDEN_TRANSITION, message } };
  }

  private insufficientStock(message: string) {
    return { error: { code: SAUSAGE_ERROR_CODES.NEGATIVE_STOCK_FORBIDDEN, message } };
  }

  private async createDocumentForUser(input: CreateSausageDocumentInput, user: ReturnType<SausageAuthPort['getCurrentUser']>): Promise<SausageDocumentDto> {
    return this.repos.runTransaction(async (tx) => {
      if (!input.lines.length) {
        throw this.validationError('Document must have at least one line');
      }

      for (const line of input.lines) {
        if (line.quantityQty <= 0) {
          throw this.validationError('Document line quantity must be > 0');
        }
      }

      const totalQty = input.lines.reduce((sum, line) => sum + line.quantityQty, 0);
      const totalAmount = input.lines.reduce((sum, line) => sum + ((line.costAmount || line.priceAmount || 0) * line.quantityQty), 0);
      const now = new Date().toISOString();
      
      const doc = await tx.documents.create({
        id: randomUUID(),
        companyId: user.companyId,
        type: input.type,
        number: this.generateDocumentNumber(input.type),
        status: 'DRAFT',
        title: input.title,
        sourceEntityKind: input.sourceEntityKind,
        sourceEntityId: input.sourceEntityId,
        externalDocumentId: input.externalDocumentId,
        relatedOrderId: input.relatedOrderId,
        relatedBatchId: input.relatedBatchId,
        clientId: input.clientId,
        clientName: input.clientName,
        totalQty,
        totalAmount,
        currency: input.currency,
        note: input.note,
        createdByUserId: user.id,
        createdByName: user.name,
        createdAt: now,
        updatedAt: now,
        lines: input.lines.map((line, index) => ({
          id: randomUUID(),
          companyId: user.companyId,
          documentId: '', // placeholder, handled by Prisma in create
          lineNo: index + 1,
          itemKind: line.itemKind,
          itemId: line.itemId,
          itemName: line.itemName,
          quantityQty: line.quantityQty,
          unit: line.unit,
          fromLocation: line.fromLocation,
          toLocation: line.toLocation,
          priceAmount: line.priceAmount,
          costAmount: line.costAmount,
          currency: line.currency,
          note: line.note,
          createdAt: now,
          updatedAt: now
        }))
      });

      await this.auditService.logAction(
        user.companyId,
        'DOCUMENT_CREATED',
        'DOCUMENT',
        doc.id,
        user.id,
        user.name,
        doc.id,
        undefined,
        doc,
        undefined,
        tx
      );

      return doc;
    });
  }

  async createDocument(input: CreateSausageDocumentInput): Promise<SausageDocumentDto> {
    return this.createDocumentForUser(input, this.getCurrentUser());
  }

  async getDocuments(filter?: SausageDocumentFilterDto): Promise<SausageDocumentDto[]> {
    const user = this.getCurrentUser();
    return this.repos.documents.findMany(user.companyId, filter);
  }

  async getDocumentById(id: string): Promise<SausageDocumentDto | null> {
    const user = this.getCurrentUser();
    return this.repos.documents.findById(id, user.companyId);
  }

  async getDocumentPrintView(id: string): Promise<SausageDocumentPrintViewDto> {
    const doc = await this.getDocumentById(id);
    if (!doc) throw this.notFound('Document not found');

    const rows = (doc.lines || []).map(line => (
      `<tr><td>${line.lineNo}</td><td>${escapeHtml(line.itemName)}</td><td>${line.quantityQty}</td><td>${escapeHtml(line.unit)}</td><td>${escapeHtml(line.fromLocation || '')}</td><td>${escapeHtml(line.toLocation || '')}</td></tr>`
    )).join('');

    return {
      html: [
        '<article class="sausage-document-print">',
        `<h1>${escapeHtml(doc.number)} - ${escapeHtml(doc.title || doc.type)}</h1>`,
        `<p>Status: ${escapeHtml(doc.status)}</p>`,
        `<p>Created: ${escapeHtml(doc.createdAt)}</p>`,
        '<table>',
        '<thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>From</th><th>To</th></tr></thead>',
        `<tbody>${rows}</tbody>`,
        '</table>',
        '</article>'
      ].join('')
    };
  }

  async postDocument(id: string, input: PostSausageDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();

    return this.repos.runTransaction(async (tx) => {
      const doc = await tx.documents.findById(id, user.companyId);
      if (!doc) throw this.notFound('Document not found');
      if (doc.status !== 'DRAFT') throw this.forbiddenTransition(`Cannot post document in status ${doc.status}`);

      // Perform stock movements based on document type
      if (doc.type === 'RAW_RECEIPT') {
        for (const line of doc.lines || []) {
          const raw = await tx.rawMaterials.findById(line.itemId, user.companyId);
          if (raw) {
            await tx.rawMaterials.update(raw.id, user.companyId, { warehouseQty: raw.warehouseQty + line.quantityQty, updatedAt: new Date().toISOString() });
            await tx.movements.create({
              id: randomUUID(),
              companyId: user.companyId,
              docNo: doc.number,
              type: 'RAW_RECEIPT',
              itemKind: 'RAW_MATERIAL',
              itemId: raw.id,
              itemName: raw.name,
              quantityQty: line.quantityQty,
              fromLocation: 'ADJUSTMENT',
              toLocation: 'RAW_WAREHOUSE',
              createdByUserId: user.id,
              createdByName: user.name,
              createdAt: new Date().toISOString()
            });
          }
        }
      } else if (doc.type === 'RAW_TRANSFER') {
        for (const line of doc.lines || []) {
          const raw = await tx.rawMaterials.findById(line.itemId, user.companyId);
          if (raw) {
            if (raw.warehouseQty < line.quantityQty) throw this.insufficientStock(`Insufficient warehouse quantity for ${raw.name}`);
            await tx.rawMaterials.update(raw.id, user.companyId, {
              warehouseQty: raw.warehouseQty - line.quantityQty,
              workshopQty: raw.workshopQty + line.quantityQty,
              updatedAt: new Date().toISOString()
            });
            await tx.movements.create({
              id: randomUUID(),
              companyId: user.companyId,
              docNo: doc.number,
              type: 'RAW_TRANSFER_TO_WORKSHOP',
              itemKind: 'RAW_MATERIAL',
              itemId: raw.id,
              itemName: raw.name,
              quantityQty: line.quantityQty,
              fromLocation: 'RAW_WAREHOUSE',
              toLocation: 'WORKSHOP',
              createdByUserId: user.id,
              createdByName: user.name,
              createdAt: new Date().toISOString(),
              productionOrderId: doc.relatedOrderId
            });
          }
        }
      } else if (doc.type === 'PRODUCTION_BATCH_ACT') {
         // Logic is usually handled by Batch completion itself, but if we create stock from doc:
         // This assumes the batch release already handles finished goods stock. If not, handle here.
      } else if (doc.type === 'WRITE_OFF_ACT') {
         for (const line of doc.lines || []) {
           if (line.itemKind === 'RAW_MATERIAL') {
             const raw = await tx.rawMaterials.findById(line.itemId, user.companyId);
             if (raw) {
                if (line.fromLocation === 'RAW_WAREHOUSE') {
                  if (raw.warehouseQty < line.quantityQty) throw this.insufficientStock(`Insufficient warehouse quantity for ${raw.name}`);
                  await tx.rawMaterials.update(raw.id, user.companyId, { warehouseQty: raw.warehouseQty - line.quantityQty, updatedAt: new Date().toISOString() });
                } else if (line.fromLocation === 'WORKSHOP') {
                  if (raw.workshopQty < line.quantityQty) throw this.insufficientStock(`Insufficient workshop quantity for ${raw.name}`);
                  await tx.rawMaterials.update(raw.id, user.companyId, { workshopQty: raw.workshopQty - line.quantityQty, updatedAt: new Date().toISOString() });
                } else {
                  throw this.validationError('Raw material write-off must use RAW_WAREHOUSE or WORKSHOP location');
                }
             }
           } else if (line.itemKind === 'FINISHED_PRODUCT') {
             const fp = await tx.finishedProducts.findById(line.itemId, user.companyId);
             if (fp) {
               if (fp.stockQty < line.quantityQty) throw this.insufficientStock(`Insufficient finished product quantity for ${fp.name}`);
               await tx.finishedProducts.update(fp.id, user.companyId, { stockQty: fp.stockQty - line.quantityQty, updatedAt: new Date().toISOString() });
             }
           }

           const now = new Date().toISOString();
           await tx.movements.create({
             id: randomUUID(),
             companyId: user.companyId,
             docNo: doc.number,
             type: 'LOSS_WRITE_OFF',
             itemKind: line.itemKind === 'FINISHED_PRODUCT' ? 'FINISHED_PRODUCT' : 'RAW_MATERIAL',
             itemId: line.itemId,
             itemName: line.itemName,
             quantityQty: line.quantityQty,
             fromLocation: line.fromLocation || 'ADJUSTMENT',
             toLocation: 'LOSS',
             createdByUserId: user.id,
             createdByName: user.name,
             createdAt: now,
             reason: line.note
           });
         }
      } else if (doc.type === 'STOCK_ADJUSTMENT') {
        // Adjust stock up or down based on physical count vs system
      }

      const updated = await tx.documents.update(id, user.companyId, {
        status: 'POSTED',
        postedByUserId: user.id,
        postedByName: user.name,
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note: input.note ? `${doc.note ? doc.note + '\n' : ''}${input.note}` : doc.note
      });

      await this.auditService.logAction(
        user.companyId,
        'DOCUMENT_POSTED',
        'DOCUMENT',
        updated.id,
        user.id,
        user.name,
        updated.id,
        doc,
        updated,
        undefined,
        tx
      );

      const domainAction = getDomainAuditAction(doc.type);
      if (domainAction) {
        await this.auditService.logAction(
          user.companyId,
          domainAction,
          'DOCUMENT',
          updated.id,
          user.id,
          user.name,
          updated.id,
          doc,
          updated,
          undefined,
          tx
        );
      }

      return updated;
    });
  }

  async cancelDocument(id: string, input: CancelSausageDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();

    return this.repos.runTransaction(async (tx) => {
      const doc = await tx.documents.findById(id, user.companyId);
      if (!doc) throw this.notFound('Document not found');
      if (doc.status !== 'DRAFT') throw this.forbiddenTransition(`Cannot cancel document in status ${doc.status}`);

      const updated = await tx.documents.update(id, user.companyId, {
        status: 'CANCELLED',
        cancelledByUserId: user.id,
        cancelledByName: user.name,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note: input.note ? `${doc.note ? doc.note + '\n' : ''}Cancelled: ${input.note}` : doc.note
      });

      await this.auditService.logAction(
        user.companyId,
        'DOCUMENT_CANCELLED',
        'DOCUMENT',
        updated.id,
        user.id,
        user.name,
        updated.id,
        doc,
        updated,
        undefined,
        tx
      );

      return updated;
    });
  }

  async createRawReceiptDocument(input: CreateRawReceiptDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const lines = await Promise.all(input.lines.map(async line => this.rawMaterialLine(user.companyId, line.rawMaterialId, line.quantityQty, undefined, 'RAW_WAREHOUSE')));
    return this.createDocumentForUser({
      type: 'RAW_RECEIPT',
      title: 'Поступление сырья',
      externalDocumentId: input.externalDocumentNo,
      clientName: input.supplierName,
      note: input.note,
      lines
    }, user);
  }

  async createRawTransferDocument(input: CreateRawTransferDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const lines = await Promise.all(input.lines.map(async line => this.rawMaterialLine(user.companyId, line.rawMaterialId, line.quantityQty, 'RAW_WAREHOUSE', 'WORKSHOP')));
    return this.createDocumentForUser({
      type: 'RAW_TRANSFER',
      title: 'Передача сырья в цех',
      relatedOrderId: input.productionOrderId,
      note: input.note,
      lines
    }, user);
  }

  async createWriteOffDocument(input: CreateWriteOffDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const lines = await Promise.all(input.lines.map(async line => {
      if (line.itemKind === 'RAW_MATERIAL') {
        return this.rawMaterialLine(user.companyId, line.itemId, line.quantityQty, line.fromLocation, 'LOSS', line.reason);
      }

      return this.finishedProductLine(user.companyId, line.itemId, line.quantityQty, line.fromLocation, 'LOSS', line.reason);
    }));

    return this.createDocumentForUser({
      type: 'WRITE_OFF_ACT',
      title: 'Акт списания',
      note: input.note,
      lines
    }, user);
  }

  async createStockAdjustmentDocument(input: CreateStockAdjustmentDocumentInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const lines = await Promise.all(input.lines.map(async line => {
      if (line.itemKind === 'RAW_MATERIAL') {
        return this.rawMaterialLine(user.companyId, line.itemId, line.quantityQty, 'ADJUSTMENT', line.location, input.note);
      }

      return this.finishedProductLine(user.companyId, line.itemId, line.quantityQty, 'ADJUSTMENT', line.location, input.note);
    }));

    return this.createDocumentForUser({
      type: 'STOCK_ADJUSTMENT',
      title: 'Корректировка остатков',
      note: input.note,
      lines
    }, user);
  }

  async createProductionBatchAct(input: CreateProductionBatchActInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const order = await this.repos.orders.findById(input.productionOrderId, user.companyId);
    if (!order) throw this.notFound('Production order not found');

    return this.createDocumentForUser({
      type: 'PRODUCTION_BATCH_ACT',
      title: 'Акт выпуска партии',
      relatedOrderId: order.id,
      note: input.note,
      lines: [{
        itemKind: 'FINISHED_PRODUCT',
        itemId: order.finishedProductId,
        itemName: order.finishedProductName,
        quantityQty: input.acceptedQty || input.producedQty,
        unit: 'kg',
        toLocation: 'FINISHED_WAREHOUSE',
        note: `Produced: ${input.producedQty}; accepted: ${input.acceptedQty}; rejected: ${input.rejectedQty}`
      }]
    }, user);
  }

  async createQualityCheckAct(input: CreateQualityCheckActInput): Promise<SausageDocumentDto> {
    const user = this.getCurrentUser();
    const batch = await this.repos.batches.findById(input.productionBatchId, user.companyId);
    if (!batch) throw this.notFound('Production batch not found');

    return this.createDocumentForUser({
      type: 'QUALITY_CHECK_ACT',
      title: 'Акт контроля качества',
      relatedBatchId: batch.id,
      relatedOrderId: batch.productionOrderId,
      note: input.note,
      lines: [{
        itemKind: 'FINISHED_PRODUCT',
        itemId: batch.finishedProductId,
        itemName: batch.finishedProductName,
        quantityQty: input.checkedQty,
        unit: 'kg',
        note: `Accepted: ${input.acceptedQty}; rejected: ${input.rejectedQty}`
      }]
    }, user);
  }

  private async rawMaterialLine(
    companyId: string,
    rawMaterialId: string,
    quantityQty: number,
    fromLocation?: SausageStockLocation,
    toLocation?: SausageStockLocation,
    note?: string
  ) {
    const raw = await this.repos.rawMaterials.findById(rawMaterialId, companyId);
    if (!raw) throw this.notFound('Raw material not found');

    return {
      itemKind: 'RAW_MATERIAL' as SausageDocumentItemKind,
      itemId: raw.id,
      itemName: raw.name,
      quantityQty,
      unit: raw.unit,
      fromLocation,
      toLocation,
      note
    };
  }

  private async finishedProductLine(
    companyId: string,
    finishedProductId: string,
    quantityQty: number,
    fromLocation?: SausageStockLocation,
    toLocation?: SausageStockLocation,
    note?: string
  ) {
    const product = await this.repos.finishedProducts.findById(finishedProductId, companyId);
    if (!product) throw this.notFound('Finished product not found');

    return {
      itemKind: 'FINISHED_PRODUCT' as SausageDocumentItemKind,
      itemId: product.id,
      itemName: product.name,
      quantityQty,
      unit: product.unit,
      fromLocation,
      toLocation,
      note
    };
  }
}

function getDomainAuditAction(type: SausageDocumentDto['type']) {
  if (type === 'RAW_RECEIPT') return 'RAW_RECEIVED';
  if (type === 'RAW_TRANSFER') return 'RAW_TRANSFERRED';
  if (type === 'WRITE_OFF_ACT') return 'LOSS_WRITTEN_OFF';
  if (type === 'STOCK_ADJUSTMENT') return 'STOCK_ADJUSTED';
  if (type === 'QUALITY_CHECK_ACT') return 'QUALITY_CHECKED';
  return undefined;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
