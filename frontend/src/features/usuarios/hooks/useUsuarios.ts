import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activarUsuario,
  desactivarUsuario,
  getUsuarios,
} from '@/features/usuarios/api/usuarios';

export const useUsuarios = () => {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });
};

export const useActivarUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};

export const useDesactivarUsuario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
};
