import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useCrearPedido } from '@/features/pedidos/hooks/usePedidos';
import type { FormaPago } from '@/features/pedidos/types/pedido.types';
import { useCartStore } from '@/store/cartStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total);
  const crearPedidoMutation = useCrearPedido();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim(),
        });
        vaciar();
        navigate('/mis-pedidos', { replace: true });
      } catch (err: unknown) {
        setServerError(handleApiError(err, 'No se pudo confirmar el pedido'));
      }
    },
  });

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos en tu carrito"
        descripcion="Agregá productos antes de confirmar un pedido."
        accion={
          <Link to="/">
            <Button>Volver al catálogo</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Confirmar pedido</h1>
        <p className="text-sm text-zinc-500">Completá los datos de entrega y forma de pago.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-900">Detalle de tu compra</h2>
          {items.map((item) => (
            <div key={item.producto_id} className="flex justify-between text-sm text-zinc-700">
              <span>
                {item.cantidad} x {item.nombre}
              </span>
              <span className="font-medium">
                ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
            <span>Total a pagar</span>
            <span>${total().toLocaleString('es-AR')}</span>
          </div>
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 5 || value.trim().length > 200
                  ? 'La dirección debe tener entre 5 y 200 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="checkout-direccion"
                label="Dirección de entrega"
                placeholder="Av. Siempre Viva 742, Piso 2"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="checkout-pago" className="text-sm font-medium text-zinc-700">
                  Forma de pago
                </label>
                <select
                  id="checkout-pago"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="checkout-notas" className="text-sm font-medium text-zinc-700">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="checkout-notas"
                  rows={3}
                  placeholder="Sin cebolla, timbre roto, etc."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/carrito">
              <Button type="button" variant="secondary">
                Volver al carrito
              </Button>
            </Link>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  isLoading={Boolean(isSubmitting)}
                >
                  Confirmar pedido
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Card>
    </div>
  );
};
