import React from 'react';

export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO';

interface BadgeEstadoProps {
  estado: EstadoPedido | string;
}

const estadoConfig: Record<string, { label: string; classes: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  EN_PREPARACION: {
    label: 'En preparación',
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  ENTREGADO: {
    label: 'Entregado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado }) => {
  const config = estadoConfig[estado] ?? {
    label: estado,
    classes: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
};
