import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosInstance } from '@/shared/api/axiosInstance';
import { handleApiError } from '@/shared/api/handleApiError';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

interface AuthState {
  usuario: AuthUser | null;
  cargando: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      error: null,

      login: async (credentials: LoginPayload) => {
        set({ cargando: true, error: null });
        try {
          const form = new URLSearchParams();
          form.append('username', credentials.username);
          form.append('password', credentials.password);

          await axiosInstance.post('/auth/token', form, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });

          const meResponse = await axiosInstance.get<AuthUser>('/auth/me');
          set({
            usuario: meResponse.data,
            cargando: false,
            error: null,
          });
        } catch (error: unknown) {
          const message = handleApiError(error, 'Error al iniciar sesión');
          set({
            usuario: null,
            cargando: false,
            error: message,
          });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch {
        } finally {
          set({
            usuario: null,
            cargando: false,
            error: null,
          });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const response = await axiosInstance.get<AuthUser>('/auth/me');
          set({
            usuario: response.data,
            cargando: false,
            error: null,
          });
        } catch {
          set({
            usuario: null,
            cargando: false,
          });
        }
      },

      clearSession: () => {
        set({
          usuario: null,
          cargando: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
