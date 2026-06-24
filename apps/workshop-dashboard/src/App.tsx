import { useEffect, useMemo, useState } from 'react';
import { sausageProductionApi } from './api/sausageProductionApi';
import { AppShell } from './components/AppShell';
import { Modal } from './components/Modal';
import type { ModalKind, ScreenKey, WorkshopDataset } from './domain/types';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { BalancesScreen } from './screens/BalancesScreen';
import { BatchesScreen } from './screens/BatchesScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { FinishedProductsScreen } from './screens/FinishedProductsScreen';
import { LossesScreen } from './screens/LossesScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { SalesOrdersScreen } from './screens/SalesOrdersScreen';
import { ProductionDemandScreen } from './screens/ProductionDemandScreen';
import { RawMaterialsScreen } from './screens/RawMaterialsScreen';
import { RecipesScreen } from './screens/RecipesScreen';
import { TransfersScreen } from './screens/TransfersScreen';

const modalTitles: Record<ModalKind, string> = {
  transfer: 'Передача сырья в цех',
  release: 'Выпуск готовой продукции',
  writeOff: 'Списание сырья',
  order: 'Производственный заказ',
  receipt: 'Приемка сырья',
  rawMaterial: 'Добавить сырье',
  finishedProduct: 'Добавить готовую продукцию',
  recipe: 'Новая рецептура',
  client: 'Новый клиент',
  salesOrder: 'Новый заказ клиента',
  createDemandOrder: 'Новый производственный заказ',
  qualityCheck: 'Контроль качества',
  approveLoss: 'Согласовать потерю'
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [dataset, setDataset] = useState<WorkshopDataset | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);
  const [releaseProducedKg, setReleaseProducedKg] = useState(300);
  const [releaseAcceptedKg, setReleaseAcceptedKg] = useState(304);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDataset = () => {
    setIsLoading(true);
    setError(null);
    sausageProductionApi.getDataset()
      .then(setDataset)
      .catch((err) => {
        console.error(err);
        setError('Не удалось загрузить данные. Проверьте подключение к API.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  const releaseError = useMemo(() => {
    if (activeModal !== 'release') {
      return null;
    }

    return releaseAcceptedKg > releaseProducedKg ? 'Принято на склад не может быть больше произведенного количества.' : null;
  }, [activeModal, releaseAcceptedKg, releaseProducedKg]);

  const closeModal = () => {
    setActiveModal(null);
    setSubmittedMessage(null);
  };

  const submitModal = async () => {
    if (!activeModal || releaseError) {
      return;
    }

    try {
      const result = await sausageProductionApi.submitAction(activeModal);
      setSubmittedMessage(result.message);
      fetchDataset(); // Refresh data after successful action
    } catch (err: any) {
      console.error(err);
      setSubmittedMessage(`Ошибка выполнения операции: ${err.message || 'Неизвестная ошибка'}`);
    }
  };

  const runDatasetAction = async (action: () => Promise<void>) => {
    setSubmittedMessage(null);
    try {
      await action();
      fetchDataset();
    } catch (err: any) {
      console.error(err);
      setError(err?.error?.message || err?.message || 'Не удалось выполнить операцию.');
    }
  };

  if (error) {
    return (
      <main className="loading-shell" style={{ color: 'var(--color-danger)' }}>
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchDataset} style={{ marginTop: '1rem' }}>Повторить попытку</button>
      </main>
    );
  }

  if (isLoading || !dataset) {
    return (
      <main className="loading-shell">
        <h1>Колбасный цех</h1>
        <p>Sausage Workshop (Загрузка...)</p>
      </main>
    );
  }

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen} onOpenModal={setActiveModal}>
      {activeScreen === 'dashboard' ? <DashboardScreen dashboard={dataset.dashboard} onOpenModal={setActiveModal} /> : null}
      {activeScreen === 'orders' ? <OrdersScreen orders={dataset.orders} /> : null}
      {activeScreen === 'salesOrders' ? (
        <SalesOrdersScreen
          salesOrders={dataset.salesOrders}
          onReserve={(orderId, itemId, quantityQty) => runDatasetAction(() => sausageProductionApi.reserveSalesOrderItem(orderId, itemId, quantityQty))}
          onRelease={(reservationId) => runDatasetAction(() => sausageProductionApi.releaseReservation(reservationId))}
          onComplete={(reservationId) => runDatasetAction(() => sausageProductionApi.completeReservation(reservationId))}
        />
      ) : null}
      {activeScreen === 'productionDemand' ? (
        <ProductionDemandScreen
          productionDemand={dataset.productionDemand}
          onCreateProductionOrder={(finishedProductId, quantityQty) =>
            runDatasetAction(() => sausageProductionApi.createProductionOrderFromDemand(finishedProductId, quantityQty))
          }
        />
      ) : null}
      {activeScreen === 'batches' ? <BatchesScreen batches={dataset.batches} /> : null}
      {activeScreen === 'transfers' ? <TransfersScreen movements={dataset.movements} /> : null}
      {activeScreen === 'rawMaterials' ? <RawMaterialsScreen rawMaterials={dataset.rawMaterials} /> : null}
      {activeScreen === 'finishedProducts' ? <FinishedProductsScreen finishedProducts={dataset.finishedProducts} /> : null}
      {activeScreen === 'recipes' ? <RecipesScreen recipes={dataset.recipes} /> : null}
      {activeScreen === 'clients' ? <ClientsScreen clients={dataset.clients} /> : null}
      {activeScreen === 'balances' ? <BalancesScreen rawMaterials={dataset.rawMaterials} finishedProducts={dataset.finishedProducts} /> : null}
      {activeScreen === 'losses' ? <LossesScreen losses={dataset.losses} /> : null}
      {activeScreen === 'analytics' ? <AnalyticsScreen dataset={dataset} /> : null}

      {activeModal ? (
        <Modal
          title={modalTitles[activeModal]}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="btn" onClick={closeModal}>
                Отмена
              </button>
              <button type="button" className="btn btn-primary" onClick={submitModal} disabled={Boolean(releaseError)}>
                Сохранить
              </button>
            </>
          }
        >
          <OperationForm
            kind={activeModal}
            releaseProducedKg={releaseProducedKg}
            releaseAcceptedKg={releaseAcceptedKg}
            releaseError={releaseError}
            submittedMessage={submittedMessage}
            onProducedChange={setReleaseProducedKg}
            onAcceptedChange={setReleaseAcceptedKg}
          />
        </Modal>
      ) : null}
    </AppShell>
  );
}

interface OperationFormProps {
  kind: ModalKind;
  releaseProducedKg: number;
  releaseAcceptedKg: number;
  releaseError: string | null;
  submittedMessage: string | null;
  onProducedChange: (value: number) => void;
  onAcceptedChange: (value: number) => void;
}

function OperationForm({
  kind,
  releaseProducedKg,
  releaseAcceptedKg,
  releaseError,
  submittedMessage,
  onProducedChange,
  onAcceptedChange,
}: OperationFormProps) {
  if (kind === 'release') {
    return (
      <div className="form-grid">
        <label className="form-group">
          <span className="form-label">Партия</span>
          <select className="form-input" defaultValue="B-260624-07">
            <option>B-260624-07 / Докторская ГОСТ</option>
            <option>B-260624-06 / Сервелат Финский</option>
          </select>
        </label>
        <label className="form-group">
          <span className="form-label">Произведено, кг</span>
          <input className="form-input" type="number" value={releaseProducedKg} onChange={(event) => onProducedChange(Number(event.target.value))} />
        </label>
        <label className="form-group">
          <span className="form-label">Принято на склад, кг</span>
          <input className="form-input" type="number" value={releaseAcceptedKg} onChange={(event) => onAcceptedChange(Number(event.target.value))} />
        </label>
        <label className="form-group">
          <span className="form-label">Брак, кг</span>
          <input className="form-input" type="number" value={Math.max(releaseProducedKg - releaseAcceptedKg, 0)} readOnly />
        </label>
        {releaseError ? <p className="form-error">{releaseError}</p> : null}
        {submittedMessage ? <p className="form-success">{submittedMessage}</p> : null}
      </div>
    );
  }

  if (kind === 'qualityCheck') {
    return (
      <div className="form-grid">
        <label className="form-group">
          <span className="form-label">Партия</span>
          <select className="form-input" defaultValue="B-260624-07">
            <option>B-260624-07 / Докторская ГОСТ</option>
            <option>B-260624-06 / Сервелат Финский</option>
          </select>
        </label>
        <label className="form-group">
          <span className="form-label">Проверено, кг</span>
          <input className="form-input" type="number" defaultValue={100} />
        </label>
        <label className="form-group">
          <span className="form-label">Принято, кг</span>
          <input className="form-input" type="number" defaultValue={95} />
        </label>
        <label className="form-group">
          <span className="form-label">Брак, кг</span>
          <input className="form-input" type="number" defaultValue={5} />
        </label>
        {submittedMessage ? <p className="form-success">{submittedMessage}</p> : null}
      </div>
    );
  }

  if (kind === 'approveLoss') {
    return (
      <div className="form-grid">
        <label className="form-group">
          <span className="form-label">Примечание</span>
          <textarea className="form-input form-textarea" defaultValue="Одобрено" />
        </label>
        {submittedMessage ? <p className="form-success">{submittedMessage}</p> : null}
      </div>
    );
  }

  return (
    <div className="form-grid">
      <label className="form-group">
        <span className="form-label">Документ</span>
        <input className="form-input" defaultValue="AUTO" />
      </label>
      <label className="form-group">
        <span className="form-label">Номенклатура</span>
        <input className="form-input" defaultValue={kind === 'client' ? 'Новый клиент' : 'Говядина жилованная'} />
      </label>
      <label className="form-group">
        <span className="form-label">Количество</span>
        <input className="form-input" type="number" defaultValue={kind === 'order' ? 500 : 120} />
      </label>
      <label className="form-group">
        <span className="form-label">Комментарий</span>
        <textarea className="form-input form-textarea" defaultValue="Операция будет отправлена в mock API." />
      </label>
      {submittedMessage ? <p className="form-success">{submittedMessage}</p> : null}
    </div>
  );
}
