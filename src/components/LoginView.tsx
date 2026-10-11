import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShoppingBag, ShieldCheck, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onSelectRole: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSellerLogin = () => {
    onSelectRole('seller');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'candy') {
      setError('');
      onSelectRole('admin');
    } else {
      setError('Contraseña incorrecta. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7fd] via-[#f5eefc] to-[#ede2fa] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Decorative ambient candy glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Eye-catching, prominent Candy Icon */}
        <div className="relative mb-4 group">
          {/* Outer glowing aura */}
          <div className="absolute -inset-3 bg-gradient-to-tr from-[#6d28d9] via-[#ec4899] to-[#0ea5e9] rounded-full blur-xl opacity-60 group-hover:opacity-85 transition-opacity duration-700 animate-pulse"></div>

          {/* Large prominent 3D swirl candy */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#6d28d9] via-[#8b5cf6] to-[#ec4899] p-1.5 shadow-2xl shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#5b15b5] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              {/* Dynamic Candy Swirl SVG with high visual vibrancy */}
              <svg
                viewBox="0 0 48 48"
                className="w-4/5 h-4/5 transition-transform duration-700 group-hover:rotate-90 group-hover:scale-105"
                fill="none"
              >
                {/* Outer lollipop circle */}
                <circle cx="24" cy="24" r="21" fill="#38bdf8" />
                <path
                  d="M24 3C35.598 3 45 12.402 45 24C45 35.598 35.598 45 24 45C12.402 45 3 35.598 3 24C3 12.402 12.402 3 24 3Z"
                  fill="#ec4899"
                />
                {/* Spiral candy rays */}
                <path d="M24 24L18 3.5C21 3.1 24 3 24 3L24 24Z" fill="#facc15" />
                <path d="M24 24L38 7C35.5 5 32 3.5 24 24Z" fill="#ef4444" />
                <path d="M24 24L44.5 18C45 21 45 24 24 24Z" fill="#38bdf8" />
                <path d="M24 24L42 38C44 35.5 45 32 24 24Z" fill="#ffffff" />
                <path d="M24 24L18 44.5C21 45 24 45 24 24Z" fill="#facc15" />
                <path d="M24 24L7 38C9 41 12 43 24 24Z" fill="#ef4444" />
                <path d="M24 24L3.5 18C3.1 21 3 24 24 24Z" fill="#38bdf8" />
                <path d="M24 24L7 10C5 12.5 3.5 16 24 24Z" fill="#ffffff" />
                {/* Center lollipop candy core */}
                <circle cx="24" cy="24" r="7" fill="#ffffff" />
                <circle cx="24" cy="24" r="4.5" fill="#f43f5e" />
                <circle cx="24" cy="24" r="2" fill="#facc15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Title (Keeps font-candy / Fredoka 3D as requested) */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="font-candy font-bold tracking-normal uppercase text-3xl sm:text-4xl text-[#5b15b5] drop-shadow-[0_2px_0_#38bdf8]"
              style={{
                textShadow: '0 2px 0 #38bdf8, 0 3.5px 0 #0284c7',
              }}
            >
              CANDY
            </span>
            <span
              className="font-candy font-bold tracking-normal uppercase text-3xl sm:text-4xl text-[#5b15b5] drop-shadow-[0_2px_0_#38bdf8]"
              style={{
                textShadow: '0 2px 0 #38bdf8, 0 3.5px 0 #0284c7',
              }}
            >
              UNIVERSE
            </span>
          </div>
          <p className="text-xs font-light text-purple-700/80 tracking-wider uppercase mt-1">
            Mundo de Dulces & Confitería
          </p>
          <p className="text-xs text-slate-500 mt-2 font-light">
            Selecciona el tipo de usuario para ingresar
          </p>
        </div>

        {/* Role Selection Container */}
        <div className="w-full space-y-3.5">
          {/* VENDEDOR Card (Direct Access, sell only) */}
          <div
            onClick={handleSellerLogin}
            className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-100 hover:border-[#0ea5e9] shadow-sm hover:shadow-lg shadow-purple-950/5 transition-all duration-200 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 text-[#0284c7] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0ea5e9] group-hover:text-white transition-all">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-[#0284c7] transition-colors">
                  VENDEDOR
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Solo ventas en caja y emisión de tickets
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-[#0ea5e9] text-purple-700 group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* ADMINISTRADOR Card (Requires password "candy") */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 shadow-sm shadow-purple-950/5 overflow-hidden transition-all duration-200">
            <div
              onClick={() => {
                setSelectedRole(selectedRole === 'admin' ? null : 'admin');
                setError('');
                setPassword('');
              }}
              className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-purple-50/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-[#6d28d9] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      ADMINISTRADOR
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-medium">
                      Con clave
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Acceso total: ventas, productos, reportes y ajustes
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center transition-all">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Admin Password Input Drawer */}
            {selectedRole === 'admin' && (
              <form
                onSubmit={handleAdminSubmit}
                className="px-5 pb-5 pt-2 border-t border-purple-100/80 bg-purple-50/30 space-y-3"
              >
                <div>
                  <label className="block text-xs font-normal text-purple-950 mb-1.5">
                    Ingresa la contraseña de Administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Contraseña..."
                      autoFocus
                      className="w-full h-11 pl-4 pr-10 bg-white border border-purple-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-600 font-medium">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:opacity-95 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
                >
                  <span>Ingresar como Administrador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-purple-600/70 font-light text-center mt-6">
          Candy Universe · Sistema de Punto de Venta
        </p>
      </div>
    </div>
  );
};
