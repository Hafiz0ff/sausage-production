import type { ModalKind, ScreenKey } from '../domain/types';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  Gauge,
  PackageCheck,
  PackageMinus,
  PackagePlus,
  ScrollText,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';

export interface NavigationItem {
  key: ScreenKey;
  label: string;
  shortLabel: string;
  primaryAction: {
    label: string;
    modal: ModalKind | null;
  };
  icon: typeof Gauge;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Основное',
    items: [
      { key: 'dashboard', label: 'Дашборд', shortLabel: 'Дашборд', primaryAction: { label: 'Новый заказ', modal: 'order' }, icon: Gauge },
      { key: 'orders', label: 'Заказы на производство', shortLabel: 'Заказы', primaryAction: { label: 'Новый заказ', modal: 'order' }, icon: ClipboardList },
      { key: 'batches', label: 'Партии выпуска', shortLabel: 'Партии', primaryAction: { label: 'Оформить выпуск', modal: 'release' }, icon: PackageCheck },
      { key: 'transfers', label: 'Перемещения', shortLabel: 'Перемещения', primaryAction: { label: 'Передать в цех', modal: 'transfer' }, icon: Truck },
    ],
  },
  {
    label: 'Справочники',
    items: [
      { key: 'rawMaterials', label: 'Сырье', shortLabel: 'Сырье', primaryAction: { label: 'Добавить сырье', modal: 'rawMaterial' }, icon: Warehouse },
      { key: 'finishedProducts', label: 'Готовая продукция', shortLabel: 'Продукция', primaryAction: { label: 'Добавить продукт', modal: 'finishedProduct' }, icon: Boxes },
      { key: 'recipes', label: 'Рецептуры', shortLabel: 'Рецептуры', primaryAction: { label: 'Новая рецептура', modal: 'recipe' }, icon: ScrollText },
      { key: 'clients', label: 'Клиенты', shortLabel: 'Клиенты', primaryAction: { label: 'Новый клиент', modal: 'client' }, icon: Users },
    ],
  },
  {
    label: 'Отчеты',
    items: [
      { key: 'balances', label: 'Остатки', shortLabel: 'Остатки', primaryAction: { label: 'Приемка', modal: 'receipt' }, icon: PackagePlus },
      { key: 'losses', label: 'Потери', shortLabel: 'Потери', primaryAction: { label: 'Списание', modal: 'writeOff' }, icon: PackageMinus },
      { key: 'analytics', label: 'Аналитика', shortLabel: 'Аналитика', primaryAction: { label: 'Обновить', modal: null }, icon: BarChart3 },
    ],
  },
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);

export function getNavigationItem(key: ScreenKey): NavigationItem {
  return navigationItems.find((item) => item.key === key) ?? navigationItems[0];
}
