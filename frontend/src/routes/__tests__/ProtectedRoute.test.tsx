import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: null, cargando: false, error: null });
  });

  it('redirige a /login cuando no hay sesión', () => {
    render(
      <MemoryRouter initialEntries={['/mis-pedidos']}>
        <Routes>
          <Route path="/login" element={<div>Pantalla Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/mis-pedidos" element={<div>Mis Pedidos</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Pantalla Login')).toBeInTheDocument();
  });

  it('redirige a /unauthorized cuando el rol no está permitido', () => {
    useAuthStore.setState({
      usuario: {
        id: 2,
        username: 'cliente',
        full_name: 'Cliente',
        email: 'c@c.com',
        role: 'user',
        disabled: false,
        created_at: '2026-11-19T00:00:00Z',
      },
      cargando: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/resumen']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Sin Permiso</div>} />
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<div>Admin Resumen</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Sin Permiso')).toBeInTheDocument();
  });
});
