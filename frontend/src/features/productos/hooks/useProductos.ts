import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateProductoStock,
} from '@/features/productos/api/productos';
import type {
  ProductoFiltros,
  ProductoPayload,
  ProductoStockPayload,
} from '@/features/productos/types/producto.types';

export const useProductos = (filtros: ProductoFiltros) => {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
  });
};

export const useCreateProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoPayload) => createProducto(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useUpdateProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProductoPayload> }) =>
      updateProducto(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useUpdateProductoStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockPayload }) =>
      updateProductoStock(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useDeleteProducto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};
