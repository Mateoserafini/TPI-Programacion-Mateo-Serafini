import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
      <ShieldAlert className="h-14 w-14 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-zinc-900">Acceso denegado</h1>
      <p className="mt-2 text-sm text-zinc-600">
        No contás con los permisos necesarios para acceder a esta sección.
      </p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
};
