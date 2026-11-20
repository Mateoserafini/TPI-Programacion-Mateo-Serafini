import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Categoria, CategoriaPayload } from '@/features/categorias/types/categoria.types';

export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await axiosInstance.get<Categoria[]>('/categorias');
  return response.data;
};

export const createCategoria = async (payload: CategoriaPayload): Promise<Categoria> => {
  const response = await axiosInstance.post<Categoria>('/categorias', payload);
  return response.data;
};

export const updateCategoria = async (
  id: number,
  payload: Partial<CategoriaPayload>
): Promise<Categoria> => {
  const response = await axiosInstance.put<Categoria>(`/categorias/${id}`, payload);
  return response.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/categorias/${id}`);
};
