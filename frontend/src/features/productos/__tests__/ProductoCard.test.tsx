import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProductoCard } from '@/features/productos/components/ProductoCard';
import type { Producto } from '@/features/productos/types/producto.types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const productoBase: Producto = {
  id: 1,
  categoria_id: 1,
  nombre: 'Hamburguesa Doble',
  descripcion: 'Con queso cheddar',
  precio_base: 8500,
  imagen_url: '',
  stock: 2,
  disponible: true,
  activo: true,
  categoria: {
    id: 1,
    nombre: 'Hamburguesas',
    descripcion: '',
    activo: true,
  },
};

describe('ProductoCard', () => {
  beforeEach(() => {
    useCartStore.getState().vaciar();
    useAuthStore.setState({ usuario: null, cargando: false, error: null });
  });

  it('agrega el producto al carrito y bloquea al alcanzar el stock máximo', () => {
    render(<ProductoCard producto={productoBase} />);

    const boton = screen.getByRole('button', { name: /Agregar al carrito/i });
    fireEvent.click(boton);
    expect(useCartStore.getState().items[0].cantidad).toBe(1);

    fireEvent.click(boton);
    expect(useCartStore.getState().items[0].cantidad).toBe(2);
    expect(screen.getByRole('button', { name: /Máximo en carrito/i })).toBeDisabled();
  });

  it('deshabilita el botón si el producto no tiene stock', () => {
    render(<ProductoCard producto={{ ...productoBase, stock: 0 }} />);
    expect(screen.getByRole('button', { name: /No disponible/i })).toBeDisabled();
  });

  it('oculta el botón Agregar al carrito cuando el usuario es admin', () => {
    useAuthStore.setState({
      usuario: {
        id: 1,
        username: 'admin',
        full_name: 'Admin',
        email: 'admin@foodstore.com',
        role: 'admin',
        disabled: false,
        created_at: '2026-11-19T00:00:00Z',
      },
      cargando: false,
      error: null,
    });
    render(<ProductoCard producto={productoBase} />);
    expect(screen.queryByRole('button', { name: /Agregar al carrito/i })).not.toBeInTheDocument();
  });
});
