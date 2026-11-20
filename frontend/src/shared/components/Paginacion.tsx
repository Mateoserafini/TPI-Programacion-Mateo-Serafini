import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface PaginacionProps {
  pagina: number;
  limit: number;
  total: number;
  onChange: (nuevaPagina: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  pagina,
  limit,
  total,
  onChange,
}) => {
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
      <p className="text-sm text-zinc-600">
        Página {pagina + 1} de {totalPaginas} ({total} registros)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={pagina === 0}
          onClick={() => onChange(pagina - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={pagina + 1 >= totalPaginas}
          onClick={() => onChange(pagina + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
