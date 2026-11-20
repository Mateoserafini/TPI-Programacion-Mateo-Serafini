import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from '@/features/categorias/api/categorias';
import type { CategoriaPayload } from '@/features/categorias/types/categoria.types';

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });
};

export const useCreateCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => createCategoria(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoriaPayload> }) =>
      updateCategoria(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
};
