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
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [dataset, setDataset] = useState<WorkshopDataset | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);
  const [releaseProducedKg, setReleaseProducedKg] = useState(300);
  const [releaseAcceptedKg, setReleaseAcceptedKg] = useState(304);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    void sausageProductionApi.getDataset().then(setDataset);
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

    const result = await sausageProductionApi.submitAction(activeModal);
    setSubmittedMessage(result.message);
  };

  if (!dataset) {
    return (
      <main className="loading-shell">
        <h1>Колбасный цех</h1>
        <p>Sausage Workshop</p>
      </main>
    );
  }

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen} onOpenModal={setActiveModal}>
      {activeScreen === 'dashboard' ? <DashboardScreen dashboard={dataset.dashboard} onOpenModal={setActiveModal} /> : null}
      {activeScreen === 'orders' ? <OrdersScreen orders={dataset.orders} /> : null}
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
