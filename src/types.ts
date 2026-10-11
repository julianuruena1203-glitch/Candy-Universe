export type ProductGroup = 
  | 'Bebida'
  | 'Chicle'
  | 'Chocolate'
  | 'Galleta'
  | 'Gomas'
  | 'Paletas'
  | 'Papas'
  | 'Pasta';

export type SaleType = 'detal' | 'mayor';

export interface CountryOption {
  code: string;
  flag: string;
  name: string;
}

export type UserRole = 'admin' | 'seller';

export interface Product {
  id: string;
  name: string;
  price: number; // Precio de venta en COP
  costPrice?: number; // Precio de compra en COP
  countryFlag: string; // Código o bandera del país (e.g. CO, MX, US)
  group: ProductGroup; // En orden alfabético
  saleType: SaleType; // 'detal' (Al Detal) o 'mayor' (Al Por Mayor)
  imageUrl?: string; // Imagen adjuntada
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 
  | 'bancolombia' 
  | 'daviplata' 
  | 'nequi' 
  | 'transferencia' 
  | 'efectivo';

export interface SaleItem {
  productId: string;
  name: string;
  group: ProductGroup;
  countryFlag?: string;
  saleType?: SaleType;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string; // e.g. "T-1001"
  saleNumber: number;
  timestamp: number; // Date ms
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  note?: string;
}

export type ExpenseCategory =
  | 'Mercancía / Proveedores'
  | 'Aseo y Empaques'
  | 'Servicios Públicos'
  | 'Transporte / Domicilios'
  | 'Alimentación'
  | 'Nómina / Turno'
  | 'Mantenimiento'
  | 'Otros Gastos';

export interface Expense {
  id: string;
  description: string;
  amount: number; // en COP
  category: ExpenseCategory;
  paymentMethod: PaymentMethod; // efectivo, nequi, bancolombia, etc.
  timestamp: number; // ms
  dateStr: string; // YYYY-MM-DD
  note?: string;
}

export interface DailyClosure {
  id: string;
  dateStr: string; // YYYY-MM-DD
  timestamp: number;
  initialCash: number;
  totalSales: number;
  totalExpenses: number;
  netTotal: number; // totalSales - totalExpenses
  cashSales: number;
  cashExpenses: number;
  expectedCash: number;
  countedCash?: number;
  difference?: number;
  notes?: string;
}

export interface BusinessConfig {
  storeName: string;
  storeSubtitle: string;
  phone?: string;
  address?: string;
  receiptFooter: string;
  currencySymbol: string;
  nextSaleNumber: number;
}
