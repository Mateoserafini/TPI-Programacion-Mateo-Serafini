import React from 'react';
import { CalendarCheck, CheckCircle2, Clock, DollarSign, Flame, XCircle } from 'lucide-react';
import { useResumenPedidos } from '@/features/pedidos/hooks/usePedidos';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { Skeleton } from '@/shared/components/Skeleton';
import { Card } from '@/shared/ui/Card';

export const AdminResumenPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Resumen del negocio</h1>
        <p className="text-sm text-zinc-500">Indicadores generales de pedidos e ingresos.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={handleApiError(error, 'Error al cargar el resumen')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Pendientes</p>
              <p className="text-2xl font-bold text-zinc-900">{data.pendientes}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">En preparación</p>
              <p className="text-2xl font-bold text-zinc-900">{data.en_preparacion}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Entregados</p>
              <p className="text-2xl font-bold text-zinc-900">{data.entregados}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-700">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Cancelados</p>
              <p className="text-2xl font-bold text-zinc-900">{data.cancelados}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Pedidos hoy</p>
              <p className="text-2xl font-bold text-zinc-900">{data.pedidos_hoy}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Ingresos entregados</p>
              <p className="text-2xl font-bold text-zinc-900">
                ${data.ingresos_entregados.toLocaleString('es-AR')}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
