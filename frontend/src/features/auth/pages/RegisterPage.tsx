import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { axiosInstance } from '@/shared/api/axiosInstance';
import { handleApiError } from '@/shared/api/handleApiError';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await axiosInstance.post('/auth/register', {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        await login({
          username: value.username.trim(),
          password: value.password,
        });
        navigate('/', { replace: true });
      } catch (err: unknown) {
        setServerError(handleApiError(err, 'No se pudo completar el registro'));
      }
    },
  });

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-zinc-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registrate para realizar pedidos en Food Store.
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
                value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="reg-username"
                label="Usuario"
                placeholder="juanperez"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="reg-fullname"
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? 'Email inválido' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="reg-email"
                type="email"
                label="Email"
                placeholder="juan@ejemplo.com"
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
                value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="reg-password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
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
                Registrarse
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
};
