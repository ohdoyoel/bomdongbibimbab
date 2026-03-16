"use client";

import React from "react";

// Precomputed rice grains: [cx, cy, rx, ry, rotation, isDark]
const RICE_GRAINS: [number, number, number, number, number, boolean][] = (() => {
  // Simple integer-based hash for determinism across server/client
  function h(s: number) { let a = s | 0; a = (a ^ 61) ^ (a >>> 16); a = a + (a << 3); a = a ^ (a >>> 4); a = Math.imul(a, 0x27d4eb2d); a = a ^ (a >>> 15); return (a >>> 0) / 4294967296; }
  const grains: [number, number, number, number, number, boolean][] = [];
  for (let i = 0; i < 40; i++) {
    const angle = h(i * 5) * Math.PI * 2;
    const dist = Math.sqrt(h(i * 5 + 1)) * 24;
    const x = 50 + Math.cos(angle) * dist;
    const y = 50 + Math.sin(angle) * dist;
    const rot = h(i * 5 + 2) * 180;
    const sz = 2.5 + h(i * 5 + 3) * 2;
    grains.push([+x.toFixed(2), +y.toFixed(2), +sz.toFixed(2), +(sz * 0.38).toFixed(2), +rot.toFixed(1), h(i * 5 + 4) > 0.5]);
  }
  return grains;
})();

// ─── Rice in rice cooker (top-view, lid open) ────────
export function RiceSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Cooker body */}
      <circle cx="50" cy="50" r="42" fill="#E0E0E0" />
      <circle cx="50" cy="50" r="38" fill="#BDBDBD" />
      {/* Inner pot */}
      <circle cx="50" cy="50" r="33" fill="#444" />
      <circle cx="50" cy="50" r="30" fill="#555" />
      {/* Rice inside */}
      <circle cx="50" cy="50" r="28" fill="#FEFEFE" />
      {/* Dense rice grain texture — precomputed positions */}
      {RICE_GRAINS.map(([x, y, rx, ry, rot, dark], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry}
          fill={dark ? "#E8E4D8" : "#F0EDE5"}
          transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      {/* Steam */}
      <g opacity="0.2">
        <path d="M42 28 Q44 20 40 14" stroke="#999" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M50 26 Q52 18 48 12" stroke="#999" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M58 28 Q60 20 56 14" stroke="#999" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ─── Bomdong on cutting board (top-view) ─────────────
export function BomdongSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Cutting board */}
      <rect x="8" y="15" width="84" height="70" rx="6" fill="#D7B98E" />
      <rect x="10" y="17" width="80" height="66" rx="5" fill="#E8CFA0" />
      {/* Wood grain */}
      <line x1="10" y1="35" x2="90" y2="35" stroke="#D7B98E" strokeWidth="0.5" opacity="0.5" />
      <line x1="10" y1="55" x2="90" y2="55" stroke="#D7B98E" strokeWidth="0.5" opacity="0.5" />
      {/* Bomdong leaves */}
      <ellipse cx="50" cy="50" rx="30" ry="24" fill="#3A7D32" />
      <ellipse cx="45" cy="46" rx="18" ry="20" fill="#4A9E3F" transform="rotate(-8 45 46)" />
      <ellipse cx="55" cy="46" rx="18" ry="20" fill="#4A9E3F" transform="rotate(8 55 46)" />
      <ellipse cx="50" cy="46" rx="16" ry="16" fill="#8DC63F" />
      <ellipse cx="48" cy="44" rx="10" ry="13" fill="#C5E17A" transform="rotate(-2 48 44)" />
      <ellipse cx="52" cy="44" rx="10" ry="13" fill="#C5E17A" transform="rotate(2 52 44)" />
      <ellipse cx="50" cy="43" rx="6" ry="8" fill="#F0F7A8" />
      <path d="M50 32 Q49 42 50 56" stroke="#3A7D32" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

// ─── Gochujang jar (top-view, lid open) ──────────────
export function GochujangSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Jar body from above */}
      <circle cx="50" cy="50" r="38" fill="#8B4513" />
      <circle cx="50" cy="50" r="35" fill="#A0522D" />
      {/* Rim */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="#6B3410" strokeWidth="2" />
      {/* Red paste inside */}
      <circle cx="50" cy="50" r="30" fill="#C41E1E" />
      <circle cx="50" cy="50" r="26" fill="#D42B2B" />
      {/* Paste texture - glossy highlights */}
      <ellipse cx="42" cy="44" rx="8" ry="5" fill="#E53935" opacity="0.5" transform="rotate(-15 42 44)" />
      <ellipse cx="58" cy="54" rx="6" ry="4" fill="#B71C1C" opacity="0.3" transform="rotate(20 58 54)" />
      {/* Spoon resting on top */}
      <rect x="46" y="16" width="8" height="30" rx="4" fill="#D7B98E" transform="rotate(15 50 31)" />
      <ellipse cx="50" cy="48" rx="7" ry="5" fill="#D7B98E" transform="rotate(15 50 48)" />
      <ellipse cx="50" cy="48" rx="5" ry="3.5" fill="#C41E1E" transform="rotate(15 50 48)" />
    </svg>
  );
}

// ─── Sesame oil bottle (top-view) ────────────────────
export function SesameOilSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Bottle body from above */}
      <ellipse cx="50" cy="55" rx="22" ry="22" fill="#8B6914" />
      <ellipse cx="50" cy="55" rx="19" ry="19" fill="#A07D1A" />
      {/* Label stripe */}
      <ellipse cx="50" cy="55" rx="16" ry="16" fill="none" stroke="#FFF8E1" strokeWidth="3" opacity="0.5" />
      {/* Bottle neck */}
      <circle cx="50" cy="30" r="8" fill="#A07D1A" />
      <circle cx="50" cy="30" r="5" fill="#5D4810" />
      {/* Cap opening - oil visible */}
      <circle cx="50" cy="30" r="3" fill="#C49A1A" />
      {/* Drop about to fall */}
      <ellipse cx="50" cy="38" rx="2" ry="3" fill="#C49A1A" opacity="0.7" />
      {/* Connection to body */}
      <rect x="44" y="30" width="12" height="20" rx="4" fill="#A07D1A" />
    </svg>
  );
}

// ─── Fried egg on plate (top-view, realistic) ────────
export function EggSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Plate */}
      <circle cx="50" cy="50" r="42" fill="#F5F5F5" />
      <circle cx="50" cy="50" r="38" fill="#FFF" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#EEE" strokeWidth="0.5" />
      {/* Egg white - irregular shape */}
      <path d="M50 24 Q72 22 78 42 Q82 60 68 72 Q52 80 34 74 Q20 66 22 48 Q24 28 50 24" fill="#FFFEF8" />
      <path d="M50 26 Q70 24 76 42 Q78 58 66 70 Q52 76 36 72 Q22 64 24 48 Q26 30 50 26" fill="#FFF" opacity="0.6" />
      {/* Yolk */}
      <circle cx="50" cy="48" r="14" fill="#FFB300" />
      <circle cx="46" cy="44" r="4" fill="#FFCA28" opacity="0.5" />
      {/* Crispy edge hint */}
      <path d="M72 38 Q76 42 74 48" stroke="#E8D5B0" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M28 52 Q24 56 26 62" stroke="#E8D5B0" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

// ─── Sesame seeds in small dish (top-view) ───────────
export function SesameSeedsSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Small dish */}
      <circle cx="50" cy="50" r="34" fill="#E8E0D0" />
      <circle cx="50" cy="50" r="30" fill="#F0E8D8" />
      <circle cx="50" cy="50" r="26" fill="#F5F0E5" />
      {/* Seeds */}
      {[
        [38,38,-15],[46,34,10],[54,36,-8],[42,46,20],[50,42,-5],
        [58,44,12],[36,52,8],[46,50,-12],[56,48,15],[62,50,-10],
        [40,56,5],[50,54,18],[58,56,-8],[44,60,10],[54,58,-15],
        [48,44,22],[52,40,-18],[60,42,6],[38,48,-10],[56,52,14],
      ].map(([x,y,r],i) => (
        <ellipse key={i} cx={x} cy={y} rx="3.5" ry="1.8" fill="#F5E6B8" transform={`rotate(${r} ${x} ${y})`} stroke="#E8D9A8" strokeWidth="0.2" />
      ))}
    </svg>
  );
}

// ─── Gochugaru in container (top-view) ───────────────
export function GochugaluSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Container */}
      <rect x="16" y="16" width="68" height="68" rx="10" fill="#D32F2F" />
      <rect x="20" y="20" width="60" height="60" rx="8" fill="#E64A19" />
      {/* Open top showing red flakes */}
      <rect x="24" y="24" width="52" height="52" rx="6" fill="#FF5722" />
      <rect x="28" y="28" width="44" height="44" rx="4" fill="#E64A19" />
      {/* Flake texture */}
      {[
        [40,40],[50,36],[60,42],[44,50],[54,46],
        [38,56],[48,58],[58,52],[42,44],[56,38],
        [50,52],[62,48],[36,48],[46,42],[52,56],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={1.2 + (i%3)*0.4} fill="#BF360C" opacity={0.4 + (i%3)*0.15} />
      ))}
      {/* Spoon */}
      <rect x="48" y="10" width="6" height="28" rx="3" fill="#D7B98E" transform="rotate(10 51 24)" />
      <ellipse cx="52" cy="38" rx="6" ry="4" fill="#D7B98E" transform="rotate(10 52 38)" />
      <ellipse cx="52" cy="38" rx="4" ry="2.5" fill="#E64A19" transform="rotate(10 52 38)" />
    </svg>
  );
}

// ─── Garlic (minced in bowl, top-view) ───────────────
export function GarlicSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Small bowl */}
      <circle cx="50" cy="50" r="32" fill="#E0D8C8" />
      <circle cx="50" cy="50" r="28" fill="#EDE7D8" />
      {/* Minced garlic */}
      <circle cx="50" cy="50" r="24" fill="#F5F0E0" />
      {[
        [38,40],[44,36],[52,38],[60,42],[42,48],
        [50,44],[58,46],[36,52],[46,52],[54,50],
        [62,48],[40,58],[50,56],[58,54],[44,44],
        [56,42],[48,60],[38,46],[54,58],[60,52],
      ].map(([x,y],i) => (
        <rect key={i} x={x-2} y={y-1.5} width={3+i%2} height={2.5+i%2*0.5} rx="1" fill="#EDE7D0" stroke="#DDD5C0" strokeWidth="0.3" transform={`rotate(${i*18} ${x} ${y})`} />
      ))}
    </svg>
  );
}

// ─── Vinegar bottle (top-view) ───────────────────────
export function VinegarSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Bottle from above */}
      <ellipse cx="50" cy="58" rx="20" ry="20" fill="#81C784" />
      <ellipse cx="50" cy="58" rx="17" ry="17" fill="#A5D6A7" />
      {/* Label */}
      <ellipse cx="50" cy="58" rx="14" ry="14" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.4" />
      {/* Neck */}
      <rect x="44" y="32" width="12" height="20" rx="5" fill="#81C784" />
      {/* Cap */}
      <circle cx="50" cy="30" r="7" fill="#388E3C" />
      <circle cx="50" cy="30" r="4" fill="#2E7D32" />
    </svg>
  );
}

// ─── Fish sauce bottle (top-view) ────────────────────
export function FishSauceSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Bottle from above */}
      <ellipse cx="50" cy="58" rx="18" ry="18" fill="#6D4C41" />
      <ellipse cx="50" cy="58" rx="15" ry="15" fill="#795548" />
      {/* Label */}
      <ellipse cx="50" cy="58" rx="12" ry="12" fill="none" stroke="#FFF8E1" strokeWidth="2" opacity="0.4" />
      {/* Neck */}
      <rect x="45" y="34" width="10" height="18" rx="4" fill="#6D4C41" />
      {/* Cap */}
      <circle cx="50" cy="32" r="6" fill="#4E342E" />
      <circle cx="50" cy="32" r="3.5" fill="#3E2723" />
    </svg>
  );
}

// ─── Completed bibimbap for share card ───────────────
export function CompleteBibimbapSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="120" r="110" fill="#8B7B5E" />
      <circle cx="120" cy="120" r="104" fill="#7B6B4F" />
      <circle cx="120" cy="120" r="96" fill="#FEFEFE" />
      <path d="M50 100 Q80 70 110 100 Q80 110 50 100" fill="#6DBE45" />
      <path d="M55 108 Q80 82 105 108 Q80 115 55 108" fill="#8DC63F" />
      <path d="M130 100 Q160 75 185 100 Q160 110 130 100" fill="#E64A19" opacity="0.6" />
      <ellipse cx="120" cy="115" rx="22" ry="20" fill="#FFFEF8" />
      <circle cx="120" cy="113" r="10" fill="#FFB300" />
      <circle cx="116" cy="110" r="3" fill="#FFCA28" opacity="0.5" />
      {[
        [70,120],[85,100],[95,130],[145,100],[155,125],[165,108],
        [78,135],[140,135],[110,140],[130,140],
      ].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="1.2" fill="#F5E6B8" transform={`rotate(${i*35} ${x} ${y})`} />
      ))}
      <path d="M80 118 Q100 110 120 118 Q140 126 160 118" stroke="#C49A1A" strokeWidth="1.2" fill="none" opacity="0.4" />
      <circle cx="120" cy="120" r="110" fill="none" stroke="#9B8B6E" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export function SteamEffect({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 ${className}`}>
      {[0,1,2].map((i) => (
        <div key={i} className="absolute animate-steam" style={{ left: `${i*20-20}px`, animationDelay: `${i*0.7}s`, opacity: 0 }}>
          <svg width="20" height="30" viewBox="0 0 20 30">
            <path d="M10 30 Q8 20 12 15 Q8 10 10 0" stroke="#ccc" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      ))}
    </div>
  );
}
