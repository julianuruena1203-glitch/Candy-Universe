import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductGroup, SaleType } from '../types';
import { COUNTRIES, PRODUCT_GROUPS } from '../data/countries';
import { CountryFlag } from './CountryFlag';
import { X, Check, Image as ImageIcon, Upload, Trash2, Tag, Box } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  currencySymbol: string;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  productToEdit,
  currencySymbol,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [countryCode, setCountryCode] = useState('CO');
  const [group, setGroup] = useState<ProductGroup>('Gomas');
  const [saleType, setSaleType] = useState<SaleType>('detal');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(String(productToEdit.price));
      setCostPrice(productToEdit.costPrice ? String(productToEdit.costPrice) : '');
      setCountryCode(productToEdit.countryFlag || 'CO');
      setGroup(productToEdit.group || 'Gomas');
      setSaleType(productToEdit.saleType || 'detal');
      setImageUrl(productToEdit.imageUrl);
    } else {
      setName('');
      setPrice('');
      setCostPrice('');
      setCountryCode('CO');
      setGroup('Bebida');
      setSaleType('detal');
      setImageUrl(undefined);
    }
    setError('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Escribe el nombre del dulce o producto');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Ingresa un precio de venta válido en COP mayor a 0');
      return;
    }

    const numCostPrice = costPrice ? parseFloat(costPrice) : undefined;
    if (costPrice && (isNaN(numCostPrice!) || numCostPrice! < 0)) {
      setError('Ingresa un precio de compra válido en COP');
      return;
    }

    onSave({
      id: productToEdit?.id,
      name: name.trim(),
      price: numPrice,
      costPrice: numCostPrice,
      countryFlag: countryCode,
      group,
      saleType,
      imageUrl,
    });
    onClose();
  };

  const profit = parseFloat(price) - (parseFloat(costPrice) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-100 bg-purple-50/60">
          <h3 className="font-medium text-[#581c87] text-base">
            {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1 text-slate-400 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1.5">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Gomas Trululu Aros 90g"
              autoFocus
              className="w-full h-10 px-3.5 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          {/* Modalidad de Venta: Al Detal vs Al Por Mayor */}
          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1.5">
              Tipo de Venta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaleType('detal')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all ${
                  saleType === 'detal'
                    ? 'border-[#7c3aed] bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white font-medium shadow-xs'
                    : 'border-purple-100 bg-purple-50/40 text-purple-900/80 hover:bg-purple-50'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Detal</span>
              </button>

              <button
                type="button"
                onClick={() => setSaleType('mayor')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all ${
                  saleType === 'mayor'
                    ? 'border-[#7c3aed] bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white font-medium shadow-xs'
                    : 'border-purple-100 bg-purple-50/40 text-purple-900/80 hover:bg-purple-50'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Por Mayor</span>
              </button>
            </div>
          </div>

          {/* Image Attachment (replaces emoji/icon picker) */}
          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1.5">
              Imagen del Producto (Opcional)
            </label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-purple-200 bg-purple-50 flex items-center justify-center shrink-0 shadow-xs">
                  <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Quitar imagen"
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 flex flex-col items-center justify-center text-purple-400 shrink-0">
                  <ImageIcon className="w-6 h-6 stroke-1 text-purple-300" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-purple-50 hover:bg-purple-100 text-[#6d28d9] border border-purple-200 text-xs font-medium rounded-xl cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0ea5e9]" />
                  <span>{imageUrl ? 'Cambiar Imagen' : 'Adjuntar Imagen'}</span>
                </label>
                <p className="text-[11px] text-slate-400 font-light mt-1">
                  PNG, JPG o WebP (Máx. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Row: Precio de Compra & Precio de Venta (en COP) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-normal text-purple-900 mb-1.5">
                Precio de Compra (Costo COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-normal text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={costPrice}
                  onChange={(e) => {
                    setCostPrice(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0 COP"
                  className="w-full h-10 pl-7 pr-3 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-purple-900 mb-1.5">
                Precio de Venta (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-normal text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0 COP"
                  className="w-full h-10 pl-7 pr-3 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
          </div>

          {/* Margin indicator */}
          {parseFloat(price) > 0 && parseFloat(costPrice) > 0 && (
            <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-light">
              <span>Ganancia estimada por {saleType === 'mayor' ? 'paquete/caja' : 'unidad'}:</span>
              <span className="font-semibold text-emerald-700">
                +${profit.toLocaleString('es-CO')} COP ({Math.round((profit / parseFloat(price)) * 100)}%)
              </span>
            </div>
          )}

          {/* 1. SELECCIONAR PRIMERO EL PAÍS (ÍCONO DE LA BANDERA, NO INICIALES) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-normal text-purple-900">
                1. País de Origen <span className="text-[11px] text-purple-500 font-light">(Ícono de bandera)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <CountryFlag countryCode={countryCode} size="md" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-2 bg-purple-50/30 border border-purple-100 rounded-2xl">
              {COUNTRIES.map((c) => {
                const isSelected = countryCode === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountryCode(c.code)}
                    title={c.name}
                    className={`p-1.5 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-white ring-2 ring-[#7c3aed] shadow-xs scale-110'
                        : 'bg-white/60 hover:bg-white opacity-85 hover:opacity-100 border border-purple-100/60'
                    }`}
                  >
                    <CountryFlag countryCode={c.code} size="md" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SELECCIONAR EL GRUPO (En orden alfabético: Bebida, Chicle, Chocolate, Galleta, Gomas, Paletas, Papas, Pasta) */}
          <div>
            <label className="block text-xs font-normal text-purple-900 mb-1.5">
              2. Grupo <span className="text-[11px] text-purple-500 font-light">(Orden alfabético)</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRODUCT_GROUPS.map((grp) => {
                const isSelected = group === grp;
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setGroup(grp)}
                    className={`py-2 px-1 text-xs rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#7c3aed] bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white font-medium shadow-xs'
                        : 'border-purple-100 bg-white text-purple-900/80 hover:border-purple-200 font-normal'
                    }`}
                  >
                    {grp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-900 font-normal text-xs rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Registrar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
