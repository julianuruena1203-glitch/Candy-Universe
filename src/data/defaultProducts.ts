import { Product, BusinessConfig } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Gomas Trululu Aros 90g', price: 2500, costPrice: 1800, countryFlag: 'CO', group: 'Gomas', saleType: 'detal' },
  { id: 'p2', name: 'Gomas Grissly Ositos Display x12', price: 24000, costPrice: 18500, countryFlag: 'CO', group: 'Gomas', saleType: 'mayor' },
  { id: 'p3', name: 'Paleta Dr. Look Ojo', price: 2000, costPrice: 1400, countryFlag: 'CO', group: 'Paletas', saleType: 'detal' },
  { id: 'p4', name: 'Paleta Bon Bon Bum Fresa x24', price: 14500, costPrice: 10800, countryFlag: 'CO', group: 'Paletas', saleType: 'mayor' },
  { id: 'p5', name: 'Paleta Chupa Chups', price: 1500, costPrice: 1000, countryFlag: 'ES', group: 'Paletas', saleType: 'detal' },
  { id: 'p6', name: 'Chocolatina Jet Tradicional', price: 1200, costPrice: 850, countryFlag: 'CO', group: 'Chocolate', saleType: 'detal' },
  { id: 'p7', name: 'Chocolatina Jet Caja x24', price: 22000, costPrice: 16800, countryFlag: 'CO', group: 'Chocolate', saleType: 'mayor' },
  { id: 'p8', name: 'Kinder Bueno Blanco', price: 5500, costPrice: 4200, countryFlag: 'IT', group: 'Chocolate', saleType: 'detal' },
  { id: 'p9', name: 'Snickers Barra Caramelo', price: 4500, costPrice: 3200, countryFlag: 'US', group: 'Chocolate', saleType: 'detal' },
  { id: 'p10', name: 'Chiclets Adams Menta Display x18', price: 12000, costPrice: 9000, countryFlag: 'CO', group: 'Chicle', saleType: 'mayor' },
  { id: 'p11', name: 'Chicle Trident Spearmint', price: 2500, costPrice: 1800, countryFlag: 'US', group: 'Chicle', saleType: 'detal' },
  { id: 'p12', name: 'Galletas Oreo Original', price: 2200, costPrice: 1600, countryFlag: 'US', group: 'Galleta', saleType: 'detal' },
  { id: 'p13', name: 'Galletas Festival Paquete x12', price: 14000, costPrice: 10500, countryFlag: 'CO', group: 'Galleta', saleType: 'mayor' },
  { id: 'p14', name: 'Papas Margarita Pollo 105g', price: 3500, costPrice: 2600, countryFlag: 'CO', group: 'Papas', saleType: 'detal' },
  { id: 'p15', name: 'Pringles Original 40g', price: 6500, costPrice: 4800, countryFlag: 'US', group: 'Papas', saleType: 'detal' },
  { id: 'p16', name: 'Gaseosa Postobón Manzana 400ml', price: 2800, costPrice: 2000, countryFlag: 'CO', group: 'Bebida', saleType: 'detal' },
  { id: 'p17', name: 'Jugo Hit Mora 500ml', price: 3000, costPrice: 2200, countryFlag: 'CO', group: 'Bebida', saleType: 'detal' },
  { id: 'p18', name: 'Dulce Mazapán Tradicional x12', price: 15000, costPrice: 11000, countryFlag: 'MX', group: 'Pasta', saleType: 'mayor' },
];

export const DEFAULT_CONFIG: BusinessConfig = {
  storeName: 'Candy Universe',
  storeSubtitle: 'Mundo de Dulces & Confitería',
  phone: '300 123 4567',
  address: 'Local Comercial',
  receiptFooter: '¡Gracias por endulzar tu día en Candy Universe!',
  currencySymbol: 'COP',
  nextSaleNumber: 1004,
};
