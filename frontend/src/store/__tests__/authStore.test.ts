import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance } from '@/shared/api/axiosInstance';
import { useAuthStore, type AuthUser } from '@/store/authStore';

vi.mock('@/shared/api/axiosInstance', () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockUser: AuthUser = {
  id: 1,
  username: 'admin',
  full_name: 'Administrador Food Store',
  email: 'admin@foodstore.com',
  role: 'admin',
  disabled: false,
  created_at: '2026-11-19T10:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearSession();
  });

  it('inicia sesión enviando form-urlencoded y cargando el perfil desde /auth/me', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: { message: 'Login exitoso' } });
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockUser });

    await useAuthStore.getState().login({ username: 'admin', password: 'Admin1234!' });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/auth/token',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/me');
    expect(useAuthStore.getState().usuario).toEqual(mockUser);
    expect(useAuthStore.getState().cargando).toBe(false);
  });

  it('cierra sesión limpiando el usuario', async () => {
    vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: { message: 'Sesión cerrada' } });
    useAuthStore.setState({ usuario: mockUser, cargando: false, error: null });

    await useAuthStore.getState().logout();

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    expect(useAuthStore.getState().usuario).toBeNull();
  });
});
