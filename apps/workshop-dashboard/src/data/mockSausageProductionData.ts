import type { WorkshopDataset } from '../domain/types';

export const mockSausageProductionData: WorkshopDataset = {
  rawMaterials: [
    { id: 'rm-1', name: 'Говядина жилованная', group: 'Мясо', warehouseKg: 820, workshopKg: 145, reservedKg: 260, minKg: 500, status: 'ok', supplier: 'Мясокомбинат Север' },
    { id: 'rm-2', name: 'Свинина полужирная', group: 'Мясо', warehouseKg: 410, workshopKg: 95, reservedKg: 180, minKg: 450, status: 'low', supplier: 'Ферма Восток' },
    { id: 'rm-3', name: 'Шпик боковой', group: 'Жиросырье', warehouseKg: 120, workshopKg: 24, reservedKg: 70, minKg: 220, status: 'critical', supplier: 'Ферма Восток' },
    { id: 'rm-4', name: 'Соль нитритная', group: 'Добавки', warehouseKg: 78, workshopKg: 12, reservedKg: 18, minKg: 60, status: 'ok', supplier: 'FoodChem' },
    { id: 'rm-5', name: 'Оболочка коллагеновая', group: 'Упаковка', warehouseKg: 34, workshopKg: 8, reservedKg: 14, minKg: 50, status: 'critical', supplier: 'Casings Pro' },
    { id: 'rm-6', name: 'Перец черный', group: 'Специи', warehouseKg: 26, workshopKg: 4, reservedKg: 7, minKg: 20, status: 'ok', supplier: 'Spice Trade' },
  ],
  finishedProducts: [
    { id: 'fp-1', name: 'Докторская ГОСТ', sku: 'SW-DOC-500', stockKg: 1240, stockPcs: 2480, reservedKg: 410, shelfLifeDays: 20, status: 'ok' },
    { id: 'fp-2', name: 'Сервелат Финский', sku: 'SW-SER-350', stockKg: 420, stockPcs: 1200, reservedKg: 180, shelfLifeDays: 35, status: 'ok' },
    { id: 'fp-3', name: 'Сосиски Молочные', sku: 'SW-MIL-450', stockKg: 180, stockPcs: 400, reservedKg: 130, shelfLifeDays: 15, status: 'low' },
    { id: 'fp-4', name: 'Краковская п/к', sku: 'SW-KRK-700', stockKg: 86, stockPcs: 123, reservedKg: 60, shelfLifeDays: 28, status: 'critical' },
  ],
  clients: [
    { id: 'cl-1', name: 'Маркет Центральный', segment: 'Retail', phone: '+992 900 11 22 33', balance: '18 400 TJS', lastOrder: '2026-06-24' },
    { id: 'cl-2', name: 'HoReCa Group Dushanbe', segment: 'HoReCa', phone: '+992 901 44 55 66', balance: '0 TJS', lastOrder: '2026-06-23' },
    { id: 'cl-3', name: 'Сеть Восток', segment: 'Wholesale', phone: '+992 918 70 10 10', balance: '72 900 TJS', lastOrder: '2026-06-22' },
    { id: 'cl-4', name: 'Внутренний', segment: 'Internal', phone: '-', balance: '0 TJS', lastOrder: '2026-06-24' },
  ],
  recipes: [
    {
      id: 'rc-1',
      productName: 'Докторская ГОСТ',
      outputKg: 100,
      expectedYieldPercent: 92,
      items: [
        { materialId: 'rm-1', materialName: 'Говядина жилованная', quantityKg: 32 },
        { materialId: 'rm-2', materialName: 'Свинина полужирная', quantityKg: 48 },
        { materialId: 'rm-4', materialName: 'Соль нитритная', quantityKg: 2.1 },
        { materialId: 'rm-5', materialName: 'Оболочка коллагеновая', quantityKg: 3.4 },
      ],
    },
    {
      id: 'rc-2',
      productName: 'Сервелат Финский',
      outputKg: 100,
      expectedYieldPercent: 88,
      items: [
        { materialId: 'rm-1', materialName: 'Говядина жилованная', quantityKg: 42 },
        { materialId: 'rm-3', materialName: 'Шпик боковой', quantityKg: 22 },
        { materialId: 'rm-6', materialName: 'Перец черный', quantityKg: 1.2 },
      ],
    },
  ],
  orders: [
    { id: 'po-1', number: 'PO-260624-001', productName: 'Докторская ГОСТ', quantityKg: 620, clientName: 'Маркет Центральный', status: 'in_progress', progress: 64, dueAt: '2026-06-24 18:00', shift: 'Смена А' },
    { id: 'po-2', number: 'PO-260624-002', productName: 'Сосиски Молочные', quantityKg: 440, clientName: 'HoReCa Group Dushanbe', status: 'waiting_materials', progress: 24, dueAt: '2026-06-24 20:00', shift: 'Смена Б' },
    { id: 'po-3', number: 'PO-260624-003', productName: 'Краковская п/к', quantityKg: 260, clientName: 'Внутренний', status: 'planned', progress: 0, dueAt: '2026-06-25 10:00', shift: 'Смена А' },
    { id: 'po-4', number: 'PO-250624-014', productName: 'Сервелат Финский', quantityKg: 380, clientName: 'Сеть Восток', status: 'released', progress: 100, dueAt: '2026-06-24 12:30', shift: 'Смена А' },
  ],
  batches: [
    { id: 'bt-1', batchNo: 'B-260624-07', orderNo: 'PO-260624-001', productName: 'Докторская ГОСТ', producedKg: 312, acceptedKg: 304, rejectedKg: 8, releasedAt: '2026-06-24 13:42', yieldPercent: 91.8 },
    { id: 'bt-2', batchNo: 'B-260624-06', orderNo: 'PO-250624-014', productName: 'Сервелат Финский', producedKg: 380, acceptedKg: 371, rejectedKg: 9, releasedAt: '2026-06-24 11:20', yieldPercent: 88.4 },
    { id: 'bt-3', batchNo: 'B-250624-11', orderNo: 'PO-250624-012', productName: 'Сосиски Молочные', producedKg: 540, acceptedKg: 529, rejectedKg: 11, releasedAt: '2026-06-23 19:10', yieldPercent: 90.2 },
  ],
  movements: [
    { id: 'mv-1', docNo: 'MV-260624-045', type: 'transfer_to_workshop', itemName: 'Говядина жилованная', quantityKg: 180, from: 'Склад сырья', to: 'Цех', operator: 'АС', createdAt: '2026-06-24 12:05' },
    { id: 'mv-2', docNo: 'MV-260624-046', type: 'consume', itemName: 'Свинина полужирная', quantityKg: 136, from: 'Цех', to: 'Производство', operator: 'МК', createdAt: '2026-06-24 12:48' },
    { id: 'mv-3', docNo: 'MV-260624-047', type: 'release', itemName: 'Докторская ГОСТ', quantityKg: 304, from: 'Цех', to: 'Склад готовой продукции', operator: 'АС', createdAt: '2026-06-24 13:52' },
    { id: 'mv-4', docNo: 'MV-260624-048', type: 'write_off', itemName: 'Оболочка коллагеновая', quantityKg: 3.5, from: 'Цех', to: 'Списание', operator: 'МК', createdAt: '2026-06-24 14:05' },
  ],
  losses: [
    { id: 'ls-1', docNo: 'LS-260624-009', itemName: 'Докторская ГОСТ', reason: 'thermal_loss', quantityKg: 8, cost: '412 TJS', createdAt: '2026-06-24 13:45', operator: 'АС' },
    { id: 'ls-2', docNo: 'LS-260624-010', itemName: 'Оболочка коллагеновая', reason: 'defect', quantityKg: 3.5, cost: '96 TJS', createdAt: '2026-06-24 14:05', operator: 'МК' },
    { id: 'ls-3', docNo: 'LS-250624-021', itemName: 'Сосиски Молочные', reason: 'calibration', quantityKg: 11, cost: '340 TJS', createdAt: '2026-06-23 19:12', operator: 'АС' },
  ],
  dashboard: {
    metrics: [
      { id: 'raw-warehouse', label: 'Сырье на складе', value: '1 488', unit: 'кг', delta: '+8.4%', tone: 'accent' },
      { id: 'raw-workshop', label: 'Сырье в цехе', value: '288', unit: 'кг', delta: '-12.0%', tone: 'warning' },
      { id: 'finished', label: 'Готовая продукция', value: '1 926', unit: 'кг', delta: '+304 кг', tone: 'success' },
      { id: 'losses', label: 'Потери сегодня', value: '11.5', unit: 'кг', delta: '0.73%', tone: 'danger' },
    ],
    quickActions: [
      { id: 'transfer', label: 'Передача в цех', description: 'Склад -> цех' },
      { id: 'release', label: 'Выпуск продукции', description: 'Цех -> ГП' },
      { id: 'writeOff', label: 'Списание сырья', description: 'Потери и брак' },
      { id: 'order', label: 'Производственный заказ', description: 'План выпуска' },
    ],
    activeOrders: [],
    criticalRawStock: [],
    hourlyOutput: [
      { hour: '08', valueKg: 120 },
      { hour: '09', valueKg: 210 },
      { hour: '10', valueKg: 160 },
      { hour: '11', valueKg: 340 },
      { hour: '12', valueKg: 250 },
      { hour: '13', valueKg: 304 },
      { hour: '14', valueKg: 180 },
    ],
    events: [
      { id: 'ev-1', text: 'Партия B-260624-07 принята на склад ГП', meta: '13:52 / АС', tone: 'success' },
      { id: 'ev-2', text: 'Критический остаток: оболочка коллагеновая', meta: '13:18 / система', tone: 'danger' },
      { id: 'ev-3', text: 'Передано в цех 180 кг говядины', meta: '12:05 / АС', tone: 'accent' },
      { id: 'ev-4', text: 'Заказ PO-260624-002 ожидает сырье', meta: '11:40 / система', tone: 'warning' },
    ],
    finishedProducts: [],
    losses: [],
  },
};

mockSausageProductionData.dashboard.activeOrders = mockSausageProductionData.orders;
mockSausageProductionData.dashboard.criticalRawStock = mockSausageProductionData.rawMaterials.filter((item) => item.status !== 'ok');
mockSausageProductionData.dashboard.finishedProducts = mockSausageProductionData.finishedProducts;
mockSausageProductionData.dashboard.losses = mockSausageProductionData.losses;
