import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  accion,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-12 px-6 text-center">
      <PackageOpen className="h-12 w-12 text-zinc-400 mb-3" />
      <h3 className="text-base font-semibold text-zinc-900">{titulo}</h3>
      {descripcion && <p className="mt-1 text-sm text-zinc-500 max-w-md">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
};
