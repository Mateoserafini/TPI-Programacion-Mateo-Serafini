import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { PackageCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
  useUpdateProductoStock,
} from '@/features/productos/hooks/useProductos';
import type { Producto } from '@/features/productos/types/producto.types';
import { handleApiError } from '@/shared/api/handleApiError';
import { DataTable } from '@/shared/components/DataTable';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Skeleton } from '@/shared/components/Skeleton';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';

export const AdminProductosPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const stockMutation = useUpdateProductoStock();
  const deleteMutation = useDeleteProducto();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [stockModalProduct, setStockModalProduct] = useState<Producto | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [disponibleValue, setDisponibleValue] = useState<boolean>(true);
  const [stockError, setStockError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
      categoria_id: 0,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim(),
          stock: Number(value.stock),
          disponible: value.disponible,
          categoria_id: Number(value.categoria_id),
        };
        if (editing) {
          await updateMutation.mutateAsync({ id: editing.id, payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        setModalOpen(false);
      } catch (err: unknown) {
        setFormError(handleApiError(err, 'No se pudo guardar el producto'));
      }
    },
  });

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    form.reset({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
      categoria_id: categorias[0]?.id ?? 0,
    });
    setModalOpen(true);
  };

  const openEdit = (prod: Producto) => {
    setEditing(prod);
    setFormError(null);
    form.reset({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio_base: prod.precio_base,
      imagen_url: prod.imagen_url,
      stock: prod.stock,
      disponible: prod.disponible,
      categoria_id: prod.categoria_id,
    });
    setModalOpen(true);
  };

  const openStockModal = (prod: Producto) => {
    setStockModalProduct(prod);
    setStockValue(prod.stock);
    setDisponibleValue(prod.disponible);
    setStockError(null);
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    setStockError(null);
    try {
      await stockMutation.mutateAsync({
        id: stockModalProduct.id,
        payload: { stock: Number(stockValue), disponible: disponibleValue },
      });
      setStockModalProduct(null);
    } catch (err: unknown) {
      setStockError(handleApiError(err, 'No se pudo actualizar el stock'));
    }
  };

  const columns = useMemo<ColumnDef<Producto, unknown>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-zinc-900">{row.original.nombre}</p>
            <p className="text-xs text-zinc-500">{row.original.categoria.nombre}</p>
          </div>
        ),
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => `$${row.original.precio_base.toLocaleString('es-AR')}`,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              row.original.disponible
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {row.original.disponible ? 'Sí' : 'No'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => openStockModal(row.original)}>
              <PackageCheck className="h-4 w-4" />
              Stock
            </Button>
            <Button variant="secondary" onClick={() => openEdit(row.original)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => void deleteMutation.mutateAsync(row.original.id)}
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

  const productos = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Administrar productos</h1>
          <p className="text-sm text-zinc-500">Gestioná el catálogo, precios y stock disponible.</p>
        </div>
        <Button onClick={openCreate} disabled={categorias.length === 0}>
          <Plus className="h-4 w-4" />
          Nuevo producto
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
          mensaje={handleApiError(error, 'Error al cargar los productos')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && productos.length === 0 && (
        <EstadoVacio
          titulo="No hay productos cargados"
          descripcion="Creá el primer producto para comenzar a vender."
        />
      )}

      {!isLoading && !isError && productos.length > 0 && (
        <DataTable data={productos} columns={columns} pageSize={10} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
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
              onChange: ({ value }) => (value.trim().length < 1 ? 'El nombre es obligatorio' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="prod-nombre"
                label="Nombre"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) => (Number(value) <= 0 ? 'Seleccioná una categoría' : undefined),
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="prod-categoria" className="text-sm font-medium text-zinc-700">
                  Categoría
                </label>
                <select
                  id="prod-categoria"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value={0}>Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors[0] && (
                  <span className="text-xs text-red-600">{String(field.state.meta.errors[0])}</span>
                )}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? 'Debe ser >= 0' : undefined),
              }}
            >
              {(field) => (
                <Input
                  id="prod-precio"
                  type="number"
                  step="0.01"
                  min={0}
                  label="Precio base"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                />
              )}
            </form.Field>

            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? 'Debe ser >= 0' : undefined),
              }}
            >
              {(field) => (
                <Input
                  id="prod-stock"
                  type="number"
                  min={0}
                  label="Stock"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="imagen_url">
            {(field) => (
              <Input
                id="prod-imagen"
                label="URL de imagen"
                placeholder="https://..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor="prod-descripcion" className="text-sm font-medium text-zinc-700">
                  Descripción
                </label>
                <textarea
                  id="prod-descripcion"
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-orange-600"
                />
                Disponible para la venta
              </label>
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

      <Modal
        isOpen={stockModalProduct !== null}
        onClose={() => setStockModalProduct(null)}
        title={`Actualizar stock: ${stockModalProduct?.nombre ?? ''}`}
      >
        {stockError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {stockError}
          </div>
        )}
        <form onSubmit={handleSaveStock} className="space-y-4">
          <Input
            id="stock-input"
            type="number"
            min={0}
            label="Stock"
            value={stockValue}
            onChange={(e) => setStockValue(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={disponibleValue}
              onChange={(e) => setDisponibleValue(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-orange-600"
            />
            Disponible para la venta
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStockModalProduct(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={stockMutation.isPending}>
              Actualizar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
