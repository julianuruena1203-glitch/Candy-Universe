import React, { useState } from 'react';
import { Sale, BusinessConfig } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';
import { CountryFlag } from './CountryFlag';
import { Printer, Copy, Check, X } from 'lucide-react';

interface TicketModalProps {
  sale: Sale | null;
  config: BusinessConfig;
  onClose: () => void;
  onNewSale?: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  sale,
  config,
  onClose,
  onNewSale,
}) => {
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const generatePlainText = () => {
    const lines = [
      `================================`,
      `     🍭 CANDY UNIVERSE 🍭       `,
      `   ${config.storeSubtitle || 'Mundo de Dulces'}   `,
      config.phone ? `   Tel: ${config.phone}   ` : '',
      config.address ? `   ${config.address}   ` : '',
      `================================`,
      `Ticket: ${sale.id}`,
      `Fecha: ${formatDateTime(sale.timestamp)}`,
      `--------------------------------`,
      `CANT  DESCRIPCIÓN        TOTAL`,
      `--------------------------------`,
      ...sale.items.map(
        (it) =>
          `${it.quantity}x ${it.name.padEnd(18).slice(0, 18)} ${formatCurrency(
            it.subtotal,
            config.currencySymbol
          )}`
      ),
      `--------------------------------`,
      `TOTAL: ${formatCurrency(sale.total, config.currencySymbol)}`,
      `Método: ${sale.paymentMethod.toUpperCase()}`,
      sale.paymentMethod === 'efectivo' && sale.cashReceived
        ? `Recibido: ${formatCurrency(sale.cashReceived, config.currencySymbol)}\nCambio: ${formatCurrency(
            sale.change || 0,
            config.currencySymbol
          )}`
        : '',
      sale.note ? `Nota: ${sale.note}` : '',
      `================================`,
      ` ${config.receiptFooter || '¡Gracias por endulzar tu día en Candy Universe!'} `,
      `================================`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      const text = generatePlainText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden no-print">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-100 bg-purple-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9] animate-pulse"></span>
            <span className="font-medium text-sm text-[#581c87]">
              Ticket #{sale.saleNumber} · Candy Universe
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 text-slate-400 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-purple-50/40">
          {/* Authentic Thermal Receipt Component */}
          <div
            id="thermal-receipt"
            className="printable-ticket mx-auto bg-white border border-purple-100 rounded-2xl p-5 sm:p-6 shadow-sm font-mono text-[13px] text-slate-800"
            style={{ maxWidth: '340px' }}
          >
            {/* Store Info */}
            <div className="text-center pb-3">
              <div className="text-lg mb-1">🍭 ✨ 🍭</div>
              <h3 className="font-semibold text-lg tracking-tight text-[#581c87]">
                {config.storeName || 'CANDY UNIVERSE'}
              </h3>
              <p className="text-xs text-purple-600 mt-0.5 font-light">
                {config.storeSubtitle || 'Mundo de Dulces & Confitería'}
              </p>
              {config.address && (
                <p className="text-[11px] text-slate-500 mt-0.5 font-light">{config.address}</p>
              )}
              {config.phone && (
                <p className="text-[11px] text-slate-500 font-light">Tel: {config.phone}</p>
              )}
            </div>

            {/* Separator */}
            <div className="border-b border-dashed border-purple-200 my-2"></div>

            {/* Meta Info */}
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>FOLIO:</span>
                <span className="font-medium text-[#6d28d9]">{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{formatDateTime(sale.timestamp)}</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="border-b border-dashed border-purple-200 my-2.5"></div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>CANT PRODUCTO</span>
              <span>TOTAL</span>
            </div>

            {/* Item Rows */}
            <div className="space-y-1.5 py-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div className="pr-2 leading-tight flex items-start gap-1.5">
                    <CountryFlag countryCode={item.countryFlag || 'CO'} size="sm" className="mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">{item.quantity}x </span>
                      <span>{item.name}</span>
                      <span className="text-[11px] text-slate-500 block">
                        @{formatCurrency(item.unitPrice, config.currencySymbol)}
                        {item.saleType === 'mayor' && ' (Por Mayor)'}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold whitespace-nowrap text-slate-900">
                    {formatCurrency(item.subtotal, config.currencySymbol)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-b border-dashed border-purple-200 my-2.5"></div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-medium text-slate-900">TOTAL:</span>
              <span className="text-xl font-semibold text-[#581c87] tracking-tight">
                {formatCurrency(sale.total, config.currencySymbol)}
              </span>
            </div>

            {/* Payment Details */}
            <div className="mt-2 pt-2 border-t border-purple-50 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Medio de Pago:</span>
                <span className="capitalize font-semibold text-slate-900">
                  {sale.paymentMethod === 'bancolombia' ? 'Bancolombia' :
                   sale.paymentMethod === 'daviplata' ? 'Daviplata' :
                   sale.paymentMethod === 'nequi' ? 'Nequi' :
                   sale.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                </span>
              </div>
              {sale.paymentMethod === 'efectivo' && sale.cashReceived !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Dinero Recibido:</span>
                    <span>{formatCurrency(sale.cashReceived, config.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    <span className="text-emerald-900">Cambio a Devolver:</span>
                    <span className="text-emerald-700 font-bold text-sm">
                      {formatCurrency(sale.change || 0, config.currencySymbol)}
                    </span>
                  </div>
                </>
              )}
              {sale.note && (
                <div className="pt-1 text-[11px] text-slate-500 italic">
                  Nota: {sale.note}
                </div>
              )}
            </div>

            {/* Footer barcode/note */}
            <div className="border-b border-dashed border-purple-200 my-3"></div>
            <div className="text-center text-xs text-slate-600 space-y-1">
              <p className="font-medium text-purple-900">{config.receiptFooter}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest pt-1">
                *** CANDY UNIVERSE ***
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-purple-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-medium text-xs rounded-xl active:scale-[0.98] transition-all shadow-sm shadow-purple-500/25"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-50 text-purple-900 font-medium text-xs rounded-xl hover:bg-purple-100 active:scale-[0.98] transition-all border border-purple-100"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>
          </div>

          {onNewSale && (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-purple-500/20"
            >
              Realizar Otra Venta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
