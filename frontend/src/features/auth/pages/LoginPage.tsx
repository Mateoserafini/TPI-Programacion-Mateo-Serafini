import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await login({
          username: value.username.trim(),
          password: value.password,
        });
        navigate(from, { replace: true });
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      }
    },
  });

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-zinc-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ingresá con tu usuario y contraseña para continuar.
        </p>

        {serverError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="mt-6 space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3 ? 'El usuario debe tener al menos 3 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="login-username"
                label="Usuario"
                placeholder="tu_usuario"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 4 ? 'Ingresá tu contraseña' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="login-password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit}
                isLoading={Boolean(isSubmitting)}
              >
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:underline">
            Registrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
};
