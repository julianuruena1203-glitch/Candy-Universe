import React, { useState, useMemo } from 'react';
import { Sale, Expense, ExpenseCategory, PaymentMethod, BusinessConfig, DailyClosure } from '../types';
import { formatCurrency, formatTimeOnly } from '../utils/format';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  Receipt,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  Smartphone,
  CreditCard
} from 'lucide-react';

interface CuadreViewProps {
  sales: Sale[];
  expenses: Expense[];
  config: BusinessConfig;
  closures: DailyClosure[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onSaveClosure?: (closure: DailyClosure) => void;
  onViewTicket: (sale: Sale) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Mercancía / Proveedores',
  'Aseo y Empaques',
  'Servicios Públicos',
  'Transporte / Domicilios',
  'Alimentación',
  'Nómina / Turno',
  'Mantenimiento',
  'Otros Gastos',
];

const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  bancolombia: 'Bancolombia',
  daviplata: 'Daviplata',
  nequi: 'Nequi',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
};

export const CuadreView: React.FC<CuadreViewProps> = ({
  sales,
  expenses,
  config,
  onAddExpense,
  onDeleteExpense,
  onViewTicket,
}) => {
  // Date selection (default today YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Cash drawer initial base & physically counted cash
  const [initialCash, setInitialCash] = useState<number>(0);
  const [countedCash, setCountedCash] = useState<string>('');
  const [closureNotes, setClosureNotes] = useState<string>('');

  // Expandable sections
  const [showSalesList, setShowSalesList] = useState<boolean>(false);
  const [showExpensesForm, setShowExpensesForm] = useState<boolean>(true);

  // New Expense form state
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Mercancía / Proveedores');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('efectivo');
  const [expenseNote, setExpenseNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Modal for printable closure receipt
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Filter sales for the selected date
  const dateSales = useMemo(() => {
    return sales.filter((s) => {
      const saleDate = new Date(s.timestamp).toISOString().split('T')[0];
      return saleDate === selectedDate;
    });
  }, [sales, selectedDate]);

  // Filter expenses for the selected date
  const dateExpenses = useMemo(() => {
    return expenses.filter((e) => {
      return e.dateStr === selectedDate;
    });
  }, [expenses, selectedDate]);

  // Consolidate Sales totals
  const totalSalesIncome = useMemo(() => {
    return dateSales.reduce((acc, s) => acc + s.total, 0);
  }, [dateSales]);

  // Consolidate Sales by Payment Method
  const salesByPayment = useMemo(() => {
    const map: Record<PaymentMethod, { total: number; count: number }> = {
      efectivo: { total: 0, count: 0 },
      nequi: { total: 0, count: 0 },
      daviplata: { total: 0, count: 0 },
      bancolombia: { total: 0, count: 0 },
      transferencia: { total: 0, count: 0 },
    };

    dateSales.forEach((s) => {
      if (map[s.paymentMethod]) {
        map[s.paymentMethod].total += s.total;
        map[s.paymentMethod].count += 1;
      }
    });

    return map;
  }, [dateSales]);

  // Consolidate Expenses totals
  const totalExpensesAmount = useMemo(() => {
    return dateExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [dateExpenses]);

  // Expenses paid with cash from drawer
  const cashExpensesAmount = useMemo(() => {
    return dateExpenses
      .filter((e) => e.paymentMethod === 'efectivo')
      .reduce((acc, e) => acc + e.amount, 0);
  }, [dateExpenses]);

  // Final Net Value (Ingresos menos Gastos)
  const netIncome = totalSalesIncome - totalExpensesAmount;

  // Expected Cash in Register (Caja Física)
  // Base inicial + Ventas Efectivo - Gastos Efectivo
  const expectedCashInRegister = initialCash + salesByPayment.efectivo.total - cashExpensesAmount;

  // Counted cash vs expected cash difference
  const countedNum = countedCash === '' ? null : Number(countedCash);
  const cashDifference = countedNum !== null ? countedNum - expectedCashInRegister : null;

  // Handle adding expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanDesc = expenseDesc.trim();
    const cleanAmount = Number(expenseAmount);

    if (!cleanDesc) {
      setFormError('Por favor ingresa el concepto o motivo del gasto.');
      return;
    }
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setFormError('El valor del gasto debe ser un monto mayor a 0 COP.');
      return;
    }

    onAddExpense({
      description: cleanDesc,
      amount: cleanAmount,
      category: expenseCategory,
      paymentMethod: expensePaymentMethod,
      timestamp: Date.now(),
      dateStr: selectedDate,
      note: expenseNote.trim() || undefined,
    });

    // Reset form fields
    setExpenseDesc('');
    setExpenseAmount('');
    setExpenseNote('');
  };

  // Friendly date display
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 font-light space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-[#6d28d9]">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-normal text-purple-950 tracking-tight">
                Cuadre y Cierre del Día
              </h1>
            </div>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-purple-50/60 p-1.5 rounded-xl border border-purple-100">
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              selectedDate === todayStr
                ? 'bg-white text-[#6d28d9] font-medium shadow-xs'
                : 'text-slate-600 hover:text-[#6d28d9]'
            }`}
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              setSelectedDate(yesterday.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 text-xs rounded-lg text-slate-600 hover:text-[#6d28d9] transition-all"
          >
            Ayer
          </button>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-purple-100">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-lg transition-all shadow-xs"
            title="Imprimir o ver tirilla de cuadre"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cuadre</span>
          </button>
        </div>
      </div>

      {/* Date Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-purple-200 font-medium">
            Fecha Seleccionada
          </span>
          <p className="text-base sm:text-lg font-normal capitalize">
            {formattedSelectedDate}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-purple-200">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            {dateSales.length} {dateSales.length === 1 ? 'Venta' : 'Ventas'}
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full">
            {dateExpenses.length} {dateExpenses.length === 1 ? 'Gasto' : 'Gastos'}
          </span>
        </div>
      </div>

      {/* THREE MAIN CONSOLIDATION CARDS (Ingresos, Gastos, Balance Final) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Ingresos Totales por Ventas */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
              Ingresos Totales (Ventas)
            </span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 relative">
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-900">
              {formatCurrency(totalSalesIncome)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              <span>{dateSales.length} transacciones registradas</span>
            </p>
          </div>
        </div>

        {/* 2. Gastos Totales del Día */}
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <span className="text-xs font-medium text-rose-700 uppercase tracking-wider">
              Gastos Totales del Día
            </span>
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 relative">
            <div className="text-2xl sm:text-3xl font-semibold text-rose-900">
              {formatCurrency(totalExpensesAmount)}
            </div>
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{dateExpenses.length} egresos reportados</span>
            </p>
          </div>
        </div>

        {/* 3. Valor Final: Ingresos menos Gastos */}
        <div className={`rounded-2xl p-5 border shadow-xs relative overflow-hidden ${
          netIncome >= 0 
            ? 'bg-gradient-to-br from-purple-50 to-indigo-50/50 border-purple-200' 
            : 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-900 uppercase tracking-wider">
              Valor Final (Ingresos - Gastos)
            </span>
            <span className={`p-2 rounded-xl ${
              netIncome >= 0 ? 'bg-purple-200 text-purple-900' : 'bg-rose-200 text-rose-900'
            }`}>
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-bold ${
              netIncome >= 0 ? 'text-[#6d28d9]' : 'text-rose-700'
            }`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              {netIncome >= 0 ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Balance neto a favor</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span className="text-rose-700 font-medium">Los gastos superan los ingresos</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ARQUEO DE CAJA FÍSICA (EFECTIVO) & MEDIOS DE PAGO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Cuadre de Efectivo en Caja */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-50 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-medium text-purple-950">
                  Arqueo de Caja Física (Efectivo)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Efectivo real que debe haber físicamente en el cajón de dinero.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              Caja Física
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Base Inicial */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>(+) Base Inicial de Caja (Apertura):</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="0"
                  value={initialCash || ''}
                  onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-right text-xs bg-white rounded-lg border border-slate-200 focus:outline-hidden focus:border-purple-400 font-medium"
                />
                <span className="text-slate-400">COP</span>
              </div>
            </div>

            {/* Ventas en Efectivo */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-emerald-800">
                (+) Ventas cobradas en Efectivo:
              </span>
              <span className="font-semibold text-emerald-900">
                {formatCurrency(salesByPayment.efectivo.total)}
              </span>
            </div>

            {/* Gastos Pagados en Efectivo */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-rose-800">
                (-) Gastos pagados con Efectivo de caja:
              </span>
              <span className="font-semibold text-rose-900">
                -{formatCurrency(cashExpensesAmount)}
              </span>
            </div>

            {/* Efectivo Esperado en Caja */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-medium">
              <span className="text-xs">(=) Efectivo Total Esperado en Caja:</span>
              <span className="text-base font-bold text-[#6d28d9]">
                {formatCurrency(expectedCashInRegister)}
              </span>
            </div>

            {/* Verificación: Efectivo Contado Físicamente */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  ¿Cuánto dinero físico contaste en el cajón?:
                </label>
                {cashDifference !== null && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    cashDifference === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : cashDifference > 0
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {cashDifference === 0
                      ? '¡Cuadre Exacto!'
                      : cashDifference > 0
                      ? `Sobra: +${formatCurrency(cashDifference)}`
                      : `Falta: -${formatCurrency(Math.abs(cashDifference))}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ingresa el efectivo contado físicamente"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full pl-6 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 font-medium"
                  />
                </div>
                {countedCash && (
                  <button
                    type="button"
                    onClick={() => setCountedCash('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Desglose de Ventas por Medio de Pago */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-purple-50 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-[#6d28d9]">
                <Wallet className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-medium text-purple-950">
                  Ventas por Medio de Pago
                </h2>
                <p className="text-[11px] text-slate-500">
                  Consolidado de dinero recibido según cada canal o billetera.
                </p>
              </div>
            </div>
            <span className="text-xs text-purple-700 font-medium">
              Total: {formatCurrency(totalSalesIncome)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Efectivo */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-800">Efectivo</span>
                <span className="text-slate-400 text-[10px]">({salesByPayment.efectivo.count} ventas)</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(salesByPayment.efectivo.total)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalSalesIncome > 0
                    ? `${Math.round((salesByPayment.efectivo.total / totalSalesIncome) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Nequi */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-purple-100 bg-purple-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-[#7c3aed]" />
                  Nequi
                </span>
                <span className="text-slate-400 text-[10px]">({salesByPayment.nequi.count} ventas)</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(salesByPayment.nequi.total)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalSalesIncome > 0
                    ? `${Math.round((salesByPayment.nequi.total / totalSalesIncome) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Daviplata */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-rose-100 bg-rose-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-rose-500" />
                  Daviplata
                </span>
                <span className="text-slate-400 text-[10px]">({salesByPayment.daviplata.count} ventas)</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(salesByPayment.daviplata.total)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalSalesIncome > 0
                    ? `${Math.round((salesByPayment.daviplata.total / totalSalesIncome) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Bancolombia */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-amber-100 bg-amber-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Building className="w-3 h-3 text-amber-600" />
                  Bancolombia
                </span>
                <span className="text-slate-400 text-[10px]">({salesByPayment.bancolombia.count} ventas)</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(salesByPayment.bancolombia.total)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalSalesIncome > 0
                    ? `${Math.round((salesByPayment.bancolombia.total / totalSalesIncome) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>

            {/* Transferencia */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-sky-100 bg-sky-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="font-medium text-slate-800">Transferencia</span>
                <span className="text-slate-400 text-[10px]">({salesByPayment.transferencia.count} ventas)</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(salesByPayment.transferencia.total)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {totalSalesIncome > 0
                    ? `${Math.round((salesByPayment.transferencia.total / totalSalesIncome) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRO Y GESTIÓN DE GASTOS DIARIOS */}
      <div className="bg-white rounded-2xl border border-purple-100/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-normal text-purple-950">
                Gastos Diarios del Negocio
              </h2>
              <p className="text-xs text-slate-500">
                Registra compras de insumos, aseo, domicilios o pagos a proveedores para deducirlos del cuadre.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExpensesForm(!showExpensesForm)}
            className="flex items-center gap-1.5 text-xs text-[#6d28d9] font-medium hover:underline"
          >
            {showExpensesForm ? (
              <>
                <span>Ocultar formulario</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>+ Registrar gasto</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Expense Creation Form */}
        {showExpensesForm && (
          <form onSubmit={handleCreateExpense} className="p-4 sm:p-5 bg-purple-50/30 border-b border-purple-100/70 space-y-4">
            <h3 className="text-xs font-semibold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-[#6d28d9]" />
              Nuevo Registro de Gasto para el día ({selectedDate})
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Concepto / Descripción */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-slate-700">Concepto o Descripción:</label>
                <input
                  type="text"
                  placeholder="Ej: Bolsas de papel, pago refrescos, aseo..."
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Monto en COP */}
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Valor del Gasto (COP):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Monto en COP"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full pl-6 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Categoría:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medio de Pago del Gasto */}
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Pagado con:</label>
                <select
                  value={expensePaymentMethod}
                  onChange={(e) => setExpensePaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                >
                  <option value="efectivo">Efectivo de Caja</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="bancolombia">Bancolombia</option>
                  <option value="transferencia">Transferencia</option>
                </select>
                {expensePaymentMethod === 'efectivo' && (
                  <span className="text-[10px] text-rose-600 block">
                    * Descuenta directamente del efectivo en caja.
                  </span>
                )}
              </div>

              {/* Nota Adicional */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-slate-700">Nota u observación (Opcional):</label>
                <input
                  type="text"
                  placeholder="Factura #, proveedor o detalle..."
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Botón de Enviar */}
              <div className="flex items-end sm:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-medium shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Guardar Gasto</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Expenses List */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-600">
              Gastos registrados en la fecha ({dateExpenses.length}):
            </span>
            <span className="text-xs font-semibold text-rose-800">
              Total Egresos: {formatCurrency(totalExpensesAmount)}
            </span>
          </div>

          {dateExpenses.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              No hay gastos registrados para el {selectedDate}.
              <p className="mt-1 text-slate-500">
                Utiliza el formulario de arriba para añadir los gastos del día.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-purple-100 text-slate-500 font-medium pb-2">
                    <th className="py-2 px-3">Hora</th>
                    <th className="py-2 px-3">Descripción</th>
                    <th className="py-2 px-3">Categoría</th>
                    <th className="py-2 px-3">Medio de Pago</th>
                    <th className="py-2 px-3 text-right">Monto</th>
                    <th className="py-2 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {dateExpenses.map((exp, idx) => (
                    <tr key={`${exp.id}-${idx}`} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTimeOnly(exp.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {exp.description}
                        {exp.note && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {exp.note}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          exp.paymentMethod === 'efectivo'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}>
                          {PAYMENT_METHOD_NAMES[exp.paymentMethod]}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-rose-700 whitespace-nowrap">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el gasto "${exp.description}"?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* VENTAS DEL DÍA (EXPANDIBLE) */}
      <div className="bg-white rounded-2xl border border-purple-100/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSalesList(!showSalesList)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-purple-50/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-[#6d28d9]">
              <Receipt className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-normal text-purple-950">
                Detalle de Ventas del Día ({dateSales.length})
              </h2>
              <p className="text-xs text-slate-500">
                Listado de comprobantes y tickets expedidos en la fecha seleccionada.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-700">
              {formatCurrency(totalSalesIncome)}
            </span>
            {showSalesList ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {showSalesList && (
          <div className="p-4 sm:p-5 border-t border-purple-50">
            {dateSales.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No hay ventas registradas en esta fecha.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-purple-100 text-slate-500 font-medium">
                      <th className="py-2 px-3">Ticket</th>
                      <th className="py-2 px-3">Hora</th>
                      <th className="py-2 px-3">Productos</th>
                      <th className="py-2 px-3">Medio de Pago</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-center">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {dateSales.map((sale, idx) => (
                      <tr key={`${sale.id}-${sale.timestamp}-${idx}`} className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#6d28d9]">
                          {sale.id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {formatTimeOnly(sale.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {sale.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px] font-medium">
                            {PAYMENT_METHOD_NAMES[sale.paymentMethod]}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onViewTicket(sale)}
                            className="p-1 text-[#6d28d9] hover:bg-purple-100 rounded-lg transition-colors"
                            title="Ver ticket"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOTAS Y CONCLUSIÓN DEL CIERRE DEL DÍA */}
      <div className="bg-white rounded-2xl p-5 border border-purple-100/90 shadow-xs space-y-3">
        <label className="text-xs font-semibold text-purple-950 uppercase tracking-wider block">
          Observaciones o Notas de Cierre del Día:
        </label>
        <textarea
          rows={2}
          placeholder="Ej: Todo cuadró con normalidad, se pagó proveedor de chocolates en efectivo..."
          value={closureNotes}
          onChange={(e) => setClosureNotes(e.target.value)}
          className="w-full p-3 text-xs bg-slate-50/60 rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 font-light"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            * El balance consolidado se mantiene guardado en tu navegador en tiempo real.
          </div>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs font-medium rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Generar e Imprimir Cuadre del Día</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE CLOSURE RECEIPT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <h3 className="text-sm font-semibold text-purple-950 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#6d28d9]" />
                Comprobante de Cuadre Diario
              </h3>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>

            {/* Printable Area styled like thermal ticket */}
            <div className="printable-ticket font-mono text-xs border border-dashed border-slate-300 p-4 rounded-xl space-y-3 bg-[#fdfdfd]">
              <div className="text-center space-y-0.5">
                <h2 className="font-bold text-sm text-slate-900">{config.storeName}</h2>
                <p className="text-[11px] text-slate-500">{config.storeSubtitle}</p>
                <div className="border-t border-dashed border-slate-300 my-2" />
                <p className="font-bold text-[12px] uppercase">*** CIERRE Y CUADRE DIARIO ***</p>
                <p className="text-[11px] text-slate-600">Fecha: {formattedSelectedDate}</p>
              </div>

              <div className="border-t border-dashed border-slate-300 my-2" />

              {/* Resumen General */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>TOTAL INGRESOS (VENTAS):</span>
                  <span className="font-bold">{formatCurrency(totalSalesIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL GASTOS DEL DÍA:</span>
                  <span className="font-bold">-{formatCurrency(totalExpensesAmount)}</span>
                </div>
                <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-sm">
                  <span>VALOR FINAL NETO:</span>
                  <span>{formatCurrency(netIncome)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 my-2" />

              {/* Desglose por Medio de Pago */}
              <div className="space-y-1">
                <p className="font-bold text-[11px]">VENTAS POR MEDIO DE PAGO:</p>
                <div className="flex justify-between">
                  <span>Efectivo ({salesByPayment.efectivo.count}):</span>
                  <span>{formatCurrency(salesByPayment.efectivo.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nequi ({salesByPayment.nequi.count}):</span>
                  <span>{formatCurrency(salesByPayment.nequi.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daviplata ({salesByPayment.daviplata.count}):</span>
                  <span>{formatCurrency(salesByPayment.daviplata.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bancolombia ({salesByPayment.bancolombia.count}):</span>
                  <span>{formatCurrency(salesByPayment.bancolombia.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transferencia ({salesByPayment.transferencia.count}):</span>
                  <span>{formatCurrency(salesByPayment.transferencia.total)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 my-2" />

              {/* Arqueo Efectivo en Caja */}
              <div className="space-y-1">
                <p className="font-bold text-[11px]">ARQUEO DE CAJA FÍSICA:</p>
                {initialCash > 0 && (
                  <div className="flex justify-between">
                    <span>Base inicial de apertura:</span>
                    <span>{formatCurrency(initialCash)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>(+) Ventas Efectivo:</span>
                  <span>{formatCurrency(salesByPayment.efectivo.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Gastos Efectivo:</span>
                  <span>-{formatCurrency(cashExpensesAmount)}</span>
                </div>
                <div className="border-t border-slate-300 pt-1 flex justify-between font-bold">
                  <span>EFECTIVO ESPERADO:</span>
                  <span>{formatCurrency(expectedCashInRegister)}</span>
                </div>
                {countedNum !== null && (
                  <>
                    <div className="flex justify-between">
                      <span>Efectivo Contado:</span>
                      <span>{formatCurrency(countedNum)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>DIFERENCIA:</span>
                      <span>
                        {cashDifference === 0
                          ? 'EXACTO (0)'
                          : cashDifference! > 0
                          ? `SOBRANTE: +${formatCurrency(cashDifference!)}`
                          : `FALTANTE: -${formatCurrency(Math.abs(cashDifference!))}`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Lista resumida de Gastos si existen */}
              {dateExpenses.length > 0 && (
                <>
                  <div className="border-t border-dashed border-slate-300 my-2" />
                  <div className="space-y-1">
                    <p className="font-bold text-[11px]">DETALLE DE GASTOS:</p>
                    {dateExpenses.map((exp, idx) => (
                      <div key={`${exp.id}-${idx}`} className="flex justify-between text-[11px]">
                        <span className="truncate pr-2">{exp.description}</span>
                        <span>-{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {closureNotes && (
                <>
                  <div className="border-t border-dashed border-slate-300 my-2" />
                  <p className="text-[11px]">
                    <span className="font-bold">Notas:</span> {closureNotes}
                  </p>
                </>
              )}

              <div className="border-t border-dashed border-slate-300 my-3" />
              <div className="text-center pt-2 space-y-4">
                <p className="text-[10px] text-slate-400">
                  Firma Responsable: _______________________
                </p>
                <p className="text-[10px] text-slate-400">
                  Candy Universe POS • {new Date().toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 no-print pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-medium rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket de Cierre</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
