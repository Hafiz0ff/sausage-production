import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Sausage Workshop app', () => {
  it('renders the standalone product shell and dashboard', async () => {
    render(<App />);

    expect(screen.getByText('Колбасный цех')).toBeInTheDocument();
    expect(screen.getByText('Sausage Workshop')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Активные заказы')).toBeInTheDocument());
    expect(screen.getByText('Сырье на складе')).toBeInTheDocument();
    expect(screen.getByText('Критические остатки')).toBeInTheDocument();
  });

  it('opens release modal and blocks accepted quantity above produced quantity', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Выпуск продукции/i }));

    expect(screen.getByRole('dialog', { name: /Выпуск готовой продукции/i })).toBeInTheDocument();
    expect(screen.getByText('Принято на склад не может быть больше произведенного количества.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
  });
});
