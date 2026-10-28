import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('../services/api', () => ({
  me: () => Promise.reject(new Error('Signed out')),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  chat: vi.fn(),
  request: vi.fn(),
}));

describe('public site', () => {
  it('explains the product and routes visitors to care options', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('heading', { name: /understand your health/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /find a doctor/i })[0]).toHaveAttribute(
      'href',
      '/doctors',
    );
    expect(screen.getByText(/cannot diagnose you/i)).toBeInTheDocument();
  });

  it('renders hospital registration option and fields', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const hospitalBtn = screen.getByRole('button', { name: /^hospital$/i });
    expect(hospitalBtn).toBeInTheDocument();
    fireEvent.click(hospitalBtn);

    expect(screen.getByPlaceholderText(/e\.g\. City Health Hospital/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Mumbai or Demo City/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cardiology, Neurology, Pediatrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Hospital accounts remain pending review/i)).toBeInTheDocument();
  });
});
