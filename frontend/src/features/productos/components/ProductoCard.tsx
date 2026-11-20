import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Producto } from '@/features/productos/types/producto.types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const agregar = useCartStore((state) => state.agregar);
  const itemEnCarrito = useCartStore((state) =>
    state.items.find((i) => i.producto_id === producto.id)
  );
  const esAdmin = usuario?.role === 'admin';

  const sinStock = producto.stock <= 0;
  const noDisponible = !producto.disponible || sinStock;
  const limiteAlcanzado = itemEnCarrito ? itemEnCarrito.cantidad >= producto.stock : false;

  const handleAgregar = () => {
    agregar(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
        stock: producto.stock,
        imagen_url: producto.imagen_url,
      },
      1
    );
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-video w-full bg-zinc-100 overflow-hidden">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 gap-3">
        <div>
          <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
            {producto.categoria.nombre}
          </span>
          <h3 className="mt-2 text-base font-semibold text-zinc-900">{producto.nombre}</h3>
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{producto.descripcion}</p>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-zinc-900">
              ${producto.precio_base.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-zinc-500">
              {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
            </p>
          </div>

          {!esAdmin && (
            <Button
              onClick={handleAgregar}
              disabled={noDisponible || limiteAlcanzado}
            >
              <ShoppingBag className="h-4 w-4" />
              {noDisponible
                ? 'No disponible'
                : limiteAlcanzado
                  ? 'Máximo en carrito'
                  : 'Agregar al carrito'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
