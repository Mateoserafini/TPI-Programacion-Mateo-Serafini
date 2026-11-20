import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useCategorias,
  useCreateCategoria,
  useDeleteCategoria,
  useUpdateCategoria,
} from '@/features/categorias/hooks/useCategorias';
import type { Categoria } from '@/features/categorias/types/categoria.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Skeleton } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';

export const AdminCategoriasPage: React.FC = () => {
  const { data: categorias = [], isLoading, isError, error, refetch } = useCategorias();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: editing?.nombre ?? '',
      descripcion: editing?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (editing) {
          await updateMutation.mutateAsync({
            id: editing.id,
            payload: {
              nombre: value.nombre.trim(),
              descripcion: value.descripcion.trim(),
            },
          });
        } else {
          await createMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim(),
          });
        }
        setModalOpen(false);
      } catch (err: unknown) {
        setFormError(handleApiError(err, 'No se pudo guardar la categoría'));
      }
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    form.reset({ nombre: '', descripcion: '' });
    setModalOpen(true);
  };

  const openEdit = (cat: Categoria) => {
    setEditing(cat);
    setFormError(null);
    form.reset({ nombre: cat.nombre, descripcion: cat.descripcion });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns = useMemo<ColumnDef<Categoria, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span className="font-medium text-zinc-900">{row.original.nombre}</span>,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => (
          <span className="text-zinc-600 line-clamp-2">{row.original.descripcion || '—'}</span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => openEdit(row.original)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Administrar categorías</h1>
          <p className="text-sm text-zinc-500">Gestioná las categorías del catálogo.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
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
          mensaje={handleApiError(error, 'Error al cargar las categorías')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && categorias.length === 0 && (
        <EstadoVacio
          titulo="No hay categorías cargadas"
          descripcion="Creá la primera categoría para comenzar a organizar los productos."
        />
      )}

      {!isLoading && !isError && categorias.length > 0 && (
        <DataTable data={categorias} columns={columns} pageSize={10} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 || value.trim().length > 100
                  ? 'El nombre debe tener entre 2 y 100 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="cat-nombre"
                label="Nombre"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-descripcion" className="text-sm font-medium text-zinc-700">
                  Descripción
                </label>
                <textarea
                  id="cat-descripcion"
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  isLoading={Boolean(isSubmitting)}
                >
                  Guardar
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>
    </div>
  );
};
