import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Producto,
  ProductoFiltros,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from '@/features/productos/types/producto.types';

export const getProductos = async (filtros: ProductoFiltros): Promise<ProductosPaginados> => {
  const response = await axiosInstance.get<ProductosPaginados>('/productos', {
    params: filtros,
  });
  return response.data;
};

export const createProducto = async (payload: ProductoPayload): Promise<Producto> => {
  const response = await axiosInstance.post<Producto>('/productos', payload);
  return response.data;
};

export const updateProducto = async (
  id: number,
  payload: Partial<ProductoPayload>
): Promise<Producto> => {
  const response = await axiosInstance.put<Producto>(`/productos/${id}`, payload);
  return response.data;
};

export const updateProductoStock = async (
  id: number,
  payload: ProductoStockPayload
): Promise<Producto> => {
  const response = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, payload);
  return response.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/productos/${id}`);
};
