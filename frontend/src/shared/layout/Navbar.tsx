import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-orange-600' : 'text-zinc-600 hover:text-zinc-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap md:flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-zinc-900 whitespace-nowrap">
            <UtensilsCrossed className="h-6 w-6 text-orange-600" />
            <span>Food Store</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 whitespace-nowrap">
            <NavLink to="/" end className={navLinkClass}>
              Catálogo
            </NavLink>
            {usuario?.role === 'user' && (
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                Mis pedidos
              </NavLink>
            )}
            {usuario?.role === 'admin' && (
              <>
                <span className="h-4 w-px bg-zinc-300" />
                <NavLink to="/admin/resumen" className={navLinkClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/categorias" className={navLinkClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/productos" className={navLinkClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/pedidos" className={navLinkClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/usuarios" className={navLinkClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario?.role !== 'admin' && (
            <Link
              to="/carrito"
              className="relative inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              <span>Carrito</span>
              {totalItems > 0 && (
                <span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {usuario ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-sm font-medium text-zinc-900">{usuario.full_name}</span>
                <span className="text-xs font-semibold uppercase text-orange-600">
                  {usuario.role}
                </span>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Ingresar</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {usuario?.role === 'admin' && (
        <div className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-zinc-100 px-4 py-2 text-xs">
          <NavLink to="/admin/resumen" className={navLinkClass}>
            Resumen
          </NavLink>
          <NavLink to="/admin/categorias" className={navLinkClass}>
            Categorías
          </NavLink>
          <NavLink to="/admin/productos" className={navLinkClass}>
            Productos
          </NavLink>
          <NavLink to="/admin/pedidos" className={navLinkClass}>
            Pedidos
          </NavLink>
          <NavLink to="/admin/usuarios" className={navLinkClass}>
            Usuarios
          </NavLink>
        </div>
      )}
    </header>
  );
};
