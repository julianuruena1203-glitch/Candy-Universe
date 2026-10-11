import { Product, BusinessConfig } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Gomas Trululu Aros 90g', price: 2500, priceDetal: 2500, priceMayor: 2000, costPrice: 1500, countryFlag: 'CO', group: 'Gomas', saleType: 'detal' },
  { id: 'p2', name: 'Gomas Grissly Ositos Display x12', price: 24000, priceDetal: 24000, priceMayor: 20000, costPrice: 16500, countryFlag: 'CO', group: 'Gomas', saleType: 'mayor' },
  { id: 'p3', name: 'Paleta Dr. Look Ojo', price: 2000, priceDetal: 2000, priceMayor: 1600, costPrice: 1200, countryFlag: 'CO', group: 'Paletas', saleType: 'detal' },
  { id: 'p4', name: 'Paleta Bon Bon Bum Fresa x24', price: 14500, priceDetal: 14500, priceMayor: 12000, costPrice: 9800, countryFlag: 'CO', group: 'Paletas', saleType: 'mayor' },
  { id: 'p5', name: 'Paleta Chupa Chups', price: 1500, priceDetal: 1500, priceMayor: 1200, costPrice: 900, countryFlag: 'ES', group: 'Paletas', saleType: 'detal' },
  { id: 'p6', name: 'Chocolatina Jet Tradicional', price: 1200, priceDetal: 1200, priceMayor: 950, costPrice: 750, countryFlag: 'CO', group: 'Chocolate', saleType: 'detal' },
  { id: 'p7', name: 'Chocolatina Jet Caja x24', price: 22000, priceDetal: 22000, priceMayor: 18500, costPrice: 15500, countryFlag: 'CO', group: 'Chocolate', saleType: 'mayor' },
  { id: 'p8', name: 'Kinder Bueno Blanco', price: 5500, priceDetal: 5500, priceMayor: 4600, costPrice: 3800, countryFlag: 'IT', group: 'Chocolate', saleType: 'detal' },
  { id: 'p9', name: 'Snickers Barra Caramelo', price: 4500, priceDetal: 4500, priceMayor: 3800, costPrice: 3000, countryFlag: 'US', group: 'Chocolate', saleType: 'detal' },
  { id: 'p10', name: 'Chiclets Adams Menta Display x18', price: 12000, priceDetal: 12000, priceMayor: 10000, costPrice: 8200, countryFlag: 'CO', group: 'Chicle', saleType: 'mayor' },
  { id: 'p11', name: 'Chicle Trident Spearmint', price: 2500, priceDetal: 2500, priceMayor: 2000, costPrice: 1600, countryFlag: 'US', group: 'Chicle', saleType: 'detal' },
  { id: 'p12', name: 'Galletas Oreo Original', price: 2200, priceDetal: 2200, priceMayor: 1800, costPrice: 1400, countryFlag: 'US', group: 'Galleta', saleType: 'detal' },
  { id: 'p13', name: 'Galletas Festival Paquete x12', price: 14000, priceDetal: 14000, priceMayor: 11800, costPrice: 9500, countryFlag: 'CO', group: 'Galleta', saleType: 'mayor' },
  { id: 'p14', name: 'Papas Margarita Pollo 105g', price: 3500, priceDetal: 3500, priceMayor: 2900, costPrice: 2400, countryFlag: 'CO', group: 'Papas', saleType: 'detal' },
  { id: 'p15', name: 'Pringles Original 40g', price: 6500, priceDetal: 6500, priceMayor: 5400, costPrice: 4400, countryFlag: 'US', group: 'Papas', saleType: 'detal' },
  { id: 'p16', name: 'Gaseosa Postobón Manzana 400ml', price: 2800, priceDetal: 2800, priceMayor: 2300, costPrice: 1900, countryFlag: 'CO', group: 'Bebida', saleType: 'detal' },
  { id: 'p17', name: 'Jugo Hit Mora 500ml', price: 3000, priceDetal: 3000, priceMayor: 2500, costPrice: 2000, countryFlag: 'CO', group: 'Bebida', saleType: 'detal' },
  { id: 'p18', name: 'Dulce Mazapán Tradicional x12', price: 15000, priceDetal: 15000, priceMayor: 12500, costPrice: 10000, countryFlag: 'MX', group: 'Pasta', saleType: 'mayor' },
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
