import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

export const CarritoPage: React.FC = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total);

  if (usuario?.role === 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Tu carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Explorá el catálogo para agregar comidas a tu pedido."
          accion={
            <Link to="/">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-orange-600" />
          Tu carrito
        </h1>
        <Button variant="ghost" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="h-16 w-16 rounded-lg object-cover bg-zinc-100"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-zinc-100" />
                )}
                <div>
                  <h3 className="font-semibold text-zinc-900">{item.nombre}</h3>
                  <p className="text-sm text-zinc-500">
                    ${item.precio_unitario.toLocaleString('es-AR')} c/u
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    className="p-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                  <button
                    type="button"
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    className="p-1 text-zinc-600 hover:text-zinc-900 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="w-24 text-right font-semibold text-zinc-900">
                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                </p>

                <button
                  type="button"
                  onClick={() => quitar(item.producto_id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Resumen</h2>
          <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base font-bold">
            <span>Total</span>
            <span>${total().toLocaleString('es-AR')}</span>
          </div>
          <Link to="/checkout" className="block">
            <Button className="w-full">Confirmar pedido</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
