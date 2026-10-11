import React from 'react';

interface CandyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const CandyLogo: React.FC<CandyLogoProps> = ({ size = 'md', showText = true }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const badgeSize = isSm ? 'w-8 h-8' : isLg ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon Badge inspired by the Candy Universe image: vibrant violet with swirl candy & cyan ring */}
      <div
        className={`${badgeSize} rounded-2xl bg-gradient-to-tr from-[#6d28d9] via-[#8b5cf6] to-[#ec4899] p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center relative overflow-hidden group`}
      >
        <div className="w-full h-full bg-[#5b15b5] rounded-[14px] flex items-center justify-center relative">
          {/* Swirl lollipop / candy symbol */}
          <svg
            viewBox="0 0 36 36"
            className="w-4/5 h-4/5 transition-transform duration-500 group-hover:rotate-45"
            fill="none"
          >
            {/* Swirl Lollipop Outer Circle */}
            <circle cx="18" cy="18" r="14" fill="#38bdf8" />
            <path
              d="M18 4C25.732 4 32 10.268 32 18C32 25.732 25.732 32 18 32C10.268 32 4 25.732 4 18C4 10.268 10.268 4 18 4Z"
              fill="#ec4899"
            />
            {/* Swirl rays */}
            <path
              d="M18 18L14 4.5C16 4.1 18 4 18 4L18 18Z"
              fill="#facc15"
            />
            <path
              d="M18 18L27 6C25.3 4.8 23.4 4 18 18Z"
              fill="#ef4444"
            />
            <path
              d="M18 18L31.5 14C31.9 16 32 18 18 18Z"
              fill="#38bdf8"
            />
            <path
              d="M18 18L30 27C31.2 25.3 32 23.4 18 18Z"
              fill="#ffffff"
            />
            <path
              d="M18 18L14 31.5C16 31.9 18 32 18 18Z"
              fill="#facc15"
            />
            <path
              d="M18 18L6 27C7.5 28.5 9.4 29.8 18 18Z"
              fill="#ef4444"
            />
            <path
              d="M18 18L4.5 14C4.1 16 4 18 18 18Z"
              fill="#38bdf8"
            />
            <path
              d="M18 18L6 9C4.8 10.7 4 12.6 18 18Z"
              fill="#ffffff"
            />
            {/* Inner Spiral Core */}
            <circle cx="18" cy="18" r="4.5" fill="#ffffff" />
            <circle cx="18" cy="18" r="2.5" fill="#f43f5e" />
          </svg>
        </div>
      </div>

      {/* Styled Brand Name inspired by the image's 3D Candy font and cyan/white layering */}
      {showText && (
        <div className="leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-candy font-bold tracking-normal uppercase ${
                isSm ? 'text-sm' : isLg ? 'text-2xl' : 'text-lg'
              } text-[#5b15b5] drop-shadow-[0_1.5px_0_#38bdf8]`}
              style={{
                textShadow: '0 1.5px 0 #38bdf8, 0 2.5px 0 #0284c7',
              }}
            >
              CANDY
            </span>
            <span
              className={`font-candy font-bold tracking-normal uppercase ${
                isSm ? 'text-sm' : isLg ? 'text-2xl' : 'text-lg'
              } text-[#5b15b5] drop-shadow-[0_1.5px_0_#38bdf8]`}
              style={{
                textShadow: '0 1.5px 0 #38bdf8, 0 2.5px 0 #0284c7',
              }}
            >
              UNIVERSE
            </span>
          </div>
          <p className="text-[10px] font-light text-purple-600/80 tracking-wider uppercase mt-0.5">
            Mundo de Dulces
          </p>
        </div>
      )}
    </div>
  );
};
