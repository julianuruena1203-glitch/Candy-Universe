import React, { useState, useMemo } from 'react';
import { Product, ProductGroup } from '../types';
import { formatCurrency } from '../utils/format';
import { PRODUCT_GROUPS } from '../data/countries';
import { CountryFlag } from './CountryFlag';
import { Search, Plus, Edit2, Trash2, Package, Tag, Box, AlertTriangle, X } from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  currencySymbol: string;
  onOpenNewProductModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  currencySymbol,
  onOpenNewProductModal,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'Todos' | ProductGroup>('Todos');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const availableCountryCodes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.countryFlag) set.add(p.countryFlag);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.group.toLowerCase().includes(q);
      const matchesGroup = selectedGroup === 'Todos' || p.group === selectedGroup;
      const matchesCountry = !selectedCountryCode || p.countryFlag === selectedCountryCode;
      return matchesSearch && matchesGroup && matchesCountry;
    });
  }, [products, search, selectedGroup, selectedCountryCode]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-purple-100 shadow-xs shadow-purple-950/5">
        <div>
          <h2 className="text-base sm:text-lg font-medium text-[#581c87]">
            Catálogo de Productos
          </h2>
          <div className="flex items-center gap-2 text-xs text-purple-600/80 mt-0.5 font-light">
            <span>{products.length} productos registrados</span>
            <span>·</span>
            <span>Precios al Detal y Por Mayor configurados</span>
          </div>
        </div>

        <button
          onClick={onOpenNewProductModal}
          className="self-start sm:self-auto py-2 px-4 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] hover:opacity-95 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Producto</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-purple-100 shadow-xs flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o grupo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-purple-50/40 border border-purple-100 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
          />
        </div>

        {/* Groups in Alphabetical Order */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedGroup('Todos')}
            className={`px-3 py-1.5 text-xs font-normal rounded-xl whitespace-nowrap transition-all ${
              selectedGroup === 'Todos'
                ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25'
                : 'bg-purple-50/60 text-purple-900 hover:bg-purple-100/80 border border-purple-100'
            }`}
          >
            Todos
          </button>
          {PRODUCT_GROUPS.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 text-xs font-normal rounded-xl whitespace-nowrap transition-all ${
                selectedGroup === grp
                  ? 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white shadow-xs shadow-purple-500/25'
                  : 'bg-purple-50/60 text-purple-900 hover:bg-purple-100/80 border border-purple-100'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Country Flag Filter */}
        {availableCountryCodes.length > 1 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-purple-50 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-purple-600/70 font-light mr-1 shrink-0">
              Filtrar por País:
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

      {/* Products Table with Detal, Por Mayor and Cost Price */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-10 h-10 stroke-1 text-purple-300 mb-2" />
            <p className="font-medium text-base text-purple-950">
              No hay productos en esta sección
            </p>
            <p className="text-xs text-slate-500 mt-1 font-light">
              Agrega tus productos con precio al detal y por mayor para despachar en caja.
            </p>
            <button
              onClick={onOpenNewProductModal}
              className="mt-3 py-2 px-4 bg-gradient-to-r from-[#6d28d9] to-[#0ea5e9] text-white font-medium text-xs rounded-xl hover:opacity-95 transition-opacity shadow-xs"
            >
              + Registrar Producto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] lg:max-h-[580px] scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50/50">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 bg-purple-50/95 backdrop-blur-md shadow-xs">
                <tr className="border-b border-purple-100 text-purple-900/80 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">País</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4 text-right">Precio Detal</th>
                  <th className="py-3 px-4 text-right">Precio Por Mayor</th>
                  <th className="py-3 px-4 text-right">Costo Compra</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-slate-800">
                {filteredProducts.map((p) => {
                  const pDetal = p.priceDetal || p.price;
                  const pMayor = p.priceMayor || Math.round(pDetal * 0.85);
                  const cost = p.costPrice || 0;

                  return (
                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-purple-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-100/60 border border-purple-200/60 flex items-center justify-center shrink-0 text-purple-400">
                              <Package className="w-5 h-5 stroke-1" />
                            </div>
                          )}
                          <div className="font-normal text-slate-900 text-sm">
                            {p.name}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex p-1 rounded-md bg-purple-50/60 border border-purple-100/60">
                          <CountryFlag countryCode={p.countryFlag || 'CO'} size="sm" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-purple-700/80 font-light">
                          {p.group}
                        </span>
                      </td>
                      {/* Precio Detal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-100 text-cyan-800">
                            Detal
                          </span>
                          <span className="font-semibold text-cyan-900 text-sm">
                            {formatCurrency(pDetal, currencySymbol)}
                          </span>
                        </div>
                      </td>
                      {/* Precio Por Mayor */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                            Mayor
                          </span>
                          <span className="font-semibold text-purple-900 text-sm">
                            {formatCurrency(pMayor, currencySymbol)}
                          </span>
                        </div>
                      </td>
                      {/* Costo */}
                      <td className="py-3 px-4 text-right text-slate-500 font-light whitespace-nowrap">
                        {cost > 0 ? formatCurrency(cost, currencySymbol) : '—'}
                      </td>
                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            title="Editar producto"
                            className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            title="Eliminar producto"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100/70 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-purple-100 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-slate-900 text-base">
                ¿Eliminar {productToDelete.name}?
              </h3>
              <p className="text-xs text-slate-500 font-light">
                Esta acción retirará el producto del catálogo y no se podrá deshacer.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-normal transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
