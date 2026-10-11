import { Product, Sale, BusinessConfig, Expense, DailyClosure } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CONFIG } from '../data/defaultProducts';

const PRODUCTS_KEY = 'dulcecaja_products_v2';
const SALES_KEY = 'dulcecaja_sales_v2';
const CONFIG_KEY = 'dulcecaja_config_v2';
const EXPENSES_KEY = 'dulcecaja_expenses_v1';
const CLOSURES_KEY = 'dulcecaja_closures_v1';

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    const list = JSON.parse(raw);
    return list.map((p: any) => {
      const pDetal = Number(p.priceDetal) || Number(p.price) || 0;
      const pMayor = Number(p.priceMayor) || Math.round(pDetal * 0.85);
      return {
        id: p.id,
        name: p.name,
        price: pDetal,
        priceDetal: pDetal,
        priceMayor: pMayor,
        costPrice: p.costPrice !== undefined ? Number(p.costPrice) : Math.round(pDetal * 0.7),
        countryFlag: p.countryFlag || 'CO',
        group: p.group || p.category || 'Gomas',
        saleType: p.saleType || 'detal',
        imageUrl: p.imageUrl || undefined,
      };
    });
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products:', err);
  }
}

export function getStoredConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    let parsedConfig: BusinessConfig = DEFAULT_CONFIG;
    if (raw) {
      parsedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } else {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    }
    return parsedConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveStoredConfig(config: BusinessConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

export function getStoredSales(): Sale[] {
  try {
    const raw = localStorage.getItem(SALES_KEY);
    let list: Sale[] = [];
    if (!raw) {
      list = generateInitialSales();
      localStorage.setItem(SALES_KEY, JSON.stringify(list));
      return list;
    }
    list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    // Ensure strictly unique ids for all sales (fixing duplicate keys like T-01001)
    const seenIds = new Set<string>();
    let hasModifiedIds = false;
    const sanitizedSales = list.map((sale, idx) => {
      let uniqueId = sale.id || `T-${String(1001 + idx).padStart(5, '0')}`;
      if (seenIds.has(uniqueId)) {
        hasModifiedIds = true;
        let suffix = 2;
        while (seenIds.has(`${uniqueId}-${suffix}`)) {
          suffix++;
        }
        uniqueId = `${uniqueId}-${suffix}`;
      }
      seenIds.add(uniqueId);
      return {
        ...sale,
        id: uniqueId,
      };
    });

    if (hasModifiedIds) {
      try {
        localStorage.setItem(SALES_KEY, JSON.stringify(sanitizedSales));
      } catch {
        // ignore
      }
    }
    return sanitizedSales;
  } catch {
    return [];
  }
}

export function saveStoredSales(sales: Sale[]): void {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (err) {
    console.error('Error saving sales:', err);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) {
      const initial = generateInitialExpenses();
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses:', err);
  }
}

export function getStoredClosures(): DailyClosure[] {
  try {
    const raw = localStorage.getItem(CLOSURES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredClosures(closures: DailyClosure[]): void {
  try {
    localStorage.setItem(CLOSURES_KEY, JSON.stringify(closures));
  } catch (err) {
    console.error('Error saving closures:', err);
  }
}

function generateInitialExpenses(): Expense[] {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timestamp = now.getTime();

  return [
    {
      id: 'exp_1',
      description: 'Bolsas plásticas y servilletas',
      amount: 4500,
      category: 'Aseo y Empaques',
      paymentMethod: 'efectivo',
      timestamp: timestamp - 4 * 60 * 60 * 1000,
      dateStr,
    },
    {
      id: 'exp_2',
      description: 'Hielo para bebidas frías',
      amount: 3000,
      category: 'Mercancía / Proveedores',
      paymentMethod: 'efectivo',
      timestamp: timestamp - 2 * 60 * 60 * 1000,
      dateStr,
    },
  ];
}

function generateInitialSales(): Sale[] {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  return [
    {
      id: 'T-01001',
      saleNumber: 1001,
      timestamp: now - oneHour * 3,
      items: [
        { productId: 'p1', name: 'Gomas Trululu Aros', group: 'Gomas', countryFlag: '🇨🇴', unitPrice: 2500, unitCost: 1800, quantity: 2, subtotal: 5000 },
        { productId: 'p6', name: 'Chocolatina Jet Tradicional', group: 'Chocolate', countryFlag: '🇨🇴', unitPrice: 1200, unitCost: 850, quantity: 3, subtotal: 3600 },
      ],
      total: 8600,
      paymentMethod: 'efectivo',
      cashReceived: 10000,
      change: 1400,
    },
    {
      id: 'T-01002',
      saleNumber: 1002,
      timestamp: now - oneHour * 1.5,
      items: [
        { productId: 'p4', name: 'Paleta Bon Bon Bum Fresa', group: 'Paletas', countryFlag: '🇨🇴', unitPrice: 800, unitCost: 500, quantity: 4, subtotal: 3200 },
        { productId: 'p7', name: 'Kinder Bueno Blanco', group: 'Chocolate', countryFlag: '🇮🇹', unitPrice: 5500, unitCost: 4200, quantity: 1, subtotal: 5500 },
      ],
      total: 8700,
      paymentMethod: 'nequi',
    },
    {
      id: 'T-01003',
      saleNumber: 1003,
      timestamp: now - 20 * 60 * 1000,
      items: [
        { productId: 'p13', name: 'Papas Margarita Pollo', group: 'Papas', countryFlag: '🇨🇴', unitPrice: 3200, unitCost: 2400, quantity: 2, subtotal: 6400 },
        { productId: 'p15', name: 'Gaseosa Postobón Manzana', group: 'Bebida', countryFlag: '🇨🇴', unitPrice: 2800, unitCost: 2000, quantity: 1, subtotal: 2800 },
      ],
      total: 9200,
      paymentMethod: 'bancolombia',
    },
  ];
}
