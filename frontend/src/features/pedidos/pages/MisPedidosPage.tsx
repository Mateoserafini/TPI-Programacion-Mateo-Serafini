import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, XCircle } from 'lucide-react';
import { PedidoDetalleModal } from '@/features/pedidos/components/PedidoDetalleModal';
import { useCancelarPedido, usePedidos } from '@/features/pedidos/hooks/usePedidos';
import type { Pedido } from '@/features/pedidos/types/pedido.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { Skeleton } from '@/shared/components/Skeleton';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

const LIMIT = 10;

export const MisPedidosPage: React.FC = () => {
  const [pagina, setPagina] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * LIMIT,
    limit: LIMIT,
  });
  const cancelarMutation = useCancelarPedido();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Mis pedidos</h1>
        <p className="text-sm text-zinc-500">Consultá el estado y detalle de tus pedidos.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={handleApiError(error, 'Error al cargar tus pedidos')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no realizaste pedidos"
          descripcion="Cuando confirmes un pedido desde el carrito, aparecerá aquí."
          accion={
            <Link to="/">
              <Button>Explorar catálogo</Button>
            </Link>
          }
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((pedido) => (
            <Card key={pedido.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="text-xs text-zinc-500">
                  {new Date(pedido.created_at).toLocaleString('es-AR')} · {pedido.forma_pago} ·{' '}
                  {pedido.direccion_entrega}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-zinc-900">
                  ${pedido.total.toLocaleString('es-AR')}
                </span>
                <Button variant="secondary" onClick={() => setSelectedPedido(pedido)}>
                  <Eye className="h-4 w-4" />
                  Ver detalle
                </Button>
                {pedido.estado === 'PENDIENTE' && (
                  <Button
                    variant="danger"
                    onClick={() => void cancelarMutation.mutateAsync(pedido.id)}
                    disabled={cancelarMutation.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}

          <Paginacion
            pagina={pagina}
            limit={LIMIT}
            total={data.total}
            onChange={setPagina}
          />
        </div>
      )}

      <PedidoDetalleModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  );
};
