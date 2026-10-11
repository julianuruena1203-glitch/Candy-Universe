import React from 'react';

interface CountryFlagProps {
  countryCode: string; // e.g. 'CO', 'US', 'MX', 'ES', etc. or flag emoji
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
  size = 'md',
}) => {
  // Normalize code: if emoji passed like '🇨🇴', convert to 'CO'
  let code = countryCode.toUpperCase();
  if (countryCode === '🇨🇴' || countryCode === 'CO') code = 'CO';
  else if (countryCode === '🇺🇸' || countryCode === 'US') code = 'US';
  else if (countryCode === '🇲🇽' || countryCode === 'MX') code = 'MX';
  else if (countryCode === '🇪🇸' || countryCode === 'ES') code = 'ES';
  else if (countryCode === '🇯🇵' || countryCode === 'JP') code = 'JP';
  else if (countryCode === '🇰🇷' || countryCode === 'KR') code = 'KR';
  else if (countryCode === '🇦🇷' || countryCode === 'AR') code = 'AR';
  else if (countryCode === '🇧🇷' || countryCode === 'BR') code = 'BR';
  else if (countryCode === '🇨🇱' || countryCode === 'CL') code = 'CL';
  else if (countryCode === '🇵🇪' || countryCode === 'PE') code = 'PE';
  else if (countryCode === '🇪🇨' || countryCode === 'EC') code = 'EC';
  else if (countryCode === '🇩🇪' || countryCode === 'DE') code = 'DE';
  else if (countryCode === '🇨🇭' || countryCode === 'CH') code = 'CH';
  else if (countryCode === '🇮🇹' || countryCode === 'IT') code = 'IT';
  else if (countryCode === '🇬🇧' || countryCode === 'GB') code = 'GB';
  else if (countryCode === '🌐' || countryCode === 'INT') code = 'INT';

  const sizeClass = size === 'sm' ? 'w-4 h-3' : size === 'lg' ? 'w-8 h-6' : 'w-6 h-4.5';

  switch (code) {
    case 'CO': // Colombia
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="12" fill="#FCD116" />
          <rect y="12" width="36" height="6" fill="#003893" />
          <rect y="18" width="36" height="6" fill="#CE1126" />
        </svg>
      );
    case 'US': // Estados Unidos
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#B22234" />
          <path d="M0 2.77h36M0 6.46h36M0 10.15h36M0 13.84h36M0 17.53h36M0 21.23h36" stroke="#fff" strokeWidth="1.85" />
          <rect width="14.4" height="12.9" fill="#3C3B6E" />
          <circle cx="4" cy="4" r="0.8" fill="#fff" />
          <circle cx="8" cy="4" r="0.8" fill="#fff" />
          <circle cx="12" cy="4" r="0.8" fill="#fff" />
          <circle cx="6" cy="7" r="0.8" fill="#fff" />
          <circle cx="10" cy="7" r="0.8" fill="#fff" />
          <circle cx="4" cy="10" r="0.8" fill="#fff" />
          <circle cx="8" cy="10" r="0.8" fill="#fff" />
          <circle cx="12" cy="10" r="0.8" fill="#fff" />
        </svg>
      );
    case 'MX': // México
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="12" height="24" fill="#006847" />
          <rect x="12" width="12" height="24" fill="#FFFFFF" />
          <rect x="24" width="12" height="24" fill="#CE1126" />
          <circle cx="18" cy="12" r="2.2" fill="#8B4513" />
        </svg>
      );
    case 'ES': // España
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="6" fill="#AA151B" />
          <rect y="6" width="36" height="12" fill="#F1BF00" />
          <rect y="18" width="36" height="6" fill="#AA151B" />
          <rect x="7" y="9" width="3.5" height="6" fill="#AA151B" rx="1" />
        </svg>
      );
    case 'JP': // Japón
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden border border-slate-200 shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#FFFFFF" />
          <circle cx="18" cy="12" r="6" fill="#BC002D" />
        </svg>
      );
    case 'KR': // Corea del Sur
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden border border-slate-200 shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#FFFFFF" />
          <circle cx="18" cy="12" r="5" fill="#CD2E3A" />
          <path d="M13 12a5 5 0 0 0 10 0" fill="#0047A0" />
        </svg>
      );
    case 'AR': // Argentina
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="8" fill="#75AADB" />
          <rect y="8" width="36" height="8" fill="#FFFFFF" />
          <rect y="16" width="36" height="8" fill="#75AADB" />
          <circle cx="18" cy="12" r="2" fill="#F6B40E" />
        </svg>
      );
    case 'BR': // Brasil
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#009739" />
          <polygon points="18,3 32,12 18,21 4,12" fill="#FEDD00" />
          <circle cx="18" cy="12" r="4.5" fill="#012169" />
          <path d="M14 12q4 -2 8 0" stroke="#fff" strokeWidth="0.7" fill="none" />
        </svg>
      );
    case 'CL': // Chile
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="12" fill="#FFFFFF" />
          <rect y="12" width="36" height="12" fill="#D52B1E" />
          <rect width="12" height="12" fill="#0039A6" />
          <polygon points="6,3.5 7,6 9.5,6 7.5,7.5 8.2,10 6,8.5 3.8,10 4.5,7.5 2.5,6 5,6" fill="#fff" transform="scale(0.8) translate(1.5,1)" />
        </svg>
      );
    case 'PE': // Perú
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="12" height="24" fill="#D91023" />
          <rect x="12" width="12" height="24" fill="#FFFFFF" />
          <rect x="24" width="12" height="24" fill="#D91023" />
        </svg>
      );
    case 'EC': // Ecuador
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="12" fill="#FFD100" />
          <rect y="12" width="36" height="6" fill="#0033A0" />
          <rect y="18" width="36" height="6" fill="#DA291C" />
          <circle cx="18" cy="12" r="2" fill="#4B9CD3" />
        </svg>
      );
    case 'DE': // Alemania
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="8" fill="#000000" />
          <rect y="8" width="36" height="8" fill="#DD0000" />
          <rect y="16" width="36" height="8" fill="#FFCE00" />
        </svg>
      );
    case 'CH': // Suiza
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#D52B1E" />
          <rect x="15" y="6" width="6" height="12" fill="#FFFFFF" />
          <rect x="10" y="9" width="16" height="6" fill="#FFFFFF" />
        </svg>
      );
    case 'IT': // Italia
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="12" height="24" fill="#008C45" />
          <rect x="12" width="12" height="24" fill="#F4F5F0" />
          <rect x="24" width="12" height="24" fill="#CD212A" />
        </svg>
      );
    case 'GB': // Reino Unido
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#012169" />
          <path d="M0 0L36 24M36 0L0 24" stroke="#fff" strokeWidth="3" />
          <path d="M0 0L36 24M36 0L0 24" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M18 0V24M0 12H36" stroke="#fff" strokeWidth="5" />
          <path d="M18 0V24M0 12H36" stroke="#C8102E" strokeWidth="3" />
        </svg>
      );
    default: // Internacional / Otro
      return (
        <svg viewBox="0 0 36 24" className={`${sizeClass} rounded-[3px] shadow-2xs overflow-hidden bg-purple-100 shrink-0 ${className}`}>
          <rect width="36" height="24" fill="#3B82F6" />
          <circle cx="18" cy="12" r="7" fill="none" stroke="#fff" strokeWidth="1.2" />
          <ellipse cx="18" cy="12" rx="3.5" ry="7" fill="none" stroke="#fff" strokeWidth="1.2" />
          <line x1="11" y1="12" x2="25" y2="12" stroke="#fff" strokeWidth="1.2" />
        </svg>
      );
  }
};
