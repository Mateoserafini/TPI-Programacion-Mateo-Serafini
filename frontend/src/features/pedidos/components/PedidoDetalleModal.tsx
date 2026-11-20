import React from 'react';
import type { Pedido } from '@/features/pedidos/types/pedido.types';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Modal } from '@/shared/ui/Modal';

interface PedidoDetalleModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export const PedidoDetalleModal: React.FC<PedidoDetalleModalProps> = ({ pedido, onClose }) => {
  return (
    <Modal
      isOpen={pedido !== null}
      onClose={onClose}
      title={pedido ? `Detalle del pedido #${pedido.id}` : ''}
    >
      {pedido && (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Estado</span>
            <BadgeEstado estado={pedido.estado} />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3 border border-zinc-200">
            <div>
              <p className="text-xs text-zinc-500">Forma de pago</p>
              <p className="font-medium text-zinc-900">{pedido.forma_pago}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Fecha</p>
              <p className="font-medium text-zinc-900">
                {new Date(pedido.created_at).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-zinc-500">Dirección de entrega</p>
              <p className="font-medium text-zinc-900">{pedido.direccion_entrega}</p>
            </div>
            {pedido.notas && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Notas</p>
                <p className="text-zinc-800">{pedido.notas}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Ítems del pedido</h4>
            <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
              {pedido.items.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{item.nombre_producto}</p>
                    <p className="text-xs text-zinc-500">
                      {item.cantidad} x ${item.precio_unitario.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <p className="font-semibold text-zinc-900">
                    ${item.subtotal.toLocaleString('es-AR')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold">
            <span>Total</span>
            <span>${pedido.total.toLocaleString('es-AR')}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
