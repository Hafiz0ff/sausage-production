import { Bell, CalendarDays, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ModalKind, ScreenKey } from '../domain/types';
import { getNavigationItem, navigationGroups } from '../state/navigation';

interface AppShellProps {
  activeScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
  onOpenModal: (kind: ModalKind) => void;
  children: ReactNode;
}

export function AppShell({ activeScreen, onNavigate, onOpenModal, children }: AppShellProps) {
  const activeItem = getNavigationItem(activeScreen);
  const primaryAction = activeItem.primaryAction;
  const primaryModal = primaryAction.modal;

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Навигация">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">SW</div>
            <div className="logo-text">
              Колбасный цех
              <span>Sausage Workshop</span>
            </div>
          </div>
        </div>
        <nav className="nav-section">
          {navigationGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`nav-item ${activeScreen === item.key ? 'active' : ''}`}
                    onClick={() => onNavigate(item.key)}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-block">
            <span className="user-avatar">АС</span>
            <span className="user-info">
              <span className="user-name">Алишер Саидов</span>
              <span className="user-role">Мастер цеха</span>
            </span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="page-title">{activeItem.label}</div>
            <div className="page-subtitle">Контур: /api/sausage-production</div>
          </div>
          <div className="topbar-actions">
            <button type="button" className="btn btn-muted" aria-label="Период">
              <CalendarDays size={16} />
              <span>24.06.2026</span>
            </button>
            <button type="button" className="btn btn-icon" aria-label="Уведомления">
              <Bell size={16} />
              <span className="notification-dot" />
            </button>
            {primaryModal ? (
              <button type="button" className="btn btn-primary" onClick={() => onOpenModal(primaryModal)}>
                <Plus size={16} />
                <span>{primaryAction.label}</span>
              </button>
            ) : (
              <button type="button" className="btn btn-primary">
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        </header>

        <div className="mobile-nav" aria-label="Быстрая навигация">
          {navigationGroups.flatMap((group) => group.items).map((item) => (
            <button
              key={item.key}
              type="button"
              className={`mobile-nav-item ${activeScreen === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}
