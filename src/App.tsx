/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Sale, BusinessConfig, PaymentMethod, UserRole, Expense, DailyClosure } from './types';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredSales, 
  saveStoredSales, 
  getStoredConfig, 
  saveStoredConfig,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredClosures,
  saveStoredClosures
} from './utils/storage';
import { formatTicketCode } from './utils/format';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import { Navbar, ActiveTab } from './components/Navbar';
import { PosView } from './components/PosView';
import { ProductsView } from './components/ProductsView';
import { ReportsView } from './components/ReportsView';
import { CuadreView } from './components/CuadreView';
import { TicketModal } from './components/TicketModal';
import { ProductModal } from './components/ProductModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';

export default function App() {
  // User Role Authentication State (null = show initial login screen)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [sales, setSales] = useState<Sale[]>(getStoredSales);
  const [expenses, setExpenses] = useState<Expense[]>(getStoredExpenses);
  const [closures, setClosures] = useState<DailyClosure[]>(getStoredClosures);
  const [config, setConfig] = useState<BusinessConfig>(getStoredConfig);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  // Modals state
  const [activeTicketSale, setActiveTicketSale] = useState<Sale | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to storage on state changes
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredClosures(closures);
  }, [closures]);

  useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  // When a seller logs in, force activeTab to POS
  useEffect(() => {
    if (currentUserRole === 'seller') {
      setActiveTab('pos');
    }
  }, [currentUserRole]);

  // Cart operations
  const handleAddToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Complete Sale & Generate Ticket
  const handleCompleteSale = useCallback(
    (saleData: {
      paymentMethod: PaymentMethod;
      cashReceived?: number;
      change?: number;
      note?: string;
    }) => {
      if (cart.length === 0) return;

      // Find guaranteed unique saleNumber and ticketId
      const existingIds = new Set(sales.map((s) => s.id));
      const existingNumbers = new Set(sales.map((s) => s.saleNumber));

      let saleNumber = config.nextSaleNumber || (sales.length + 1004);
      let ticketId = formatTicketCode(saleNumber);

      while (existingNumbers.has(saleNumber) || existingIds.has(ticketId)) {
        saleNumber++;
        ticketId = formatTicketCode(saleNumber);
      }

      const items = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        group: item.product.group,
        countryFlag: item.product.countryFlag,
        saleType: item.product.saleType,
        unitPrice: item.product.price,
        unitCost: item.product.costPrice,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      const newSale: Sale = {
        id: ticketId,
        saleNumber,
        timestamp: Date.now(),
        items,
        total,
        paymentMethod: saleData.paymentMethod,
        cashReceived: saleData.cashReceived,
        change: saleData.change,
        note: saleData.note,
      };

      // Add to sales list (most recent first)
      setSales((prev) => [newSale, ...prev]);

      // Increment next ticket number in configuration
      setConfig((prev) => ({
        ...prev,
        nextSaleNumber: saleNumber + 1,
      }));

      // Clear current sale cart
      setCart([]);

      // Automatically display the generated ticket modal
      setActiveTicketSale(newSale);
    },
    [cart, config.nextSaleNumber, sales.length]
  );

  // Products CRUD (Admin only)
  const handleSaveProduct = useCallback((productData: Omit<Product, 'id'> & { id?: string }) => {
    if (productData.id) {
      // Edit
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id ? { ...(productData as Product) } : p
        )
      );
    } else {
      // Create new
      const newProduct: Product = {
        ...productData,
        id: 'p_' + Date.now() + Math.random().toString(36).substring(2, 6),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleEditProductClick = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  }, []);

  const handleNewProductClick = useCallback(() => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  }, []);

  // Sales deletion (from reports)
  const handleDeleteSale = useCallback((saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  }, []);

  // Expenses CRUD (Cuadre)
  const handleAddExpense = useCallback((expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp_' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

  const handleSaveClosure = useCallback((closure: DailyClosure) => {
    setClosures((prev) => {
      const idx = prev.findIndex((c) => c.dateStr === closure.dateStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = closure;
        return copy;
      }
      return [closure, ...prev];
    });
  }, []);

  // Settings Actions
  const handleResetProducts = useCallback(() => {
    setProducts(DEFAULT_PRODUCTS);
  }, []);

  const handleClearSales = useCallback(() => {
    setSales([]);
  }, []);

  // If no user is logged in, show initial login screen to select role
  if (!currentUserRole) {
    return <LoginView onSelectRole={(role) => setCurrentUserRole(role)} />;
  }

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="min-h-screen bg-[#faf7fd] flex flex-col text-slate-900 selection:bg-cyan-200 selection:text-purple-950">
      {/* Top Navbar with role-aware controls */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cart.reduce((s, it) => s + it.quantity, 0)}
        productsCount={products.length}
        storeName={config.storeName}
        userRole={currentUserRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={() => setCurrentUserRole(null)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'pos' && (
          <PosView
            products={products}
            currencySymbol={config.currencySymbol}
            cart={cart}
            isAdmin={isAdmin}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCompleteSale={handleCompleteSale}
            onOpenNewProductModal={handleNewProductClick}
          />
        )}

        {/* Products View is strictly for Administrator */}
        {activeTab === 'products' && isAdmin && (
          <ProductsView
            products={products}
            currencySymbol={config.currencySymbol}
            onOpenNewProductModal={handleNewProductClick}
            onEditProduct={handleEditProductClick}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {/* Reports View is strictly for Administrator */}
        {activeTab === 'reports' && isAdmin && (
          <ReportsView
            sales={sales}
            config={config}
            onViewTicket={(sale) => setActiveTicketSale(sale)}
            onDeleteSale={handleDeleteSale}
          />
        )}

        {/* Cuadre View is strictly for Administrator (Daily closure, sales consolidation, expenses & net income) */}
        {activeTab === 'cuadre' && isAdmin && (
          <CuadreView
            sales={sales}
            expenses={expenses}
            config={config}
            closures={closures}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onSaveClosure={handleSaveClosure}
            onViewTicket={(sale) => setActiveTicketSale(sale)}
          />
        )}
      </main>

      {/* Sales Ticket Modal (Auto pops up after selling, or when clicked from reports) */}
      <TicketModal
        sale={activeTicketSale}
        config={config}
        onClose={() => setActiveTicketSale(null)}
        onNewSale={() => {
          setActiveTicketSale(null);
          setActiveTab('pos');
        }}
      />

      {/* Add / Edit Product Modal (Admin only) */}
      {isAdmin && (
        <ProductModal
          isOpen={isProductModalOpen}
          productToEdit={productToEdit}
          currencySymbol={config.currencySymbol}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Settings Modal (Admin only) */}
      {isAdmin && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          config={config}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaveConfig={setConfig}
          onResetProducts={handleResetProducts}
          onClearSales={handleClearSales}
        />
      )}
    </div>
  );
}
