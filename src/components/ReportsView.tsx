import React, { useState, useMemo } from 'react';
import { Sale, BusinessConfig, PaymentMethod, ProductGroup } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';
import { PRODUCT_GROUPS } from '../data/countries';
import { CountryFlag } from './CountryFlag';
import { 
  Receipt, 
  Download, 
  Trash2, 
  Search, 
  Banknote,
  Calendar,
  Award,
  Filter,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  config: BusinessConfig;
  onViewTicket: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
}

type DatePeriod = 'hoy' | 'semana' | 'mes' | 'rango' | 'todo';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; short: string; color: string }[] = [
  { id: 'bancolombia', label: 'Bancolombia', short: 'BC', color: 'bg-amber-400 text-slate-950 font-semibold' },
  { id: 'daviplata', label: 'Daviplata', short: 'DP', color: 'bg-red-600 text-white font-semibold' },
  { id: 'nequi', label: 'Nequi', short: 'NQ', color: 'bg-[#20002c] text-pink-300 font-semibold border border-pink-400/40' },
  { id: 'transferencia', label: 'Transferencia', short: 'Transf.', color: 'bg-[#0ea5e9] text-white font-semibold' },
  { id: 'efectivo', label: 'Efectivo', short: 'Efectivo', color: 'bg-emerald-600 text-white font-semibold' },
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  config,
  onViewTicket,
  onDeleteSale,
}) => {
  const [period, setPeriod] = useState<DatePeriod>('hoy');
  const [searchTicket, setSearchTicket] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'todos' | PaymentMethod>('todos');
  const [selectedCategory, setSelectedCategory] = useState<'todas' | ProductGroup>('todas');

  // Custom date range state (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Filter sales by selected period, payment method, and candy category
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1).getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales.filter((s) => {
      // 1. Date filter
      if (period === 'hoy' && s.timestamp < startOfToday) return false;
      if (period === 'semana' && s.timestamp < startOfWeek) return false;
      if (period === 'mes' && s.timestamp < startOfMonth) return false;
      if (period === 'rango') {
        const start = new Date(`${startDate}T00:00:00`).getTime();
        const end = new Date(`${endDate}T23:59:59`).getTime();
        if (s.timestamp < start || s.timestamp > end) return false;
      }

      // 2. Payment method filter
      if (selectedPaymentMethod !== 'todos' && s.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'todas') {
        const hasCategory = s.items.some((it) => it.group === selectedCategory);
        if (!hasCategory) return false;
      }

      return true;
    });
  }, [sales, period, startDate, endDate, selectedPaymentMethod, selectedCategory]);

  // Search in filtered sales
  const displayedSales = useMemo(() => {
    if (!searchTicket.trim()) return filteredSales;
    const q = searchTicket.trim().toLowerCase();
    return filteredSales.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.items.some((it) => it.name.toLowerCase().includes(q))
    );
  }, [filteredSales, searchTicket]);

  // Total revenue & items calculation (respecting category filter if selected)
  const totalRevenue = useMemo(() => {
    if (selectedCategory === 'todas') {
      return filteredSales.reduce((acc, s) => acc + s.total, 0);
    }
    // If specific category is filtered, sum revenue specifically from items of that category
    return filteredSales.reduce((acc, s) => {
      const categoryItemsTotal = s.items
        .filter((it) => it.group === selectedCategory)
        .reduce((sum, it) => sum + it.subtotal, 0);
      return acc + categoryItemsTotal;
    }, 0);
  }, [filteredSales, selectedCategory]);

  const totalSalesCount = filteredSales.length;

  const totalUnitsSold = useMemo(() => {
    return filteredSales.reduce((acc, s) => {
      const itemsToCount = selectedCategory === 'todas'
        ? s.items
        : s.items.filter((it) => it.group === selectedCategory);
      return acc + itemsToCount.reduce((sum, it) => sum + it.quantity, 0);
    }, 0);
  }, [filteredSales, selectedCategory]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const stats: Record<PaymentMethod, { total: number; count: number; name: string }> = {
      bancolombia: { total: 0, count: 0, name: 'Bancolombia' },
      daviplata: { total: 0, count: 0, name: 'Daviplata' },
      nequi: { total: 0, count: 0, name: 'Nequi' },
      transferencia: { total: 0, count: 0, name: 'Transferencia' },
      efectivo: { total: 0, count: 0, name: 'Efectivo' },
    };

    filteredSales.forEach((s) => {
      const m = s.paymentMethod;
      if (stats[m]) {
        const amount = selectedCategory === 'todas'
          ? s.total
          : s.items
              .filter((it) => it.group === selectedCategory)
              .reduce((sum, it) => sum + it.subtotal, 0);
        stats[m].total += amount;
        stats[m].count += 1;
      }
    });

    return stats;
  }, [filteredSales, selectedCategory]);

  // Ranking de Dulces Más Vendidos (Filtered by selected category when chosen)
  const topCandiesRanking = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      quantity: number; 
      revenue: number; 
      countryFlag?: string;
      group?: ProductGroup;
    }>();

    filteredSales.forEach((s) => {
      s.items.forEach((it) => {
        if (selectedCategory !== 'todas' && it.group !== selectedCategory) {
          return;
        }
        const existing = map.get(it.name) || { 
          name: it.name, 
          quantity: 0, 
          revenue: 0,
          countryFlag: it.countryFlag,
          group: it.group,
        };
        existing.quantity += it.quantity;
        existing.revenue += it.subtotal;
        if (!existing.countryFlag && it.countryFlag) existing.countryFlag = it.countryFlag;
        if (!existing.group && it.group) existing.group = it.group;
        map.set(it.name, existing);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredSales, selectedCategory]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setPeriod('hoy');
    setSelectedPaymentMethod('todos');
    setSelectedCategory('todas');
    setSearchTicket('');
  };

  const hasActiveFilters = 
    period !== 'hoy' || 
    selectedPaymentMethod !== 'todos' || 
    selectedCategory !== 'todas' || 
    searchTicket !== '';

  // Export to CSV in Colombian format
  const handleExportCSV = () => {
    if (filteredSales.length === 0) return;

    const headers = ['Folio', 'Fecha', 'Hora', 'Total_COP', 'Metodo_Pago', 'Productos_Vendidos'];
    const rows = filteredSales.map((s) => {
      const date = new Date(s.timestamp);
      const itemsSummary = s.items.map((it) => `${it.quantity}x ${it.name} (${it.group})`).join('; ');
      return [
        s.id,
        date.toLocaleDateString('es-CO'),
        date.toLocaleTimeString('es-CO'),
        s.total.toFixed(0),
        s.paymentMethod,
        `"${itemsSummary.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_ventas_${period}_${selectedPaymentMethod}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxQuantity = topCandiesRanking.length > 0 ? topCandiesRanking[0].quantity : 1;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
      {/* Top Header & Comprehensive Filters Card */}
      <div className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-3xl border border-purple-100 shadow-xs shadow-purple-950/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-medium text-[#581c87]">
              Reportes y Métricas de Venta
            </h2>
            <div className="flex items-center gap-2 text-xs text-purple-600/80 mt-0.5 font-light">
              <span>{filteredSales.length} transacciones encontradas</span>
              <span aria-hidden="true">·</span>
              <span>Total: {formatCurrency(totalRevenue, config.currencySymbol)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-[#6d28d9] border border-purple-200 text-xs font-normal rounded-xl flex items-center gap-1.5 transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            )}

            {filteredSales.length > 0 && (
              <button
                onClick={handleExportCSV}
                title="Descargar datos en formato CSV para Excel"
                className="py-1.5 px-3.5 bg-gradient-to-r from-purple-50 to-cyan-50 hover:from-purple-100 hover:to-cyan-100 text-[#6d28d9] border border-purple-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. FILTRO DE RANGO DE FECHA Y PERÍODOS */}
        <div className="pt-2 border-t border-purple-50 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-normal text-purple-950 flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>Período de Fecha:</span>
            </span>

            {/* Period selector buttons */}
            <div className="flex items-center gap-1 p-1 bg-purple-50/80 border border-purple-100 rounded-2xl flex-wrap">
              {(
                [
                  ['hoy', 'Hoy'],
                  ['semana', 'Semana'],
                  ['mes', 'Mes'],
                  ['rango', 'Rango de Fecha'],
                  ['todo', 'Histórico'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-3 py-1 text-xs rounded-xl transition-all ${
                    period === key
                      ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25 font-medium'
                      : 'text-purple-900/70 hover:text-purple-950 font-normal'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Selector (When "Rango de Fecha" is active) */}
          {period === 'rango' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2.5 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-1.5 text-xs text-[#581c87] font-medium">
                <Calendar className="w-4 h-4 text-[#7c3aed]" />
                <span>Escoger rango:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-light">Desde:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-light">Hasta:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. FILTRO POR MEDIO DE PAGO (Bancolombia, Daviplata, Nequi, Transferencia, Efectivo) */}
        <div className="pt-2 border-t border-purple-50 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-normal text-purple-950 flex items-center gap-1.5 shrink-0">
            <Banknote className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>Medio de Pago:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedPaymentMethod('todos')}
              className={`px-3 py-1 text-xs rounded-xl transition-all ${
                selectedPaymentMethod === 'todos'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs font-medium'
                  : 'bg-purple-50/70 text-purple-900/80 hover:bg-purple-100 border border-purple-100 font-normal'
              }`}
            >
              Todos los medios
            </button>

            {PAYMENT_METHODS.map((pm) => {
              const isSelected = selectedPaymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPaymentMethod(isSelected ? 'todos' : pm.id)}
                  className={`px-2.5 py-1 text-xs rounded-xl flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? `${pm.color} shadow-xs ring-2 ring-[#7c3aed] scale-105`
                      : 'bg-purple-50/70 text-purple-900 hover:bg-purple-100 border border-purple-100'
                  }`}
                >
                  <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-black/10">
                    {pm.short}
                  </span>
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. FILTRO PARA LAS DIFERENTES CATEGORÍAS DE DULCES (En orden alfabético) */}
        <div className="pt-2 border-t border-purple-50 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-normal text-purple-950 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#ec4899]" />
            <span>Categoría de Dulce:</span>
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === 'todas'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs font-medium'
                  : 'bg-purple-50/70 text-purple-900/80 hover:bg-purple-100 border border-purple-100 font-normal'
              }`}
            >
              Todas las categorías
            </button>

            {PRODUCT_GROUPS.map((grp) => {
              const isSelected = selectedCategory === grp;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedCategory(isSelected ? 'todas' : grp)}
                  className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] text-white shadow-xs font-medium scale-[1.02]'
                      : 'bg-purple-50/70 text-purple-900 hover:bg-purple-100 border border-purple-100 font-normal'
                  }`}
                >
                  {grp}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (NOTE: "Ticket Promedio" was eliminated per user request) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Revenue in COP */}
        <div className="bg-white p-4.5 rounded-3xl border border-purple-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-900/70">Total Vendido</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">
              COP
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-semibold text-[#581c87] tracking-tight">
              {formatCurrency(totalRevenue, config.currencySymbol)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-light">
            {selectedCategory === 'todas' ? 'Venta total filtrada' : `Ventas en ${selectedCategory}`}
          </div>
        </div>

        {/* Transactions Count */}
        <div className="bg-white p-4.5 rounded-3xl border border-purple-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-900/70">Ventas Realizadas</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-[#0284c7] font-medium">
              Tickets
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-semibold text-[#0ea5e9] tracking-tight">
              {totalSalesCount}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-light">
            {selectedPaymentMethod === 'todos' ? 'En todos los medios' : `Por ${selectedPaymentMethod}`}
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-4.5 rounded-3xl border border-purple-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-900/70">Dulces Vendidos</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-[#db2777] font-medium">
              Unidades
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-semibold text-[#ec4899] tracking-tight">
              {totalUnitsSold}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-light">
            Unidades despachadas
          </div>
        </div>
      </div>

      {/* RANKING DE DULCES MÁS VENDIDOS (Visual real SVG flag icon, no text initials) */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium text-[#581c87] text-base">
              Ranking de Dulces Más Vendidos
            </h3>
            {selectedCategory !== 'todas' && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-normal">
                {selectedCategory}
              </span>
            )}
          </div>
          <span className="text-xs text-purple-600 font-light">
            {topCandiesRanking.length} productos con ventas
          </span>
        </div>

        {topCandiesRanking.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center font-light">
            No hay registros de ventas para los filtros seleccionados
          </p>
        ) : (
          <div className="space-y-3">
            {topCandiesRanking.map((candy, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const barPercent = Math.max(8, Math.round((candy.quantity / maxQuantity) * 100));

              return (
                <div
                  key={`${candy.name}-${candy.group || ''}-${index}`}
                  className={`p-3 rounded-2xl border transition-all ${
                    isFirst
                      ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                      : isSecond
                      ? 'bg-purple-50/30 border-purple-100'
                      : isThird
                      ? 'bg-cyan-50/20 border-cyan-100'
                      : 'bg-white border-purple-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    {/* Rank badge, Flag SVG Icon & Candy title */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : isSecond
                            ? 'bg-slate-300 text-slate-800'
                            : isThird
                            ? 'bg-amber-700/80 text-white'
                            : 'bg-purple-100 text-purple-800 font-normal'
                        }`}
                      >
                        {rank}
                      </span>

                      {/* Flag icon (Always SVG, never text initials) */}
                      <div className="inline-flex p-0.5 rounded bg-white/80 border border-purple-100/60 shadow-2xs shrink-0" title="País de origen">
                        <CountryFlag countryCode={candy.countryFlag || 'CO'} size="sm" />
                      </div>

                      <span className="font-medium text-slate-900 truncate text-sm">
                        {candy.name}
                      </span>

                      {candy.group && (
                        <span className="text-[11px] text-purple-600/80 font-light hidden sm:inline">
                          · {candy.group}
                        </span>
                      )}
                    </div>

                    {/* Stats: Quantities and revenue in COP */}
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-[#581c87] text-sm mr-2">
                        {candy.quantity} {candy.quantity === 1 ? 'unidad' : 'unidades'}
                      </span>
                      <span className="text-slate-500 font-light hidden sm:inline">
                        ({formatCurrency(candy.revenue, config.currencySymbol)})
                      </span>
                    </div>
                  </div>

                  {/* Visual progress bar */}
                  <div className="w-full bg-purple-100/60 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isFirst
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : isSecond
                          ? 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7]'
                          : 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Methods Breakdown Cards (Bancolombia, Daviplata, Nequi, Transferencia, Efectivo) */}
      <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs space-y-3">
        <h3 className="font-medium text-[#581c87] text-sm flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-[#0ea5e9]" />
          <span>Ventas por Medio de Pago en COP</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PAYMENT_METHODS.map((pm) => {
            const st = paymentMethodStats[pm.id];
            const isFilterActive = selectedPaymentMethod === pm.id;

            return (
              <div
                key={pm.id}
                onClick={() => setSelectedPaymentMethod(isFilterActive ? 'todos' : pm.id)}
                className={`p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isFilterActive
                    ? 'bg-purple-100/50 border-[#7c3aed] ring-2 ring-[#7c3aed]/40 shadow-xs'
                    : 'bg-purple-50/40 border-purple-100/70 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-800">{pm.label}</span>
                  <span className="text-[10px] text-slate-400 font-light">{st.count} cobros</span>
                </div>
                <div className="font-semibold text-sm text-[#581c87] mt-1">
                  {formatCurrency(st.total, config.currencySymbol)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Transactions History Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#6d28d9]" />
            <h3 className="font-medium text-[#581c87] text-sm">
              Historial de Tickets Emitidos
            </h3>
            <span className="text-xs text-purple-600 font-light">({displayedSales.length})</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ticket o dulce..."
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 bg-purple-50/40 border border-purple-100 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>
        </div>

        {displayedSales.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-light">
            No hay registros de ventas para los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50 text-purple-900/70 font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Detalle de Productos</th>
                  <th className="py-2.5 px-4">Medio de Pago</th>
                  <th className="py-2.5 px-4 text-right">Total (COP)</th>
                  <th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-800">
                {displayedSales.map((sale, index) => (
                  <tr key={`${sale.id}-${sale.timestamp}-${index}`} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#6d28d9]">
                      {sale.id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-light">
                      {formatDateTime(sale.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 max-w-xs">
                        {sale.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 truncate text-slate-700">
                            {/* Real flag SVG icon, no initials */}
                            <div className="inline-flex p-0.5 rounded bg-purple-50/60 border border-purple-100/60 shrink-0">
                              <CountryFlag countryCode={it.countryFlag || 'CO'} size="sm" />
                            </div>
                            <span className="font-medium text-[#581c87]">{it.quantity}x</span>{' '}
                            <span className="truncate">{it.name}</span>
                            <span className="text-[10px] text-purple-500 font-light">({it.group})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-slate-700 font-medium">
                        {sale.paymentMethod === 'bancolombia' ? 'Bancolombia' :
                         sale.paymentMethod === 'daviplata' ? 'Daviplata' :
                         sale.paymentMethod === 'nequi' ? 'Nequi' :
                         sale.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#581c87] text-sm whitespace-nowrap">
                      {formatCurrency(sale.total, config.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTicket(sale)}
                          className="py-1 px-3 bg-purple-50 hover:bg-purple-100 text-[#6d28d9] font-medium text-[11px] rounded-lg transition-colors flex items-center gap-1 border border-purple-100"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          <span>Ver Ticket</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas eliminar la venta ${sale.id}?`)) {
                              onDeleteSale(sale.id);
                            }
                          }}
                          title="Eliminar venta"
                          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
