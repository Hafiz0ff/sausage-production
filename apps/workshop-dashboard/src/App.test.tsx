import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { sausageProductionApi } from './api/sausageProductionApi';

vi.mock('./api/sausageProductionApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/sausageProductionApi')>();
  return {
    ...actual,
    sausageProductionApi: {
      ...actual.sausageProductionApi,
      getDataset: vi.fn(),
      submitAction: vi.fn(),
    }
  };
});

describe('Sausage Workshop app', () => {
  beforeEach(async () => {
    const { mockSausageProductionData } = await import('./data/mockSausageProductionData');
    vi.mocked(sausageProductionApi.getDataset).mockResolvedValue(structuredClone(mockSausageProductionData));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the standalone product shell and dashboard', async () => {
    render(<App />);

    expect(screen.getByText('Колбасный цех')).toBeTruthy();
    expect(screen.getByText(/Sausage Workshop/)).toBeTruthy();

    await waitFor(() => expect(screen.getByText('Активные заказы')).toBeTruthy());
    expect(screen.getByText('Сырье на складе')).toBeTruthy();
    expect(screen.getByText('Критические остатки')).toBeTruthy();
  });

  it('opens release modal and blocks accepted quantity above produced quantity', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Выпуск продукции/i }));

    expect(screen.getByRole('dialog', { name: /Выпуск готовой продукции/i })).toBeTruthy();
    expect(screen.getByText('Принято на склад не может быть больше произведенного количества.')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Сохранить' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows error state when API fails', async () => {
    vi.mocked(sausageProductionApi.getDataset).mockRejectedValueOnce(new Error('API Down'));

    render(<App />);

    expect(await screen.findByText('Ошибка')).toBeTruthy();
    expect(screen.getByText('Не удалось загрузить данные. Проверьте подключение к API.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Повторить попытку' })).toBeTruthy();
  });
});
