import React, { useState, useMemo } from 'react';
import { Product, ProductGroup, CartItem, PaymentMethod, SaleType } from '../types';
import { formatCurrency } from '../utils/format';
import { PRODUCT_GROUPS } from '../data/countries';
import { CountryFlag } from './CountryFlag';
import { 
  Search, 
  Plus, 
  Minus, 
  ArrowRight, 
  Banknote, 
  QrCode, 
  ShoppingBag, 
  RotateCcw,
  Package,
  Tag,
  Box
} from 'lucide-react';

interface PosViewProps {
  products: Product[];
  currencySymbol: string;
  cart: CartItem[];
  isAdmin?: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCompleteSale: (saleData: {
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    change?: number;
    note?: string;
  }) => void;
  onOpenNewProductModal: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  currencySymbol,
  cart,
  isAdmin = false,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCompleteSale,
  onOpenNewProductModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'Todos' | ProductGroup>('Todos');
  const [selectedSaleType, setSelectedSaleType] = useState<'all' | SaleType>('all');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [saleNote, setSaleNote] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Cart total calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cashReceived = parseFloat(cashReceivedInput) || 0;
  const changeToReturn = Math.max(0, cashReceived - totalAmount);
  const canCompleteSale = 
    cart.length > 0 &&
    (paymentMethod !== 'efectivo' || cashReceived >= totalAmount);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.group.toLowerCase().includes(q);
      const matchesGroup = selectedGroup === 'Todos' || p.group === selectedGroup;
      const matchesSaleType = selectedSaleType === 'all' || p.saleType === selectedSaleType;
      const matchesCountry = !selectedCountryCode || p.countryFlag === selectedCountryCode;
      return matchesSearch && matchesGroup && matchesSaleType && matchesCountry;
    });
  }, [products, search, selectedGroup, selectedSaleType, selectedCountryCode]);

  // Unique country codes available in catalog
  const availableCountryCodes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.countryFlag) set.add(p.countryFlag);
    });
    return Array.from(set);
  }, [products]);

  // Cart lookup map for rapid quantity badges
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  const handleQuickCash = (amount: number) => {
    setCashReceivedInput(String(amount));
  };

  const handleExactCash = () => {
    setCashReceivedInput(String(Math.ceil(totalAmount)));
  };

  const handleSubmitSale = () => {
    if (!canCompleteSale) return;
    onCompleteSale({
      paymentMethod,
      cashReceived: paymentMethod === 'efectivo' ? (cashReceived || totalAmount) : undefined,
      change: paymentMethod === 'efectivo' ? changeToReturn : undefined,
      note: saleNote.trim() || undefined,
    });
    setCashReceivedInput('');
    setSaleNote('');
    setMobileCartOpen(false);
  };

  // Quick cash bill recommendations based on total (adaptive for COP)
  const quickCashOptions = useMemo(() => {
    const ceilTotal = Math.ceil(totalAmount);
    const options: number[] = [];
    const bills = [2000, 5000, 10000, 20000, 50000, 100000];

    for (const b of bills) {
      if (b >= ceilTotal && options.length < 4) {
        options.push(b);
      }
    }
    if (options.length === 0) {
      const smallBills = [10, 20, 50, 100, 200, 500];
      for (const b of smallBills) {
        if (b >= ceilTotal && options.length < 4) {
          options.push(b);
        }
      }
    }
    return options;
  }, [totalAmount]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col lg:flex-row gap-5 pb-24 lg:pb-8">
      {/* LEFT COLUMN: Products Catalog & Search */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Search bar & filter controls */}
        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs shadow-purple-950/5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar dulce o producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-700 text-xs font-medium"
                >
                  ✕
                </button>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={onOpenNewProductModal}
                className="h-10 px-3.5 bg-gradient-to-r from-purple-50 to-cyan-50 hover:from-purple-100 hover:to-cyan-100 text-[#6d28d9] border border-purple-200/80 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#0ea5e9]" />
                <span className="hidden sm:inline">Nuevo Dulce</span>
              </button>
            )}
          </div>

          {/* Type Filter: Todos | Al Detal | Al Por Mayor */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-purple-600/80 font-light shrink-0">Modalidad:</span>
            <div className="flex items-center gap-1 p-0.5 bg-purple-50 rounded-xl border border-purple-100">
              <button
                onClick={() => setSelectedSaleType('all')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  selectedSaleType === 'all'
                    ? 'bg-white text-purple-950 font-medium shadow-xs'
                    : 'text-purple-800/70 hover:text-purple-950'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedSaleType('detal')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all ${
                  selectedSaleType === 'detal'
                    ? 'bg-white text-purple-950 font-medium shadow-xs'
                    : 'text-purple-800/70 hover:text-purple-950'
                }`}
              >
                <Tag className="w-3 h-3 text-[#0ea5e9]" />
                <span>Detal</span>
              </button>
              <button
                onClick={() => setSelectedSaleType('mayor')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all ${
                  selectedSaleType === 'mayor'
                    ? 'bg-white text-purple-950 font-medium shadow-xs'
                    : 'text-purple-800/70 hover:text-purple-950'
                }`}
              >
                <Box className="w-3 h-3 text-[#7c3aed]" />
                <span>Por Mayor</span>
              </button>
            </div>
          </div>

          {/* Group Filter Buttons (Alphabetical order: Bebida, Chicle, Chocolate, Galleta, Gomas, Paletas, Papas, Pasta) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedGroup('Todos')}
              className={`px-3 py-1.5 text-xs font-normal rounded-xl whitespace-nowrap transition-all ${
                selectedGroup === 'Todos'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25 scale-[1.02]'
                  : 'bg-purple-50/60 text-purple-900 hover:bg-purple-100/80 border border-purple-100'
              }`}
            >
              Todos
            </button>
            {PRODUCT_GROUPS.map((grp) => {
              const active = selectedGroup === grp;
              return (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-3 py-1.5 text-xs font-normal rounded-xl whitespace-nowrap transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25 scale-[1.02]'
                      : 'bg-purple-50/60 text-purple-900 hover:bg-purple-100/80 border border-purple-100'
                  }`}
                >
                  {grp}
                </button>
              );
            })}
          </div>

          {/* Country Flag Quick Filter (Shows real visual flag SVG icon, NOT initials) */}
          {availableCountryCodes.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-purple-50 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-purple-600/70 font-light mr-1 shrink-0">
                País:
              </span>
              <button
                onClick={() => setSelectedCountryCode(null)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  selectedCountryCode === null
                    ? 'bg-purple-200/80 text-[#581c87] font-medium'
                    : 'bg-purple-50/50 text-slate-500 hover:bg-purple-100'
                }`}
              >
                Todos
              </button>
              {availableCountryCodes.map((code) => (
                <button
                  key={code}
                  onClick={() =>
                    setSelectedCountryCode(selectedCountryCode === code ? null : code)
                  }
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                    selectedCountryCode === code
                      ? 'bg-white ring-2 ring-[#7c3aed] shadow-xs scale-110'
                      : 'bg-white/60 hover:bg-white opacity-80 hover:opacity-100 border border-purple-100/70'
                  }`}
                  title={`Filtrar por país ${code}`}
                >
                  <CountryFlag countryCode={code} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Cards Grid (Displays attached image, SVG flag icon, presentation badge) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-purple-100 p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <Package className="w-10 h-10 stroke-1 text-purple-300 mb-2" />
            <p className="font-medium text-base text-purple-950">
              No se encontraron productos
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs font-light">
              Prueba con otro término de búsqueda o registra un nuevo producto en el catálogo.
            </p>
            {isAdmin && (
              <button
                onClick={onOpenNewProductModal}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] text-white font-medium text-xs rounded-xl hover:opacity-95 transition-opacity shadow-xs"
              >
                + Agregar Producto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map((product) => {
              const qtyInCart = cartQuantityMap.get(product.id) || 0;
              const isWholesale = product.saleType === 'mayor';

              return (
                <button
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className={`group relative text-left bg-white rounded-2xl p-3 border transition-all active:scale-[0.98] flex flex-col justify-between hover:shadow-md cursor-pointer overflow-hidden ${
                    qtyInCart > 0
                      ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/30 bg-cyan-50/20'
                      : 'border-purple-100/90 hover:border-purple-300'
                  }`}
                >
                  {/* Top row: Attached Image Preview or Badge + Country Flag SVG */}
                  <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-purple-50/70 border border-purple-100/60 mb-2 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-100/50 via-pink-50 to-cyan-50/50 flex flex-col items-center justify-center text-purple-300">
                        <Package className="w-8 h-8 stroke-1 text-purple-300" />
                        <span className="text-[10px] text-purple-400 font-light mt-1">
                          {product.group}
                        </span>
                      </div>
                    )}

                    {/* Country Flag SVG (Always real flag graphics, not text initials) */}
                    <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-white/90 backdrop-blur-xs shadow-xs border border-purple-100 flex items-center justify-center">
                      <CountryFlag countryCode={product.countryFlag || 'CO'} size="sm" />
                    </div>

                    {/* Wholesale/Retail badge */}
                    <div
                      className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium shadow-2xs ${
                        isWholesale
                          ? 'bg-purple-900/90 text-white'
                          : 'bg-cyan-600/90 text-white'
                      }`}
                    >
                      {isWholesale ? 'Por Mayor' : 'Detal'}
                    </div>

                    {/* Cart Quantity Badge */}
                    {qtyInCart > 0 && (
                      <div className="absolute top-1.5 right-1.5 h-5 px-2 rounded-full bg-[#0ea5e9] text-white text-[11px] font-semibold flex items-center justify-center shadow-xs shadow-cyan-500/30">
                        {qtyInCart}
                      </div>
                    )}
                  </div>

                  {/* Candy Title & Group */}
                  <div className="w-full">
                    <h3 className="font-normal text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#6d28d9] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-purple-600/80 mt-0.5 truncate font-light">
                      {product.group}
                    </p>
                  </div>

                  {/* Price in COP */}
                  <div className="mt-2.5 pt-2 border-t border-purple-50 flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-semibold text-[#581c87]">
                      {formatCurrency(product.price, currencySymbol)}
                    </span>
                    <span className="w-6 h-6 rounded-lg bg-purple-50 group-hover:bg-gradient-to-r group-hover:from-[#6d28d9] group-hover:to-[#0ea5e9] group-hover:text-white text-purple-700 flex items-center justify-center transition-all shadow-2xs">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Active Sale Order & Checkout */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 lg:static lg:w-96 flex flex-col bg-white rounded-t-3xl lg:rounded-2xl border border-purple-100 shadow-xl lg:shadow-xs shadow-purple-950/10 transition-transform duration-300 ${
          mobileCartOpen ? 'translate-y-0 max-h-[88vh]' : 'translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Order Header */}
        <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 to-cyan-50/40 lg:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6d28d9] text-white flex items-center justify-center text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-medium text-slate-900 text-sm">
              Venta en Curso
            </h2>
            <span className="text-xs text-purple-600 font-light">
              ({totalItemsCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                title="Vaciar carrito"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            <button
              onClick={() => setMobileCartOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-purple-50 min-h-[120px] max-h-[30vh] lg:max-h-[260px]">
          {cart.length === 0 ? (
            <div className="h-full py-8 text-center flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag className="w-8 h-8 stroke-1 text-purple-200 mb-2" />
              <p className="font-medium text-xs text-purple-900/70">
                La cuenta está vacía
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-light">
                Toca cualquier producto para sumarlo a la venta.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <CountryFlag countryCode={item.product.countryFlag || 'CO'} size="sm" />
                    <h4 className="font-normal text-xs text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-light">
                    {formatCurrency(item.product.price, currencySymbol)} c/u
                    {item.product.saleType === 'mayor' && (
                      <span className="ml-1 text-[10px] text-purple-600 font-medium">(Por Mayor)</span>
                    )}
                  </div>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 flex items-center justify-center text-xs transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-normal text-xs text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 flex items-center justify-center text-xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right pl-2 min-w-[70px]">
                  <span className="text-xs font-semibold text-[#581c87] block whitespace-nowrap">
                    {formatCurrency(item.product.price * item.quantity, currencySymbol)}
                  </span>
                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="text-[10px] text-rose-500 hover:text-rose-700 transition-colors font-normal"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Payment & Total Footer */}
        <div className="p-4 border-t border-purple-100 bg-purple-50/30 space-y-3">
          {/* Total display */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-purple-900/70 tracking-wider">
              TOTAL A PAGAR:
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-[#581c87] tracking-tight">
              {formatCurrency(totalAmount, currencySymbol)}
            </span>
          </div>

          {/* Payment Method Switcher: Bancolombia, Daviplata, Nequi, Transferencia, Efectivo */}
          <div>
            <span className="block text-[11px] font-medium text-purple-900 mb-1.5">
              Medio de Pago:
            </span>
            <div className="grid grid-cols-5 gap-1 p-1 bg-purple-100/70 rounded-xl">
              {/* Bancolombia */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bancolombia')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                  paymentMethod === 'bancolombia'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                    : 'text-purple-900/80 hover:text-purple-950 font-light'
                }`}
              >
                <span className="font-bold text-[11px]">BC</span>
                <span className="truncate max-w-full">Bancolombia</span>
              </button>

              {/* Daviplata */}
              <button
                type="button"
                onClick={() => setPaymentMethod('daviplata')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                  paymentMethod === 'daviplata'
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'text-purple-900/80 hover:text-purple-950 font-light'
                }`}
              >
                <span className="font-bold text-[11px]">DP</span>
                <span className="truncate max-w-full">Daviplata</span>
              </button>

              {/* Nequi */}
              <button
                type="button"
                onClick={() => setPaymentMethod('nequi')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                  paymentMethod === 'nequi'
                    ? 'bg-[#20002c] text-pink-400 font-semibold shadow-xs ring-1 ring-pink-400/50'
                    : 'text-purple-900/80 hover:text-purple-950 font-light'
                }`}
              >
                <span className="font-bold text-[11px]">NQ</span>
                <span className="truncate max-w-full">Nequi</span>
              </button>

              {/* Transferencia */}
              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                  paymentMethod === 'transferencia'
                    ? 'bg-[#0ea5e9] text-white font-semibold shadow-xs'
                    : 'text-purple-900/80 hover:text-purple-950 font-light'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-full">Transf.</span>
              </button>

              {/* Efectivo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                  paymentMethod === 'efectivo'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-purple-900/80 hover:text-purple-950 font-light'
                }`}
              >
                <Banknote className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-full">Efectivo</span>
              </button>
            </div>
          </div>

          {/* Cash input & Prominent Change Calculation when Efectivo */}
          {paymentMethod === 'efectivo' && totalAmount > 0 && (
            <div className="space-y-2.5 bg-white p-3 rounded-2xl border-2 border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-normal text-slate-700">Dinero que entrega el cliente:</span>
                <div className="relative w-40">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400 font-normal text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    placeholder="0 COP"
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    className="w-full h-8.5 pl-6 pr-2 bg-purple-50/40 border border-purple-200 rounded-lg text-right font-semibold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              {/* Quick bill denominations buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={handleExactCash}
                  className="px-2 py-1 text-[11px] font-normal bg-purple-50 hover:bg-purple-100 text-[#6d28d9] rounded-md transition-colors"
                >
                  Exacto
                </button>
                {quickCashOptions.map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => handleQuickCash(bill)}
                    className="px-2 py-1 text-[11px] font-normal bg-purple-50 hover:bg-purple-100 text-[#6d28d9] rounded-md transition-colors"
                  >
                    ${bill.toLocaleString('es-CO')}
                  </button>
                ))}
              </div>

              {/* Highlighted Banner: "CUANTO DINERO SE DEBE DEVOLVER" */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-900 block">
                    Dinero a Devolver (Cambio):
                  </span>
                  {cashReceived < totalAmount && cashReceived > 0 && (
                    <span className="text-[10px] text-rose-600 font-medium">
                      Faltan {formatCurrency(totalAmount - cashReceived, currencySymbol)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg sm:text-xl font-bold whitespace-nowrap ${
                      cashReceived >= totalAmount && cashReceived > 0
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(changeToReturn, currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Sale Button */}
          <button
            type="button"
            disabled={!canCompleteSale}
            onClick={handleSubmitSale}
            className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              canCompleteSale
                ? 'bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#0ea5e9] hover:opacity-95 active:scale-[0.99] text-white cursor-pointer shadow-purple-500/25'
                : 'bg-purple-100 text-purple-300 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Cobrar y Emitir Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Bar for Mobile to trigger Cart */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 bg-white/95 backdrop-blur-md border-t border-purple-100 z-30 no-print flex items-center justify-between gap-3 shadow-lg shadow-purple-950/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6d28d9] to-[#0ea5e9] text-white font-medium text-sm flex items-center justify-center shadow-xs">
            {totalItemsCount}
          </div>
          <div>
            <div className="text-[11px] text-purple-800 font-light">Total a cobrar</div>
            <div className="text-base font-semibold text-[#581c87] leading-none">
              {formatCurrency(totalAmount, currencySymbol)}
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileCartOpen(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-500/20"
        >
          <span>Ver Cuenta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
