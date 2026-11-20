import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
  imagen_url: string;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const current = get().items;
        const existing = current.find((i) => i.producto_id === item.producto_id);
        if (existing) {
          const nextQty = Math.min(existing.cantidad + cantidad, item.stock);
          set({
            items: current.map((i) =>
              i.producto_id === item.producto_id
                ? { ...i, cantidad: Math.max(1, nextQty), stock: item.stock }
                : i
            ),
          });
        } else {
          const initialQty = Math.min(Math.max(1, cantidad), item.stock);
          if (initialQty > 0) {
            set({
              items: [...current, { ...item, cantidad: initialQty }],
            });
          }
        }
      },

      quitar: (productoId) => {
        set({
          items: get().items.filter((i) => i.producto_id !== productoId),
        });
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: Math.min(cantidad, i.stock) }
              : i
          ),
        });
      },

      vaciar: () => {
        set({ items: [] });
      },

      total: () => {
        return get().items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0);
      },
    }),
    {
      name: 'food-store-cart',
    }
  )
);
