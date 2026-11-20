import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onRetry?: () => void;
}

export const EstadoError: React.FC<EstadoErrorProps> = ({ mensaje, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-8 px-6 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      <p className="text-sm font-medium text-red-800">{mensaje}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  );
};
