import { axiosInstance } from '@/shared/api/axiosInstance';
import type { UsuarioAdmin } from '@/features/usuarios/types/usuario.types';

export const getUsuarios = async (): Promise<UsuarioAdmin[]> => {
  const response = await axiosInstance.get<UsuarioAdmin[]>('/admin/usuarios');
  return response.data;
};

export const activarUsuario = async (id: number): Promise<UsuarioAdmin> => {
  const response = await axiosInstance.post<UsuarioAdmin>(`/admin/usuarios/${id}/activar`);
  return response.data;
};

export const desactivarUsuario = async (id: number): Promise<UsuarioAdmin> => {
  const response = await axiosInstance.post<UsuarioAdmin>(`/admin/usuarios/${id}/desactivar`);
  return response.data;
};
