import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarritoPage } from '@/features/pedidos/pages/CarritoPage';
import { CheckoutPage } from '@/features/pedidos/pages/CheckoutPage';
import { CatalogoPage } from '@/features/productos/pages/CatalogoPage';
import { axiosInstance } from '@/shared/api/axiosInstance';
import { MainLayout } from '@/shared/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

vi.mock('@/shared/api/axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Flujo general Frontend (Catálogo -> Carrito -> Checkout)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.getState().vaciar();
    useAuthStore.setState({
      usuario: {
        id: 1,
        username: 'cliente',
        full_name: 'Cliente Demo',
        email: 'cliente@demo.com',
        role: 'user',
        disabled: false,
        created_at: '2026-11-19T00:00:00Z',
      },
      cargando: false,
      error: null,
    });
  });

  it('permite agregar desde catálogo, navegar al carrito y confirmar pedido', async () => {
    vi.mocked(axiosInstance.get).mockImplementation(async (url) => {
      if (url === '/categorias') {
        return {
          data: [{ id: 1, nombre: 'Hamburguesas', descripcion: '', activo: true }],
        };
      }
      if (url === '/productos') {
        return {
          data: {
            total: 1,
            items: [
              {
                id: 5,
                categoria_id: 1,
                nombre: 'Burger Test',
                descripcion: 'Rica',
                precio_base: 7500,
                imagen_url: '',
                stock: 10,
                disponible: true,
                activo: true,
                categoria: { id: 1, nombre: 'Hamburguesas', descripcion: '', activo: true },
              },
            ],
          },
        };
      }
      return { data: {} };
    });

    vi.mocked(axiosInstance.post).mockResolvedValueOnce({
      data: {
        id: 99,
        usuario_id: 1,
        estado: 'PENDIENTE',
        forma_pago: 'EFECTIVO',
        direccion_entrega: 'Av. Mayo 1234',
        notas: '',
        total: 7500,
        created_at: '2026-11-19T12:00:00Z',
        updated_at: '2026-11-19T12:00:00Z',
        items: [],
      },
    });

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<CatalogoPage />} />
              <Route path="/carrito" element={<CarritoPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/mis-pedidos" element={<div>Mis Pedidos Destino</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Burger Test')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Agregar al carrito/i }));
    fireEvent.click(screen.getByRole('link', { name: /Carrito/i }));

    await waitFor(() => {
      expect(screen.getByText('Tu carrito')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar pedido/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Dirección de entrega/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Dirección de entrega/i), {
      target: { value: 'Av. Mayo 1234' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar pedido/i }));

    await waitFor(() => {
      expect(screen.getByText('Mis Pedidos Destino')).toBeInTheDocument();
    });

    expect(axiosInstance.post).toHaveBeenCalledWith('/pedidos', {
      items: [{ producto_id: 5, cantidad: 1 }],
      forma_pago: 'EFECTIVO',
      direccion_entrega: 'Av. Mayo 1234',
      notas: '',
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
