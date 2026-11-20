import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { ProductoCard } from '@/features/productos/components/ProductoCard';
import { useProductos } from '@/features/productos/hooks/useProductos';
import { handleApiError } from '@/shared/api/handleApiError';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { Paginacion } from '@/shared/components/Paginacion';
import { CatalogoSkeleton } from '@/shared/components/Skeleton';

const LIMIT = 6;

export const CatalogoPage: React.FC = () => {
  const [pagina, setPagina] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search.trim() || undefined,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagina(0);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value ? Number(value) : undefined);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Catálogo de comidas</h1>
        <p className="text-sm text-zinc-500">Elegí tus productos favoritos y armá tu pedido.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <select
          value={categoriaId ?? ''}
          onChange={(e) => handleCategoriaChange(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <CatalogoSkeleton />}

      {isError && (
        <EstadoError
          mensaje={handleApiError(error, 'Error al cargar el catálogo')}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Probá cambiando el filtro de búsqueda o la categoría seleccionada."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            limit={LIMIT}
            total={data.total}
            onChange={setPagina}
          />
        </>
      )}
    </div>
  );
};
