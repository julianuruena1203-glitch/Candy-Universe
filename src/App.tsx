/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { DEFAULT_PRODUCTS, DEFAULT_CONFIG } from './data/defaultProducts';
import { Navbar, ActiveTab } from './components/Navbar';
import { PosView } from './components/PosView';
import { ProductsView } from './components/ProductsView';
import { ReportsView } from './components/ReportsView';
import { CuadreView } from './components/CuadreView';
import { TicketModal } from './components/TicketModal';
import { ProductModal } from './components/ProductModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';
import { auth, testConnection, loginWithGoogle } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  subscribeToProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToSales,
  saveSaleToFirestore,
  deleteSaleFromFirestore,
  subscribeToExpenses,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  subscribeToClosures,
  saveClosureToFirestore,
  subscribeToConfig,
  saveConfigToFirestore,
} from './services/firestoreSync';
import { Cloud, Wifi, AlertCircle } from 'lucide-react';

export default function App() {
  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncNoticeDismissed, setSyncNoticeDismissed] = useState(false);

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

  // Validate connection to Firestore on initial boot (Critical Constraint)
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Set up real-time Firestore listeners when user is authenticated
  useEffect(() => {
    if (!firebaseUser) {
      setIsCloudSyncing(false);
      return;
    }

    setIsCloudSyncing(true);

    const unsubProducts = subscribeToProducts((cloudProducts) => {
      setProducts(cloudProducts);
      saveStoredProducts(cloudProducts);
    });

    const unsubSales = subscribeToSales((cloudSales) => {
      setSales(cloudSales);
      saveStoredSales(cloudSales);
    });

    const unsubExpenses = subscribeToExpenses((cloudExpenses) => {
      setExpenses(cloudExpenses);
      saveStoredExpenses(cloudExpenses);
    });

    const unsubClosures = subscribeToClosures((cloudClosures) => {
      setClosures(cloudClosures);
      saveStoredClosures(cloudClosures);
    });

    const unsubConfig = subscribeToConfig((cloudConfig) => {
      setConfig(cloudConfig);
      saveStoredConfig(cloudConfig);
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubExpenses();
      unsubClosures();
      unsubConfig();
    };
  }, [firebaseUser]);

  // When a seller logs in, force activeTab to POS
  useEffect(() => {
    if (currentUserRole === 'seller') {
      setActiveTab('pos');
    }
  }, [currentUserRole]);

  // Cart operations
  const handleAddToCart = useCallback((product: Product, priceType: 'detal' | 'mayor' = 'detal') => {
    const unitPrice = priceType === 'mayor'
      ? (product.priceMayor || product.price)
      : (product.priceDetal || product.price);

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product.id === product.id && (item.priceType || 'detal') === priceType
      );
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id && (item.priceType || 'detal') === priceType
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, priceType, unitPrice }];
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number, priceType?: 'detal' | 'mayor') => {
      if (quantity <= 0) {
        setCart((prev) =>
          prev.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (!priceType || (item.priceType || 'detal') === priceType)
              )
          )
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId &&
          (!priceType || (item.priceType || 'detal') === priceType)
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const handleRemoveFromCart = useCallback(
    (productId: string, priceType?: 'detal' | 'mayor') => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              (!priceType || (item.priceType || 'detal') === priceType)
            )
        )
      );
    },
    []
  );

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Complete Sale & Generate Ticket (Syncs directly to Firestore & across all devices)
  const handleCompleteSale = useCallback(
    async (saleData: {
      paymentMethod: PaymentMethod;
      cashReceived?: number;
      change?: number;
      note?: string;
    }) => {
      if (cart.length === 0) return;

      const existingIds = new Set(sales.map((s) => s.id));
      const existingNumbers = new Set(sales.map((s) => s.saleNumber));

      let saleNumber = config.nextSaleNumber || (sales.length + 1004);
      let ticketId = formatTicketCode(saleNumber);

      while (existingNumbers.has(saleNumber) || existingIds.has(ticketId)) {
        saleNumber++;
        ticketId = formatTicketCode(saleNumber);
      }

      const items = cart.map((item) => {
        const pType = item.priceType || 'detal';
        const unitPrice = item.unitPrice ?? (pType === 'mayor' ? (item.product.priceMayor || item.product.price) : (item.product.priceDetal || item.product.price));
        return {
          productId: item.product.id,
          name: item.product.name,
          group: item.product.group,
          countryFlag: item.product.countryFlag,
          saleType: pType,
          unitPrice,
          unitCost: item.product.costPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
        };
      });

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

      // Optimistic local update
      setSales((prev) => [newSale, ...prev]);
      saveStoredSales([newSale, ...sales]);

      const updatedConfig = {
        ...config,
        nextSaleNumber: saleNumber + 1,
      };
      setConfig(updatedConfig);
      saveStoredConfig(updatedConfig);

      // Real-time broadcast to Firestore
      if (firebaseUser) {
        try {
          await saveSaleToFirestore(newSale);
          await saveConfigToFirestore(updatedConfig);
        } catch (e) {
          console.error('Error saving sale to Firestore:', e);
        }
      }

      // Clear current sale cart & show ticket modal
      setCart([]);
      setActiveTicketSale(newSale);
    },
    [cart, config, sales, firebaseUser]
  );

  // Products CRUD (Admin only - synced in real-time)
  const handleSaveProduct = useCallback(
    async (productData: Omit<Product, 'id'> & { id?: string }) => {
      let targetProduct: Product;
      if (productData.id) {
        targetProduct = { ...(productData as Product) };
        setProducts((prev) =>
          prev.map((p) => (p.id === productData.id ? targetProduct : p))
        );
      } else {
        targetProduct = {
          ...productData,
          id: 'p_' + Date.now() + Math.random().toString(36).substring(2, 6),
        };
        setProducts((prev) => [targetProduct, ...prev]);
      }

      saveStoredProducts(products);

      // Real-time broadcast to Firestore
      if (firebaseUser) {
        try {
          await saveProductToFirestore(targetProduct);
        } catch (e) {
          console.error('Error saving product to Firestore:', e);
        }
      }
    },
    [products, firebaseUser]
  );

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setCart((prev) => prev.filter((item) => item.product.id !== productId));

      if (firebaseUser) {
        try {
          await deleteProductFromFirestore(productId);
        } catch (e) {
          console.error('Error deleting product from Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  const handleEditProductClick = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  }, []);

  const handleNewProductClick = useCallback(() => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  }, []);

  // Sales deletion (from reports)
  const handleDeleteSale = useCallback(
    async (saleId: string) => {
      setSales((prev) => prev.filter((s) => s.id !== saleId));
      if (firebaseUser) {
        try {
          await deleteSaleFromFirestore(saleId);
        } catch (e) {
          console.error('Error deleting sale from Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  // Expenses CRUD (Cuadre)
  const handleAddExpense = useCallback(
    async (expenseData: Omit<Expense, 'id'>) => {
      const newExpense: Expense = {
        ...expenseData,
        id: 'exp_' + Date.now() + Math.random().toString(36).substring(2, 6),
      };
      setExpenses((prev) => [newExpense, ...prev]);

      if (firebaseUser) {
        try {
          await saveExpenseToFirestore(newExpense);
        } catch (e) {
          console.error('Error saving expense to Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      if (firebaseUser) {
        try {
          await deleteExpenseFromFirestore(expenseId);
        } catch (e) {
          console.error('Error deleting expense from Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  const handleSaveClosure = useCallback(
    async (closure: DailyClosure) => {
      setClosures((prev) => {
        const idx = prev.findIndex((c) => c.dateStr === closure.dateStr);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = closure;
          return copy;
        }
        return [closure, ...prev];
      });

      if (firebaseUser) {
        try {
          await saveClosureToFirestore(closure);
        } catch (e) {
          console.error('Error saving closure to Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  // Settings Actions
  const handleResetProducts = useCallback(async () => {
    setProducts(DEFAULT_PRODUCTS);
    saveStoredProducts(DEFAULT_PRODUCTS);
    if (firebaseUser) {
      for (const prod of DEFAULT_PRODUCTS) {
        await saveProductToFirestore(prod);
      }
    }
  }, [firebaseUser]);

  const handleClearSales = useCallback(() => {
    setSales([]);
    saveStoredSales([]);
  }, []);

  const handleSaveConfig = useCallback(
    async (newConfig: BusinessConfig) => {
      setConfig(newConfig);
      saveStoredConfig(newConfig);
      if (firebaseUser) {
        try {
          await saveConfigToFirestore(newConfig);
        } catch (e) {
          console.error('Error saving config to Firestore:', e);
        }
      }
    },
    [firebaseUser]
  );

  // If no user role is selected, show initial login screen
  if (!currentUserRole) {
    return (
      <LoginView
        firebaseUser={firebaseUser}
        onSelectRole={(role) => setCurrentUserRole(role)}
      />
    );
  }

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="min-h-screen bg-[#faf7fd] flex flex-col text-slate-900 selection:bg-cyan-200 selection:text-purple-950">
      {/* Real-time sync notification bar if not yet connected to Firebase */}
      {!firebaseUser && !syncNoticeDismissed && (
        <div className="bg-amber-500/10 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Para sincronizar modificaciones en tiempo real desde cualquier celular, computadora o tablet,{' '}
              <strong className="font-semibold">conecta la tienda con Google</strong>.
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch {
                  // Handled gracefully
                }
              }}
              className="ml-2 px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-[11px] transition-colors shrink-0"
            >
              Conectar Google
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSyncNoticeDismissed(true)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Navbar with role-aware controls and live cloud sync indicator */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cart.reduce((s, it) => s + it.quantity, 0)}
        productsCount={products.length}
        storeName={config.storeName}
        userRole={currentUserRole}
        firebaseUser={firebaseUser}
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

        {/* Cuadre View is strictly for Administrator */}
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

      {/* Sales Ticket Modal */}
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
          onSaveConfig={handleSaveConfig}
          onResetProducts={handleResetProducts}
          onClearSales={handleClearSales}
        />
      )}
    </div>
  );
}
