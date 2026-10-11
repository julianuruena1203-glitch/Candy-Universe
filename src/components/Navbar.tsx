import React, { useState } from 'react';
import { ShoppingBag, Package, BarChart3, Calculator, Settings, LogOut, ShieldCheck, User as UserIcon, Cloud, CheckCircle2 } from 'lucide-react';
import { CandyLogo } from './CandyLogo';
import { UserRole } from '../types';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../firebase';

export type ActiveTab = 'pos' | 'products' | 'reports' | 'cuadre';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cartCount: number;
  productsCount: number;
  storeName: string;
  userRole: UserRole;
  firebaseUser: User | null;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  productsCount,
  userRole,
  firebaseUser,
  onOpenSettings,
  onLogout,
}) => {
  const isAdmin = userRole === 'admin';
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100/80 px-3 sm:px-6 py-2.5 transition-all no-print shadow-xs shadow-purple-900/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand: Candy Universe */}
        <CandyLogo size="sm" showText={true} />

        {/* Navigation Tabs (Admin sees all; Seller sees only POS) */}
        {isAdmin ? (
          <nav className="flex items-center gap-1 p-1 bg-purple-50/80 border border-purple-100 rounded-2xl">
            <button
              onClick={() => onSelectTab('pos')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-medium tracking-normal rounded-xl transition-all ${
                activeTab === 'pos'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-sm shadow-purple-500/30'
                  : 'text-slate-600 hover:text-[#6d28d9]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Vender</span>
              {cartCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 text-[10px] rounded-full bg-[#0ea5e9] text-white font-semibold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('products')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-medium tracking-normal rounded-xl transition-all ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-sm shadow-purple-500/30'
                  : 'text-slate-600 hover:text-[#6d28d9]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Productos</span>
              <span className={`text-[10px] font-light ${activeTab === 'products' ? 'text-purple-200' : 'text-slate-400'}`}>
                ({productsCount})
              </span>
            </button>

            <button
              onClick={() => onSelectTab('reports')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-medium tracking-normal rounded-xl transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-sm shadow-purple-500/30'
                  : 'text-slate-600 hover:text-[#6d28d9]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reportes</span>
            </button>

            <button
              onClick={() => onSelectTab('cuadre')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-medium tracking-normal rounded-xl transition-all ${
                activeTab === 'cuadre'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-sm shadow-purple-500/30'
                  : 'text-slate-600 hover:text-[#6d28d9]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cuadre</span>
            </button>
          </nav>
        ) : (
          /* Seller view indicator */
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-50 border border-cyan-200/80 rounded-xl text-xs font-medium text-[#0284c7] flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Caja de Ventas</span>
            </span>
          </div>
        )}

        {/* User Role Badge, Cloud Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Cloud Sync Status Pill */}
          {firebaseUser ? (
            <div
              title={`Sincronizado en tiempo real con Firebase (${firebaseUser.email})`}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-[11px]">En vivo</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              title="Conectar con Google para sincronizar en tiempo real"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">
                {isConnecting ? 'Conectando...' : 'Conectar Nube'}
              </span>
            </button>
          )}

          {/* Active Profile Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#6d28d9]" />
                <span className="font-medium text-[#581c87]">Administrador</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-[#0284c7]" />
                <span className="font-medium text-[#0284c7]">Vendedor</span>
              </>
            )}
          </div>

          {/* Admin settings button */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              title="Configuración del Negocio"
              className="p-2 text-purple-700 hover:text-purple-950 hover:bg-purple-100/60 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Switch User / Logout button */}
          <button
            onClick={onLogout}
            title="Cambiar de usuario"
            className="flex items-center gap-1 py-1.5 px-2.5 text-xs font-normal text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
