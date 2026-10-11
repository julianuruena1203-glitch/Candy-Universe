import { CountryOption, ProductGroup } from '../types';

export const COUNTRIES: CountryOption[] = [
  { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: 'MX', flag: '🇲🇽', name: 'México' },
  { code: 'ES', flag: '🇪🇸', name: 'España' },
  { code: 'JP', flag: '🇯🇵', name: 'Japón' },
  { code: 'KR', flag: '🇰🇷', name: 'Corea del Sur' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  { code: 'PE', flag: '🇵🇪', name: 'Perú' },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador' },
  { code: 'DE', flag: '🇩🇪', name: 'Alemania' },
  { code: 'CH', flag: '🇨🇭', name: 'Suiza' },
  { code: 'IT', flag: '🇮🇹', name: 'Italia' },
  { code: 'GB', flag: '🇬🇧', name: 'Reino Unido' },
  { code: 'INT', flag: '🌐', name: 'Internacional / Otro' },
];

// Grupos estrictamente en orden alfabético
export const PRODUCT_GROUPS: ProductGroup[] = [
  'Bebida',
  'Chicle',
  'Chocolate',
  'Galleta',
  'Gomas',
  'Paletas',
  'Papas',
  'Pasta',
];
