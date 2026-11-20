import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';

describe('BadgeEstado', () => {
  it('renderiza los cuatro estados con sus etiquetas', () => {
    render(
      <div>
        <BadgeEstado estado="PENDIENTE" />
        <BadgeEstado estado="EN_PREPARACION" />
        <BadgeEstado estado="ENTREGADO" />
        <BadgeEstado estado="CANCELADO" />
      </div>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En preparación')).toBeInTheDocument();
    expect(screen.getByText('Entregado')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });
});
