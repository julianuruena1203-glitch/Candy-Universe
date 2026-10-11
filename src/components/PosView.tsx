import React, { useState, useMemo } from 'react';
import { Product, ProductGroup, CartItem, PaymentMethod } from '../types';
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
  Box,
  CreditCard,
  Building
} from 'lucide-react';

interface PosViewProps {
  products: Product[];
  currencySymbol: string;
  cart: CartItem[];
  isAdmin?: boolean;
  onAddToCart: (product: Product, priceType?: 'detal' | 'mayor') => void;
  onUpdateQuantity: (productId: string, quantity: number, priceType?: 'detal' | 'mayor') => void;
  onRemoveFromCart: (productId: string, priceType?: 'detal' | 'mayor') => void;
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
  const [activeRateMode, setActiveRateMode] = useState<'detal' | 'mayor'>('detal');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [saleNote, setSaleNote] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Cart total calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const uPrice = item.unitPrice ?? (item.priceType === 'mayor' ? (item.product.priceMayor || item.product.price) : (item.product.priceDetal || item.product.price));
      return sum + uPrice * item.quantity;
    }, 0);
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
      const matchesCountry = !selectedCountryCode || p.countryFlag === selectedCountryCode;
      return matchesSearch && matchesGroup && matchesCountry;
    });
  }, [products, search, selectedGroup, selectedCountryCode]);

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
    cart.forEach((item) => {
      const current = map.get(item.product.id) || 0;
      map.set(item.product.id, current + item.quantity);
    });
    return map;
  }, [cart]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col lg:flex-row gap-4 lg:gap-5 pb-24 lg:pb-8">
      {/* LEFT COLUMN: Catalog and Controls */}
      <div className="flex-1 space-y-3.5 min-w-0">
        {/* Search, Rate Mode & Filters Header */}
        <div className="bg-white p-3.5 rounded-3xl border border-purple-100 shadow-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar dulce por nombre o grupo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>

            {/* Active Rate Selector: Detal vs Por Mayor */}
            <div className="flex items-center gap-1.5 p-1 bg-purple-50/80 rounded-2xl border border-purple-100 shrink-0">
              <span className="text-[11px] text-purple-700/80 font-light px-2 hidden md:inline">
                Tarifa activa:
              </span>
              <button
                type="button"
                onClick={() => setActiveRateMode('detal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                  activeRateMode === 'detal'
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white font-medium shadow-xs shadow-cyan-500/20'
                    : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Al Detal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRateMode('mayor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                  activeRateMode === 'mayor'
                    ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white font-medium shadow-xs shadow-purple-500/20'
                    : 'text-purple-900/70 hover:text-purple-950 hover:bg-white/60'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Por Mayor</span>
              </button>
            </div>
          </div>

          {/* Group Filter Buttons (Alphabetical order) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedGroup('Todos')}
              className={`px-3 py-1.5 text-xs font-normal rounded-xl whitespace-nowrap transition-all ${
                selectedGroup === 'Todos'
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25 scale-[1.02]'
                  : 'bg-purple-50/60 text-purple-900 hover:bg-purple-100/80 border border-purple-100'
              }`}
            >
              Todos los grupos
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

          {/* Country Flag Quick Filter */}
          {availableCountryCodes.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-purple-50 overflow-x-auto no-scrollbar">
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

        {/* Product Cards Grid with Dual Prices (Detal & Por Mayor) */}
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
              const pDetal = product.priceDetal || product.price;
              const pMayor = product.priceMayor || Math.round(pDetal * 0.85);

              return (
                <div
                  key={product.id}
                  className={`group relative text-left bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between hover:shadow-md overflow-hidden ${
                    qtyInCart > 0
                      ? 'border-[#0ea5e9] ring-2 ring-[#0ea5e9]/30 bg-cyan-50/10'
                      : 'border-purple-100/90 hover:border-purple-300'
                  }`}
                >
                  {/* Top row: Attached Image Preview or Badge + Country Flag */}
                  <div
                    onClick={() => onAddToCart(product, activeRateMode)}
                    className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-purple-50/70 border border-purple-100/60 mb-2 flex items-center justify-center cursor-pointer"
                  >
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

                    {/* Country Flag SVG */}
                    <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-white/90 backdrop-blur-xs shadow-xs border border-purple-100 flex items-center justify-center">
                      <CountryFlag countryCode={product.countryFlag || 'CO'} size="sm" />
                    </div>

                    {/* Cart Quantity Badge */}
                    {qtyInCart > 0 && (
                      <div className="absolute top-1.5 right-1.5 h-5 px-2 rounded-full bg-[#0ea5e9] text-white text-[11px] font-semibold flex items-center justify-center shadow-xs shadow-cyan-500/30">
                        {qtyInCart}
                      </div>
                    )}
                  </div>

                  {/* Candy Title & Group */}
                  <div
                    onClick={() => onAddToCart(product, activeRateMode)}
                    className="w-full cursor-pointer"
                  >
                    <h3 className="font-normal text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#6d28d9] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-purple-600/80 mt-0.5 truncate font-light">
                      {product.group}
                    </p>
                  </div>

                  {/* Prices: Detal & Por Mayor with Direct One-Click Buttons */}
                  <div className="mt-2.5 pt-2 border-t border-purple-50 space-y-1.5">
                    {/* Botón Detal */}
                    <button
                      type="button"
                      onClick={() => onAddToCart(product, 'detal')}
                      className={`w-full py-1 px-2 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
                        activeRateMode === 'detal'
                          ? 'bg-cyan-50/90 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 font-medium'
                          : 'bg-purple-50/40 hover:bg-purple-50 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] text-cyan-800 font-medium flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        Detal:
                      </span>
                      <span className="font-semibold text-cyan-900">
                        {formatCurrency(pDetal, currencySymbol)}
                      </span>
                    </button>

                    {/* Botón Por Mayor */}
                    <button
                      type="button"
                      onClick={() => onAddToCart(product, 'mayor')}
                      className={`w-full py-1 px-2 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer ${
                        activeRateMode === 'mayor'
                          ? 'bg-purple-50/90 hover:bg-purple-100 text-purple-900 border border-purple-200 font-medium'
                          : 'bg-purple-50/40 hover:bg-purple-50 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] text-purple-800 font-medium flex items-center gap-1">
                        <Box className="w-2.5 h-2.5" />
                        Mayor:
                      </span>
                      <span className="font-semibold text-purple-900">
                        {formatCurrency(pMayor, currencySymbol)}
                      </span>
                    </button>
                  </div>
                </div>
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
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
            <button
              onClick={() => setMobileCartOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
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
                Toca cualquier producto al Detal o Por Mayor para sumarlo a la venta.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const priceType = item.priceType || 'detal';
              const uPrice = item.unitPrice ?? (priceType === 'mayor' ? (item.product.priceMayor || item.product.price) : (item.product.priceDetal || item.product.price));

              return (
                <div key={`${item.product.id}_${priceType}`} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <CountryFlag countryCode={item.product.countryFlag || 'CO'} size="sm" />
                      <h4 className="font-normal text-xs text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-light">
                      <span>{formatCurrency(uPrice, currencySymbol)} c/u</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          priceType === 'mayor'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {priceType === 'mayor' ? 'Mayor' : 'Detal'}
                      </span>
                    </div>
                  </div>

                  {/* Counter controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, priceType)}
                      className="w-6 h-6 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-normal text-xs text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, priceType)}
                      className="w-6 h-6 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right pl-2 min-w-[70px]">
                    <span className="text-xs font-semibold text-[#581c87] block whitespace-nowrap">
                      {formatCurrency(uPrice * item.quantity, currencySymbol)}
                    </span>
                    <button
                      onClick={() => onRemoveFromCart(item.product.id, priceType)}
                      className="text-[10px] text-rose-500 hover:text-rose-700 transition-colors font-normal cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Payment & Total Footer */}
        <div className="p-4 border-t border-purple-100 bg-purple-50/30 space-y-3">
          {/* Total display */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-purple-900/70 tracking-wider">
              TOTAL A PAGAR:
            </span>
            <span className="text-2xl font-bold text-[#581c87] tracking-tight">
              {formatCurrency(totalAmount, currencySymbol)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-normal text-purple-900 mb-1">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`py-2 px-1 text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'efectivo'
                    ? 'bg-emerald-600 text-white font-medium shadow-xs'
                    : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nequi')}
                className={`py-2 px-1 text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'nequi'
                    ? 'bg-[#20002c] text-pink-300 font-medium shadow-xs border border-pink-400/40'
                    : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-pink-400" />
                <span>Nequi</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bancolombia')}
                className={`py-2 px-1 text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'bancolombia'
                    ? 'bg-amber-400 text-slate-950 font-medium shadow-xs'
                    : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bancolombia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('daviplata')}
                className={`py-2 px-1 text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'daviplata'
                    ? 'bg-red-600 text-white font-medium shadow-xs'
                    : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Daviplata</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transferencia')}
                className={`col-span-2 py-2 px-1 text-xs rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'transferencia'
                    ? 'bg-[#0ea5e9] text-white font-medium shadow-xs'
                    : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Transferencia / Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Cash input & Change calculation if paying with cash */}
          {paymentMethod === 'efectivo' && (
            <div className="space-y-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-normal text-purple-950 shrink-0">
                  Efectivo recibido:
                </label>
                <div className="relative flex-1 max-w-[140px]">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    placeholder="0 COP"
                    className="w-full h-8 pl-6 pr-2 bg-white border border-purple-200 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>

              {/* Quick cash denomination chips */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1">
                {[totalAmount, 5000, 10000, 20000, 50000, 100000]
                  .filter((v, idx, arr) => v >= totalAmount && arr.indexOf(v) === idx)
                  .slice(0, 4)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashReceivedInput(String(val))}
                      className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] text-purple-800 font-medium hover:bg-purple-100 transition-colors shrink-0 cursor-pointer"
                    >
                      ${val.toLocaleString('es-CO')}
                    </button>
                  ))}
              </div>

              {cashReceived > 0 && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100 font-normal">
                  <span className="text-purple-900/80">Cambio / Devuelta:</span>
                  <span
                    className={`font-bold ${
                      changeToReturn >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(changeToReturn, currencySymbol)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Complete sale button */}
          <button
            type="button"
            onClick={() => {
              if (canCompleteSale) {
                onCompleteSale({
                  paymentMethod,
                  cashReceived: paymentMethod === 'efectivo' ? cashReceived : undefined,
                  change: paymentMethod === 'efectivo' ? changeToReturn : undefined,
                  note: saleNote.trim() || undefined,
                });
                setCashReceivedInput('');
                setSaleNote('');
                setMobileCartOpen(false);
              }
            }}
            disabled={!canCompleteSale}
            className={`w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              canCompleteSale
                ? 'bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#0ea5e9] hover:opacity-95 text-white shadow-purple-500/25 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Cobrar e Imprimir Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating mobile button for cart */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="py-3 px-4.5 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] text-white rounded-full shadow-lg shadow-purple-950/30 flex items-center gap-2.5 font-medium text-xs cursor-pointer active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ver Carrito ({totalItemsCount})</span>
          <span className="font-bold">· {formatCurrency(totalAmount, currencySymbol)}</span>
        </button>
      </div>
    </div>
  );
};
