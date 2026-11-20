import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '@/store/cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.getState().vaciar();
  });

  it('agrega productos respetando el stock máximo y calcula el total', () => {
    useCartStore.getState().agregar(
      {
        producto_id: 1,
        nombre: 'Hamburguesa',
        precio_unitario: 5000,
        stock: 3,
        imagen_url: '',
      },
      2
    );
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].cantidad).toBe(2);
    expect(useCartStore.getState().total()).toBe(10000);

    useCartStore.getState().agregar(
      {
        producto_id: 1,
        nombre: 'Hamburguesa',
        precio_unitario: 5000,
        stock: 3,
        imagen_url: '',
      },
      5
    );
    expect(useCartStore.getState().items[0].cantidad).toBe(3);
    expect(useCartStore.getState().total()).toBe(15000);
  });

  it('permite cambiar cantidad, quitar y vaciar el carrito', () => {
    useCartStore.getState().agregar(
      {
        producto_id: 10,
        nombre: 'Papas',
        precio_unitario: 2500,
        stock: 10,
        imagen_url: '',
      },
      1
    );
    useCartStore.getState().cambiarCantidad(10, 4);
    expect(useCartStore.getState().items[0].cantidad).toBe(4);

    useCartStore.getState().cambiarCantidad(10, 0);
    expect(useCartStore.getState().items).toHaveLength(0);

    useCartStore.getState().agregar(
      {
        producto_id: 11,
        nombre: 'Bebida',
        precio_unitario: 1500,
        stock: 5,
        imagen_url: '',
      },
      2
    );
    useCartStore.getState().vaciar();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().total()).toBe(0);
  });
});
