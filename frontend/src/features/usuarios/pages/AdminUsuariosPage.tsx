import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { UserCheck, UserX } from 'lucide-react';
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '@/features/usuarios/hooks/useUsuarios';
import type { UsuarioAdmin } from '@/features/usuarios/types/usuario.types';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Skeleton } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';

export const AdminUsuariosPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.usuario);
  const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();

  const columns = useMemo<ColumnDef<UsuarioAdmin, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: ({ row }) => <span className="font-medium text-zinc-900">{row.original.username}</span>,
      },
      {
        accessorKey: 'full_name',
        header: 'Nombre',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-zinc-800">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.disabled
                ? 'bg-red-100 text-red-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const isSelf = currentUser?.id === row.original.id;
          return (
            <div className="flex items-center gap-2">
              {row.original.disabled ? (
                <Button
                  variant="secondary"
                  onClick={() => void activarMutation.mutateAsync(row.original.id)}
                  disabled={activarMutation.isPending}
                >
                  <UserCheck className="h-4 w-4" />
                  Activar
                </Button>
              ) : (
                !isSelf && (
                  <Button
                    variant="danger"
                    onClick={() => void desactivarMutation.mutateAsync(row.original.id)}
                    disabled={desactivarMutation.isPending}
                  >
                    <UserX className="h-4 w-4" />
                    Desactivar
                  </Button>
                )
              )}
            </div>
          );
        },
      },
    ],
    [currentUser?.id, activarMutation.isPending, desactivarMutation.isPending]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Administrar usuarios</h1>
        <p className="text-sm text-zinc-500">Activá o desactivá cuentas de usuario.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={handleApiError(error, 'Error al cargar los usuarios')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && usuarios.length === 0 && (
        <EstadoVacio titulo="No hay usuarios registrados" />
      )}

      {!isLoading && !isError && usuarios.length > 0 && (
        <DataTable data={usuarios} columns={columns} pageSize={10} />
      )}
    </div>
  );
};
