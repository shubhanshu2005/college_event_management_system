import React from 'react';

interface AryaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  showText?: boolean;
}

export const AryaLogo: React.FC<AryaLogoProps> = ({
  className = '',
  size = 'md',
  layout = 'horizontal',
  showText = true
}) => {
  // Dimensions for emblem
  const iconSize = {
    sm: 38,
    md: 52,
    lg: 72,
    xl: 96
  }[size];

  // SVG Cogwheel & Saraswati Emblem
  const Emblem = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      <defs>
        {/* Sunburst Gradient */}
        <radialGradient id="aryaSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="45%" stopColor="#FDE047" />
          <stop offset="90%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </radialGradient>
        {/* Red Ribbon Gradient */}
        <linearGradient id="aryaRibbonRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>

      {/* 1. Industrial Outer Cogwheel (24 Teeth) */}
      <g stroke="#1F2937" strokeWidth="2.5" fill="#FFFFFF">
        {/* Outer teeth points */}
        <path
          d="
          M80 6 L84 14 L91 13 L93 21 L101 22 L100 30 L108 33 L105 41 L112 46 L108 53 L114 59 L108 66 L112 73 L105 78 L108 86 L100 89 L101 97 L93 98 L91 106 L84 105 L80 113 L76 105 L69 106 L67 98 L59 97 L60 89 L52 86 L55 78 L48 73 L52 66 L46 59 L52 53 L48 46 L55 41 L52 33 L60 30 L59 22 L67 21 L69 13 L76 14 Z
          "
          transform="translate(0, -2) scale(1.02)"
          fill="#F8FAFC"
        />
        {/* Outer Circular Ring */}
        <circle cx="80" cy="58" r="48" fill="#FFFFFF" stroke="#1F2937" strokeWidth="3" />
        <circle cx="80" cy="58" r="39" fill="none" stroke="#1F2937" strokeWidth="2" />
      </g>

      {/* Text along circle: ARYA COLLEGE OF ENGINEERING... */}
      <path id="topCirclePath" d="M 43,58 A 37,37 0 1,1 117,58" fill="none" />
      <path id="bottomCirclePath" d="M 43,58 A 37,37 0 0,0 117,58" fill="none" />

      <text fontSize="6.2" fontWeight="900" fontFamily="sans-serif" fill="#111827" letterSpacing="0.4">
        <textPath href="#topCirclePath" startOffset="50%" textAnchor="middle">
          ARYA COLLEGE OF ENGG. &amp; I.T.
        </textPath>
      </text>

      <text fontSize="6.2" fontWeight="900" fontFamily="sans-serif" fill="#111827" letterSpacing="0.6">
        <textPath href="#bottomCirclePath" startOffset="50%" textAnchor="middle">
          JAIPUR (RAJ.)
        </textPath>
      </text>

      {/* 2. Center Sunburst Disc */}
      <circle cx="80" cy="58" r="28" fill="url(#aryaSun)" stroke="#B91C1C" strokeWidth="1.8" />

      {/* Sun rays around the deity */}
      <g stroke="#EA580C" strokeWidth="1.2" opacity="0.6">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="80"
            y1="58"
            x2={80 + 26 * Math.cos((deg * Math.PI) / 180)}
            y2={58 + 26 * Math.sin((deg * Math.PI) / 180)}
          />
        ))}
      </g>

      {/* 3. Sacred Goddess Saraswati Motif with Veena & Lotus */}
      {/* Crown / Halo (Mukut) */}
      <circle cx="80" cy="42" r="8" fill="#FDE047" stroke="#DC2626" strokeWidth="0.8" />
      <path d="M77 37 L80 32 L83 37 Z" fill="#DC2626" />
      {/* Face & Figure */}
      <circle cx="80" cy="44" r="4.5" fill="#FFF" stroke="#B91C1C" strokeWidth="0.8" />
      {/* Red bindi / sacred mark */}
      <circle cx="80" cy="43.5" r="0.8" fill="#DC2626" />
      {/* Red Sari / Seated Posture */}
      <path d="M72 58 C72 49 76 48 80 48 C84 48 88 49 88 58 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
      {/* Veena (Lute Instrument) crossing diagonal */}
      <line x1="68" y1="62" x2="92" y2="44" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="68" cy="62" r="3.2" fill="#92400E" stroke="#78350F" strokeWidth="0.8" />
      <circle cx="91" cy="45" r="2.2" fill="#B45309" />
      {/* Veena Strings */}
      <line x1="69" y1="61" x2="90" y2="45" stroke="#FEF08A" strokeWidth="0.8" />
      {/* White Swan / Lotus Base */}
      <path d="M68 67 C72 63 88 63 92 67 C88 71 72 71 68 67 Z" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1" />
      <path d="M75 67 Q80 63 85 67" stroke="#DC2626" strokeWidth="0.8" fill="none" />

      {/* 4. Sanskrit Motto Banner: विद्या ददाति विनियम् */}
      {/* Folded Ribbon Ends */}
      <polygon points="26,104 36,97 36,112 26,117" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
      <polygon points="134,104 124,97 124,112 134,117" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
      {/* Main Red Banner Body */}
      <path
        d="M32 100 Q80 94 128 100 L124 114 Q80 108 36 114 Z"
        fill="url(#aryaRibbonRed)"
        stroke="#991B1B"
        strokeWidth="1.2"
      />
      {/* Motto Text */}
      <text
        x="80"
        y="108.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="8.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        विद्या ददाति विनियम्
      </text>
    </svg>
  );

  // Stacked Layout (Identical to user's uploaded image: Emblem on top, ARYA in big red, COLLEGE OF ENGINEERING... KUKAS - JAIPUR)
  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Emblem Top */}
        <Emblem />

        {/* Big Bold Red ARYA */}
        <div className="mt-1.5 leading-none tracking-widest text-[#DC2626] font-serif font-black text-3xl sm:text-4xl drop-shadow-sm">
          ARYA
        </div>

        {/* COLLEGE OF ENGINEERING & I.T. in Bold Black */}
        <div className="mt-1 font-sans font-black tracking-tight text-[#111827] text-xs sm:text-sm uppercase">
          College of Engineering &amp; I.T.
        </div>

        {/* KUKAS - JAIPUR */}
        <div className="font-sans font-extrabold tracking-widest text-slate-800 text-[10px] sm:text-xs uppercase mt-0.5">
          Kukas - Jaipur
        </div>
      </div>
    );
  }

  // Horizontal Layout (for Navbar & Top Bars)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <Emblem />

      {showText && (
        <div className="flex flex-col leading-none">
          {/* Big Bold Crimson ARYA */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-[#DC2626] tracking-wider text-2xl sm:text-3xl leading-none">
              ARYA
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-sans text-[9px] font-black uppercase tracking-wider shadow-sm">
              Main Campus
            </span>
          </div>

          {/* COLLEGE OF ENGINEERING & I.T. */}
          <span className="font-sans font-black tracking-tight text-[#111827] text-xs sm:text-sm uppercase mt-1">
            College of Engineering &amp; I.T.
          </span>

          {/* KUKAS - JAIPUR */}
          <span className="font-sans font-bold tracking-widest text-slate-600 text-[9px] sm:text-[10px] uppercase mt-0.5">
            Kukas - Jaipur • RTU Affiliated • Estd. 2000
          </span>
        </div>
      )}
    </div>
  );
};
