import { axiosInstance } from '@/shared/api/axiosInstance';
import type { EstadoPedido } from '@/shared/ui/BadgeEstado';
import type {
  Pedido,
  PedidoCreatePayload,
  PedidoFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from '@/features/pedidos/types/pedido.types';

export const getPedidos = async (filtros: PedidoFiltros): Promise<PedidosPaginados> => {
  const response = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params: filtros,
  });
  return response.data;
};

export const crearPedido = async (payload: PedidoCreatePayload): Promise<Pedido> => {
  const response = await axiosInstance.post<Pedido>('/pedidos', payload);
  return response.data;
};

export const cambiarEstadoPedido = async (
  id: number,
  estado: EstadoPedido
): Promise<Pedido> => {
  const response = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return response.data;
};

export const cancelarPedido = async (id: number): Promise<Pedido> => {
  const response = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return response.data;
};

export const getResumenPedidos = async (): Promise<ResumenPedidos> => {
  const response = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen');
  return response.data;
};
