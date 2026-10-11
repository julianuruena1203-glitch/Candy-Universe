import React, { useState } from 'react';
import { BusinessConfig } from '../types';
import { X, Download } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  config: BusinessConfig;
  onClose: () => void;
  onSaveConfig: (config: BusinessConfig) => void;
  onResetProducts: () => void;
  onClearSales: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
  onResetProducts,
  onClearSales,
}) => {
  const [storeName, setStoreName] = useState(config.storeName);
  const [storeSubtitle, setStoreSubtitle] = useState(config.storeSubtitle);
  const [phone, setPhone] = useState(config.phone || '');
  const [address, setAddress] = useState(config.address || '');
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter);
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol || '$');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      storeName: storeName.trim() || 'Candy Universe',
      storeSubtitle: storeSubtitle.trim(),
      phone: phone.trim(),
      address: address.trim(),
      receiptFooter: receiptFooter.trim() || '¡Gracias por endulzar tu día en Candy Universe!',
      currencySymbol: currencySymbol.trim() || '$',
    });
    onClose();
  };

  const handleExportBackup = () => {
    try {
      const backup = {
        config,
        products: localStorage.getItem('dulcecaja_products_v1'),
        sales: localStorage.getItem('dulcecaja_sales_v1'),
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candy_universe_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 bg-purple-50/60">
          <h3 className="font-medium text-[#581c87] text-base">
            Configuración de Candy Universe
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="p-1 text-slate-400 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1">
              Nombre de la Dulcería
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1">
              Subtítulo / Razón Social
            </label>
            <input
              type="text"
              value={storeSubtitle}
              onChange={(e) => setStoreSubtitle(e.target.value)}
              placeholder="Ej. Mundo de Dulces & Confitería"
              className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-normal text-purple-900 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="55 1234 5678"
                className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-purple-900 mb-1">
                Símbolo Moneda
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="$"
                className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1">
              Dirección o Local
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Plaza Comercial Local #15"
              className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1">
              Pie del Ticket (Despedida)
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="¡Gracias por endulzar tu día en Candy Universe!"
              className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          {/* Quick Data Actions */}
          <div className="pt-3 border-t border-purple-100">
            <span className="block text-xs font-medium text-purple-900 mb-2">
              Gestión de Datos
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-normal text-[#6d28d9] bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100"
              >
                <Download className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span>Descargar Copia de Seguridad (JSON)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Restablecer el catálogo con los dulces sugeridos por defecto?')) {
                      onResetProducts();
                    }
                  }}
                  className="py-2 px-2.5 text-[11px] font-normal text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 border border-purple-100 rounded-xl transition-colors text-center"
                >
                  Restablecer Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas vaciar el historial de ventas registradas?')) {
                      onClearSales();
                    }
                  }}
                  className="py-2 px-2.5 text-[11px] font-normal text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors text-center"
                >
                  Vaciar Ventas
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-900 font-normal text-xs rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-purple-500/20"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
