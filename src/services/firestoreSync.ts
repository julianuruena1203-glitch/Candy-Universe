import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Sale, Expense, DailyClosure, BusinessConfig } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CONFIG } from '../data/defaultProducts';

// Utility to clean undefined values before sending to Firestore
function sanitizeData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

// ---------------------------------------------
// Products Sync
// ---------------------------------------------
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'products');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // First-time setup: seed initial catalog to Firestore
        try {
          for (const product of DEFAULT_PRODUCTS) {
            await setDoc(doc(db, 'products', product.id), sanitizeData(product));
          }
        } catch (e) {
          console.warn('Could not seed default products to Firestore:', e);
        }
        onData(DEFAULT_PRODUCTS);
        return;
      }

      const list: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          name: data.name || '',
          price: Number(data.price) || 0,
          costPrice: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
          countryFlag: data.countryFlag || 'CO',
          group: data.group || 'Gomas',
          saleType: data.saleType || 'detal',
          imageUrl: data.imageUrl || undefined,
        });
      });

      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    (err) => {
      console.error('Error listening to products:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, 'products');
      } catch {
        // caught for error logging
      }
    }
  );
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const clean = sanitizeData({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      costPrice: product.costPrice !== undefined ? Number(product.costPrice) : undefined,
      countryFlag: product.countryFlag || 'CO',
      group: product.group,
      saleType: product.saleType,
      imageUrl: product.imageUrl || undefined,
    });
    await setDoc(doc(db, 'products', product.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------
// Sales Sync
// ---------------------------------------------
export function subscribeToSales(
  onData: (sales: Sale[]) => void,
  onError?: (err: any) => void
) {
  const salesQuery = query(
    collection(db, 'sales'),
    orderBy('timestamp', 'desc'),
    limit(500)
  );

  return onSnapshot(
    salesQuery,
    (snapshot) => {
      const list: Sale[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          saleNumber: Number(data.saleNumber) || 0,
          timestamp: Number(data.timestamp) || Date.now(),
          items: data.items || [],
          total: Number(data.total) || 0,
          paymentMethod: data.paymentMethod || 'efectivo',
          cashReceived: data.cashReceived !== undefined ? Number(data.cashReceived) : undefined,
          change: data.change !== undefined ? Number(data.change) : undefined,
          note: data.note || undefined,
        });
      });
      onData(list);
    },
    (err) => {
      console.error('Error listening to sales:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, 'sales');
      } catch {
        // caught for error logging
      }
    }
  );
}

export async function saveSaleToFirestore(sale: Sale): Promise<void> {
  const path = `sales/${sale.id}`;
  try {
    const clean = sanitizeData({
      id: sale.id,
      saleNumber: Number(sale.saleNumber),
      timestamp: Number(sale.timestamp),
      items: sale.items.map((it) => sanitizeData({
        productId: it.productId,
        name: it.name,
        group: it.group,
        countryFlag: it.countryFlag,
        saleType: it.saleType,
        unitPrice: Number(it.unitPrice),
        unitCost: it.unitCost !== undefined ? Number(it.unitCost) : undefined,
        quantity: Number(it.quantity),
        subtotal: Number(it.subtotal),
      })),
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.cashReceived !== undefined ? Number(sale.cashReceived) : undefined,
      change: sale.change !== undefined ? Number(sale.change) : undefined,
      note: sale.note || undefined,
    });
    await setDoc(doc(db, 'sales', sale.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSaleFromFirestore(saleId: string): Promise<void> {
  const path = `sales/${saleId}`;
  try {
    await deleteDoc(doc(db, 'sales', saleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------
// Expenses Sync
// ---------------------------------------------
export function subscribeToExpenses(
  onData: (expenses: Expense[]) => void,
  onError?: (err: any) => void
) {
  const expensesQuery = query(
    collection(db, 'expenses'),
    orderBy('timestamp', 'desc'),
    limit(500)
  );

  return onSnapshot(
    expensesQuery,
    (snapshot) => {
      const list: Expense[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          description: data.description || '',
          amount: Number(data.amount) || 0,
          category: data.category || 'Otros Gastos',
          paymentMethod: data.paymentMethod || 'efectivo',
          timestamp: Number(data.timestamp) || Date.now(),
          dateStr: data.dateStr || new Date().toISOString().split('T')[0],
          note: data.note || undefined,
        });
      });
      onData(list);
    },
    (err) => {
      console.error('Error listening to expenses:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, 'expenses');
      } catch {
        // caught for error logging
      }
    }
  );
}

export async function saveExpenseToFirestore(expense: Expense): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    const clean = sanitizeData({
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      timestamp: Number(expense.timestamp),
      dateStr: expense.dateStr,
      note: expense.note || undefined,
    });
    await setDoc(doc(db, 'expenses', expense.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------
// Daily Closures Sync
// ---------------------------------------------
export function subscribeToClosures(
  onData: (closures: DailyClosure[]) => void,
  onError?: (err: any) => void
) {
  const closuresQuery = query(
    collection(db, 'closures'),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(
    closuresQuery,
    (snapshot) => {
      const list: DailyClosure[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          dateStr: data.dateStr,
          timestamp: Number(data.timestamp) || Date.now(),
          initialCash: Number(data.initialCash) || 0,
          totalSales: Number(data.totalSales) || 0,
          totalExpenses: Number(data.totalExpenses) || 0,
          netTotal: Number(data.netTotal) || 0,
          cashSales: Number(data.cashSales) || 0,
          cashExpenses: Number(data.cashExpenses) || 0,
          expectedCash: Number(data.expectedCash) || 0,
          countedCash: data.countedCash !== undefined ? Number(data.countedCash) : undefined,
          difference: data.difference !== undefined ? Number(data.difference) : undefined,
          notes: data.notes || undefined,
        });
      });
      onData(list);
    },
    (err) => {
      console.error('Error listening to closures:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, 'closures');
      } catch {
        // caught for error logging
      }
    }
  );
}

export async function saveClosureToFirestore(closure: DailyClosure): Promise<void> {
  const path = `closures/${closure.id}`;
  try {
    const clean = sanitizeData({
      id: closure.id,
      dateStr: closure.dateStr,
      timestamp: Number(closure.timestamp),
      initialCash: Number(closure.initialCash),
      totalSales: Number(closure.totalSales),
      totalExpenses: Number(closure.totalExpenses),
      netTotal: Number(closure.netTotal),
      cashSales: Number(closure.cashSales),
      cashExpenses: Number(closure.cashExpenses),
      expectedCash: Number(closure.expectedCash),
      countedCash: closure.countedCash !== undefined ? Number(closure.countedCash) : undefined,
      difference: closure.difference !== undefined ? Number(closure.difference) : undefined,
      notes: closure.notes || undefined,
    });
    await setDoc(doc(db, 'closures', closure.id), clean);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ---------------------------------------------
// Store Configuration Sync
// ---------------------------------------------
export function subscribeToConfig(
  onData: (config: BusinessConfig) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'config', 'settings');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(docRef, sanitizeData(DEFAULT_CONFIG));
        } catch (e) {
          console.warn('Could not seed default config to Firestore:', e);
        }
        onData(DEFAULT_CONFIG);
        return;
      }

      const data = snapshot.data() as any;
      onData({
        storeName: data.storeName || DEFAULT_CONFIG.storeName,
        storeSubtitle: data.storeSubtitle || DEFAULT_CONFIG.storeSubtitle,
        phone: data.phone || DEFAULT_CONFIG.phone,
        address: data.address || DEFAULT_CONFIG.address,
        receiptFooter: data.receiptFooter || DEFAULT_CONFIG.receiptFooter,
        currencySymbol: data.currencySymbol || DEFAULT_CONFIG.currencySymbol,
        nextSaleNumber: Number(data.nextSaleNumber) || DEFAULT_CONFIG.nextSaleNumber,
      });
    },
    (err) => {
      console.error('Error listening to config:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, 'config/settings');
      } catch {
        // caught for error logging
      }
    }
  );
}

export async function saveConfigToFirestore(config: BusinessConfig): Promise<void> {
  const path = 'config/settings';
  try {
    const clean = sanitizeData({
      storeName: config.storeName,
      storeSubtitle: config.storeSubtitle || '',
      phone: config.phone || '',
      address: config.address || '',
      receiptFooter: config.receiptFooter,
      currencySymbol: config.currencySymbol,
      nextSaleNumber: Number(config.nextSaleNumber),
    });
    await setDoc(doc(db, 'config', 'settings'), clean, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
