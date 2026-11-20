import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from '@/features/pedidos/api/pedidos';
import type {
  PedidoCreatePayload,
  PedidoFiltros,
} from '@/features/pedidos/types/pedido.types';
import type { EstadoPedido } from '@/shared/ui/BadgeEstado';

export const usePedidos = (filtros: PedidoFiltros) => {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
  });
};

export const useResumenPedidos = () => {
  return useQuery({
    queryKey: ['pedidos-resumen'],
    queryFn: getResumenPedidos,
  });
};

export const useCrearPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreatePayload) => crearPedido(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useCambiarEstadoPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useCancelarPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['pedidos-resumen'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};
