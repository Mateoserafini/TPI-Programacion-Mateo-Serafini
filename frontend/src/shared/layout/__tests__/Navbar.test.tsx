import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { Navbar } from '@/shared/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

describe('Navbar', () => {
  beforeEach(() => {
    useCartStore.getState().vaciar();
  });

  it('oculta Carrito y Mis pedidos para el rol admin', () => {
    useAuthStore.setState({
      usuario: {
        id: 1,
        username: 'admin',
        full_name: 'Administrador Food Store',
        email: 'admin@foodstore.com',
        role: 'admin',
        disabled: false,
        created_at: '2026-11-19T00:00:00Z',
      },
      cargando: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /Mis pedidos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Carrito/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Pedidos/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Resumen/i }).length).toBeGreaterThan(0);
  });

  it('muestra Carrito y Mis pedidos para el rol user', () => {
    useAuthStore.setState({
      usuario: {
        id: 2,
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

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Mis pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Carrito/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Resumen/i })).not.toBeInTheDocument();
  });
});
