import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { PedidoDetalleModal } from '@/features/pedidos/components/PedidoDetalleModal';
import { useCambiarEstadoPedido, usePedidos } from '@/features/pedidos/hooks/usePedidos';
import type { Pedido } from '@/features/pedidos/types/pedido.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Skeleton } from '@/shared/components/Skeleton';
import { BadgeEstado, EstadoPedido } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';

export const AdminPedidosPage: React.FC = () => {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | undefined>(undefined);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estadoFiltro,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const columns = useMemo<ColumnDef<Pedido, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span>,
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString('es-AR'),
      },
      {
        accessorKey: 'direccion_entrega',
        header: 'Entrega',
        cell: ({ row }) => (
          <div>
            <p className="text-zinc-900">{row.original.direccion_entrega}</p>
            <p className="text-xs text-zinc-500">{row.original.forma_pago}</p>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-semibold">${row.original.total.toLocaleString('es-AR')}</span>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setSelectedPedido(pedido)}>
                <Eye className="h-4 w-4" />
                Detalle
              </Button>
              {pedido.estado === 'PENDIENTE' && (
                <Button
                  onClick={() =>
                    void cambiarEstadoMutation.mutateAsync({
                      id: pedido.id,
                      estado: 'EN_PREPARACION',
                    })
                  }
                  disabled={cambiarEstadoMutation.isPending}
                >
                  Preparar
                </Button>
              )}
              {pedido.estado === 'EN_PREPARACION' && (
                <Button
                  onClick={() =>
                    void cambiarEstadoMutation.mutateAsync({
                      id: pedido.id,
                      estado: 'ENTREGADO',
                    })
                  }
                  disabled={cambiarEstadoMutation.isPending}
                >
                  Entregar
                </Button>
              )}
              {(pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_PREPARACION') && (
                <Button
                  variant="danger"
                  onClick={() =>
                    void cambiarEstadoMutation.mutateAsync({
                      id: pedido.id,
                      estado: 'CANCELADO',
                    })
                  }
                  disabled={cambiarEstadoMutation.isPending}
                >
                  Cancelar
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [cambiarEstadoMutation.isPending]
  );

  const pedidos = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gestión de pedidos</h1>
          <p className="text-sm text-zinc-500">Avanzá o cancelá pedidos según su estado.</p>
        </div>

        <select
          value={estadoFiltro ?? ''}
          onChange={(e) =>
            setEstadoFiltro(e.target.value ? (e.target.value as EstadoPedido) : undefined)
          }
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={handleApiError(error, 'Error al cargar los pedidos')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && pedidos.length === 0 && (
        <EstadoVacio titulo="No hay pedidos para mostrar" />
      )}

      {!isLoading && !isError && pedidos.length > 0 && (
        <DataTable data={pedidos} columns={columns} pageSize={10} />
      )}

      <PedidoDetalleModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  );
};
