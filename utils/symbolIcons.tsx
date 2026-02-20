
import React, { useState, useEffect } from 'react';

export interface SymbolParts {
  base: string;
  quote: string;
  raw: string;
}

// 1️⃣ Dedicated Commodity Mappings (TradingView accurately shows icons, not flags)
const commodityIcons: Record<string, string> = {
  XAUUSD: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png", // Gold
  XAGUSD: "https://cdn-icons-png.flaticon.com/512/2933/2933114.png", // Silver
  USOIL: "https://cdn-icons-png.flaticon.com/512/2560/2560032.png",  // Oil Barrel
  UKOIL: "https://cdn-icons-png.flaticon.com/512/2560/2560032.png",
  XTIUSD: "https://cdn-icons-png.flaticon.com/512/2560/2560032.png",
};

const stockDomainMap: Record<string, string> = {
  AAPL: 'apple.com',
  TSLA: 'tesla.com',
  MSFT: 'microsoft.com',
  NVDA: 'nvidia.com',
  AMZN: 'amazon.com',
  NFLX: 'netflix.com',
  GOOG: 'google.com',
  META: 'meta.com',
  AMD: 'amd.com',
  INTC: 'intel.com',
};

const indexIcons: Record<string, string> = {
  NAS100: "https://s3-symbol-logo.tradingview.com/indices/nasdaq.svg",
  NDQ: "https://s3-symbol-logo.tradingview.com/indices/nasdaq.svg",
  SPX: "https://s3-symbol-logo.tradingview.com/indices/s-and-p-500.svg",
  US30: "https://s3-symbol-logo.tradingview.com/indices/dow-jones.svg",
  DJI: "https://s3-symbol-logo.tradingview.com/indices/dow-jones.svg",
  DAX: "https://s3-symbol-logo.tradingview.com/indices/dax.svg",
  FTSE: "https://s3-symbol-logo.tradingview.com/indices/ftse-100.svg",
  DXY: "https://cdn-icons-png.flaticon.com/512/2150/2150062.png",
};

// 2️⃣ Optimized Parsing
export function parseSymbol(symbol: string): SymbolParts {
  const clean = symbol.includes(":") ? symbol.split(":")[1] : symbol;

  if (commodityIcons[clean]) return { base: clean, quote: "", raw: clean };
  if (clean.endsWith('USDT')) return { base: clean.replace('USDT', ''), quote: 'USDT', raw: clean };
  if (clean.endsWith('USD') && clean.length > 3) return { base: clean.replace('USD', ''), quote: 'USD', raw: clean };
  
  if (clean.length === 6 && !indexIcons[clean] && !stockDomainMap[clean]) {
    return { base: clean.slice(0, 3), quote: clean.slice(3, 6), raw: clean };
  }

  return { base: clean, quote: "", raw: clean };
}

export function detectAssetType(symbol: string): 'forex' | 'metal' | 'crypto' | 'index' | 'stock' | 'commodity' {
  const clean = symbol.includes(":") ? symbol.split(":")[1] : symbol;
  
  if (commodityIcons[clean]) return "commodity";
  if (/^(EUR|GBP|USD|JPY|CHF|AUD|CAD|NZD)/.test(clean) && clean.length === 6) return "forex";
  if (/^(XAU|XAG)/.test(clean)) return "metal";
  if (/^(BTC|ETH|SOL|BNB|XRP|ADA|AVAX|DOT|LINK)/.test(clean)) return "crypto";
  if (/^(SPX|NDQ|DJI|DAX|FTSE|NAS100|US30|DXY)/.test(clean)) return "index";
  
  return "stock";
}

const currencyFlags: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", JPY: "jp", 
  CHF: "ch", AUD: "au", CAD: "ca", NZD: "nz",
};

// 3️⃣ SafeIcon Component with guaranteed fallback handling
const SafeIcon: React.FC<{ src: string | null; alt: string; size: number; className?: string }> = ({ src, alt, size, className }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  if (!src || error) {
    return (
      <div 
        className={`rounded-full flex items-center justify-center text-white font-bold bg-[#f23645] shrink-0 border border-[#1e222d] ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${!loaded ? 'bg-[#2a2e39] animate-pulse rounded-full' : ''}`} style={{ width: size, height: size }}>
      <img 
        src={src} 
        alt={alt} 
        className={`rounded-full border border-[#1e222d] object-cover bg-[#2a2e39] w-full h-full transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

export function resolveIcon(asset: string): string | null {
  if (currencyFlags[asset]) {
    return `https://flagcdn.com/w40/${currencyFlags[asset]}.png`;
  }

  const cryptoMap: Record<string, string> = {
    BTC: 'btc', ETH: 'eth', USDT: 'usdt', SOL: 'sol',
    BNB: 'bnb', XRP: 'xrp', ADA: 'ada', AVAX: 'avax',
    DOT: 'dot', LINK: 'link',
  };

  if (cryptoMap[asset]) {
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${cryptoMap[asset]}.png`;
  }

  if (asset === 'XAU') return 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png';
  if (asset === 'XAG') return 'https://cdn-icons-png.flaticon.com/512/2933/2933114.png';

  if (stockDomainMap[asset]) {
    return `https://logo.clearbit.com/${stockDomainMap[asset]}`;
  }

  if (indexIcons[asset]) {
    return indexIcons[asset];
  }

  return null;
}

export function getPairIcons(symbol: string) {
  const type = detectAssetType(symbol);
  const clean = symbol.includes(":") ? symbol.split(":")[1] : symbol;
  const { base, quote } = parseSymbol(symbol);
  
  if (type === 'commodity') {
    return {
      baseIcon: commodityIcons[clean],
      quoteIcon: null,
      base: clean,
      quote: "",
      label: clean,
    };
  }

  if (type === 'index' || type === 'stock') {
    return {
      baseIcon: resolveIcon(base),
      quoteIcon: null,
      base,
      quote: "",
      label: base,
    };
  }

  return {
    baseIcon: resolveIcon(base),
    quoteIcon: resolveIcon(quote),
    base,
    quote,
    label: quote ? `${base}/${quote}` : base,
  };
}

export const PairIcons: React.FC<{ symbol: string, size?: number }> = ({ symbol, size = 18 }) => {
  const { baseIcon, quoteIcon, base, quote } = getPairIcons(symbol);

  // Single centered icon for stocks, indices, and commodities
  if (!quoteIcon) {
    return (
      <div className="flex items-center justify-center shrink-0" style={{ width: size * 1.6 }}>
        <SafeIcon 
          src={baseIcon} 
          alt={base} 
          size={size + 4} 
        />
      </div>
    );
  }

  // Dual overlapping icons for Forex and Crypto pairs
  return (
    <div className="flex items-center relative shrink-0" style={{ width: size * 1.6, height: size + 4 }}>
      <SafeIcon 
        src={baseIcon} 
        alt={base} 
        size={size + 2} 
        className="z-10"
      />
      <SafeIcon 
        src={quoteIcon} 
        alt={quote} 
        size={size + 2} 
        className="absolute"
        style={{ left: size * 0.6 } as any}
      />
    </div>
  );
};
