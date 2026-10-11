import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductGroup } from '../types';
import { COUNTRIES, PRODUCT_GROUPS } from '../data/countries';
import { CountryFlag } from './CountryFlag';
import { X, Check, Image as ImageIcon, Upload, Trash2, Tag, Box, DollarSign } from 'lucide-react';

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
  const [priceDetal, setPriceDetal] = useState('');
  const [priceMayor, setPriceMayor] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [countryCode, setCountryCode] = useState('CO');
  const [group, setGroup] = useState<ProductGroup>('Gomas');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPriceDetal(String(productToEdit.priceDetal || productToEdit.price || ''));
      setPriceMayor(String(productToEdit.priceMayor || Math.round((productToEdit.price || 0) * 0.85) || ''));
      setCostPrice(productToEdit.costPrice ? String(productToEdit.costPrice) : '');
      setCountryCode(productToEdit.countryFlag || 'CO');
      setGroup(productToEdit.group || 'Gomas');
      setImageUrl(productToEdit.imageUrl);
    } else {
      setName('');
      setPriceDetal('');
      setPriceMayor('');
      setCostPrice('');
      setCountryCode('CO');
      setGroup('Bebida');
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
    const numPriceDetal = parseFloat(priceDetal);
    if (isNaN(numPriceDetal) || numPriceDetal <= 0) {
      setError('Ingresa un Precio al Detal válido en COP mayor a 0');
      return;
    }

    const numPriceMayor = parseFloat(priceMayor);
    if (isNaN(numPriceMayor) || numPriceMayor <= 0) {
      setError('Ingresa un Precio Por Mayor válido en COP mayor a 0');
      return;
    }

    const numCostPrice = costPrice ? parseFloat(costPrice) : undefined;
    if (costPrice && (isNaN(numCostPrice!) || numCostPrice! < 0)) {
      setError('Ingresa un precio de compra o costo válido en COP');
      return;
    }

    onSave({
      id: productToEdit?.id,
      name: name.trim(),
      price: numPriceDetal,
      priceDetal: numPriceDetal,
      priceMayor: numPriceMayor,
      costPrice: numCostPrice,
      countryFlag: countryCode,
      group,
      imageUrl,
    });
    onClose();
  };

  const numDetal = parseFloat(priceDetal) || 0;
  const numMayor = parseFloat(priceMayor) || 0;
  const numCost = parseFloat(costPrice) || 0;

  const profitDetal = numCost > 0 ? numDetal - numCost : 0;
  const profitMayor = numCost > 0 ? numMayor - numCost : 0;

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

          {/* Precios: Detal y Por Mayor (eliminado selector de tipo de venta) */}
          <div className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#581c87]">
              <DollarSign className="w-4 h-4 text-[#0ea5e9]" />
              <span>Precios de Venta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Precio al Detal */}
              <div>
                <label className="block text-xs font-normal text-purple-900 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#0ea5e9]" />
                  <span>Precio al Detal ({currencySymbol})</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-normal text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={priceDetal}
                    onChange={(e) => {
                      setPriceDetal(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ej. 2500"
                    className="w-full h-10 pl-7 pr-3 bg-white border border-purple-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Precio Por Mayor */}
              <div>
                <label className="block text-xs font-normal text-purple-900 mb-1 flex items-center gap-1">
                  <Box className="w-3 h-3 text-[#7c3aed]" />
                  <span>Precio Por Mayor ({currencySymbol})</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-normal text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={priceMayor}
                    onChange={(e) => {
                      setPriceMayor(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ej. 2000"
                    className="w-full h-10 pl-7 pr-3 bg-white border border-purple-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  />
                </div>
              </div>
            </div>

            {/* Precio de Costo / Compra */}
            <div>
              <label className="block text-xs font-normal text-purple-900 mb-1">
                Precio de Costo / Compra (Opcional - {currencySymbol})
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
                  placeholder="Ej. 1500"
                  className="w-full h-10 pl-7 pr-3 bg-white border border-purple-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Estimated Margins Preview */}
            {numCost > 0 && (numDetal > 0 || numMayor > 0) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-100 text-[11px]">
                <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-900">
                  <span className="text-slate-500 block">Ganancia Detal:</span>
                  <strong className="text-cyan-800 font-semibold">
                    +${profitDetal.toLocaleString('es-CO')} ({numDetal > 0 ? Math.round((profitDetal / numDetal) * 100) : 0}%)
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
                  <span className="text-slate-500 block">Ganancia Por Mayor:</span>
                  <strong className="text-purple-800 font-semibold">
                    +${profitMayor.toLocaleString('es-CO')} ({numMayor > 0 ? Math.round((profitMayor / numMayor) * 100) : 0}%)
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Image Attachment */}
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

          {/* 1. SELECCIONAR PRIMERO EL PAÍS */}
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

          {/* 2. SELECCIONAR EL GRUPO */}
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
