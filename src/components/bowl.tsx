"use client";

import React, { useMemo } from "react";
import type { Ingredient, DroppedItem } from "@/lib/cooking-steps";
import { BOWL_CAPACITY } from "@/lib/cooking-steps";

interface BowlProps {
  ingredients: Ingredient[];
  drops: DroppedItem[];
  fillAmount: number;
  isOver: boolean;
  isMixing: boolean;
  mixed: boolean;
}

export function Bowl({ ingredients, drops, fillAmount, isOver, isMixing, mixed }: BowlProps) {
  const fillPct = Math.min((fillAmount / BOWL_CAPACITY) * 100, 100);

  /**
   * Color model: Rice is the white base. Sauces are layered on top with
   * varying opacity (tinting strength). Transparent sauces like vinegar/fishsauce
   * barely tint. Bold sauces like gochujang/sesame oil tint heavily.
   *
   * Each sauce has: color, and "tint strength" (how opaque it is on the rice).
   * The final color = rice white, then each sauce blended on top proportionally.
   */
  const SAUCE_TINTS: Record<string, { color: string; color2: string; strength: number }> = {
    egg:       { color: "#FFB300", color2: "#FFCA28", strength: 0.7 },   // yolk - very visible
    gochujang: { color: "#C41E1E", color2: "#E53935", strength: 0.85 },  // bold red paste
    sesameOil: { color: "#C49A1A", color2: "#DAB02A", strength: 0.5 },   // golden oil sheen
    fishsauce: { color: "#8D6E63", color2: "#A1887F", strength: 0.15 },  // nearly transparent brown
    vinegar:   { color: "#C8E6C9", color2: "#E8F5E9", strength: 0.05 },  // basically transparent
  };

  const { mixedColor, mixedColor2 } = useMemo(() => {
    const counts = drops.reduce<Record<string, number>>((acc, d) => {
      acc[d.ingredientId] = (acc[d.ingredientId] || 0) + 1;
      return acc;
    }, {});

    const hasRice = (counts["rice"] || 0) > 0;
    // If rice present → white base; otherwise → empty bowl brown
    let r1 = hasRice ? 250 : 107, g1 = hasRice ? 248 : 91, b1 = hasRice ? 240 : 63;
    let r2 = hasRice ? 245 : 100, g2 = hasRice ? 242 : 85, b2 = hasRice ? 235 : 58;

    // Layer each sauce on top
    for (const [id, tint] of Object.entries(SAUCE_TINTS)) {
      const count = counts[id] || 0;
      if (count === 0) continue;
      // More drops = more tinting, diminishing returns via sqrt
      const alpha = Math.min(tint.strength * Math.sqrt(count) * 0.4, 0.9);
      const c1 = hexToRgb(tint.color);
      const c2 = hexToRgb(tint.color2);
      r1 = r1 * (1 - alpha) + c1.r * alpha;
      g1 = g1 * (1 - alpha) + c1.g * alpha;
      b1 = b1 * (1 - alpha) + c1.b * alpha;
      r2 = r2 * (1 - alpha) + c2.r * alpha;
      g2 = g2 * (1 - alpha) + c2.g * alpha;
      b2 = b2 * (1 - alpha) + c2.b * alpha;
    }

    return {
      mixedColor: `rgb(${Math.round(r1)},${Math.round(g1)},${Math.round(b1)})`,
      mixedColor2: `rgb(${Math.round(r2)},${Math.round(g2)},${Math.round(b2)})`,
    };
  }, [drops]);

  return (
    <div className={`relative transition-transform duration-300 ${isOver ? "scale-105" : ""} ${isMixing ? "animate-sizzle" : ""}`}>
      <svg viewBox="0 0 240 240" className="w-full max-w-[300px] mx-auto drop-shadow-lg">
        {/* Bowl rim */}
        <circle cx="120" cy="120" r="112" fill="#8B7B5E" />
        <circle cx="120" cy="120" r="106" fill="#7B6B4F" />
        {/* Bowl interior */}
        <circle cx="120" cy="120" r="98" fill="#6B5B3F" />

        {mixed ? (
          <MixedView mixedColor={mixedColor} mixedColor2={mixedColor2} drops={drops} ingredients={ingredients} />
        ) : (
          <UnmixedView drops={drops} ingredients={ingredients} />
        )}

        {/* Drop zone hint */}
        {isOver && (
          <circle cx="120" cy="120" r="100" fill="none" stroke="#D4462A"
            strokeWidth="3" strokeDasharray="8 5" opacity="0.6">
            <animate attributeName="stroke-dashoffset" values="0;26" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        <circle cx="120" cy="120" r="112" fill="none" stroke="#9B8B6E" strokeWidth="0.8" opacity="0.4" />
      </svg>

      {/* Capacity bar — below bowl, hidden when mixed */}
      {!mixed && (
        <div className="mx-auto mt-2 w-3/4 max-w-[240px]">
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${fillPct}%`,
                backgroundColor: fillPct > 90 ? "#E53935" : fillPct > 70 ? "#FF9800" : "#4CAF50",
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

/** Render each dropped item at its drop position */
function UnmixedView({ drops, ingredients }: { drops: DroppedItem[]; ingredients: Ingredient[] }) {
  return (
    <g>
      {drops.map((drop, i) => {
        const ing = ingredients.find((ig) => ig.id === drop.ingredientId);
        if (!ing) return null;
        // Convert 0~1 relative coords to SVG coords within the bowl circle (r=90, center=120)
        const cx = 30 + drop.x * 180;
        const cy = 30 + drop.y * 180;

        return (
          <g key={i}>
            <IngredientDrop id={ing.id} cx={cx} cy={cy} index={i} />
          </g>
        );
      })}
    </g>
  );
}

/** s = scale factor so drop visuals match drag ghost size */
const S = 1.8;

function IngredientDrop({ id, cx, cy, index }: { id: string; cx: number; cy: number; index: number }) {
  const rot = (index * 37) % 360;
  switch (id) {
    case "rice":
      return (
        <g>
          <circle cx={cx} cy={cy} r={33*S} fill="#FEFEFE" />
          {Array.from({ length: 35 }, (_, i) => {
            const angle = rand(i * 5 + index * 100) * Math.PI * 2;
            const dist = Math.sqrt(rand(i * 5 + index * 100 + 1)) * 28 * S;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const rot = rand(i * 5 + index * 100 + 2) * 180;
            const sz = (3.5 + rand(i * 5 + index * 100 + 3) * 2) * S;
            return (
              <ellipse key={i} cx={cx+dx} cy={cy+dy} rx={sz} ry={sz*0.38}
                fill={rand(i * 5 + index * 100 + 4) > 0.5 ? "#F0EDE5" : "#E8E4D8"}
                transform={`rotate(${rot} ${cx+dx} ${cy+dy})`} />
            );
          })}
        </g>
      );
    case "bomdong":
      return (
        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={27*S} ry={21*S} fill="#6DBE45" />
          <ellipse cx={cx-3*S} cy={cy-3*S} rx={18*S} ry={15*S} fill="#8DC63F" />
          <ellipse cx={cx} cy={cy-4*S} rx={10*S} ry={9*S} fill="#C5E17A" opacity="0.7" />
          <path d={`M${cx} ${cy-18*S} Q${cx-S} ${cy} ${cx} ${cy+15*S}`} stroke="#3A7D32" strokeWidth={0.6*S} fill="none" opacity="0.3" />
        </g>
      );
    case "gochugaru":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={15*S} ry={12*S} fill="#E64A19" opacity="0.7" transform={`rotate(${rot} ${cx} ${cy})`} />
          {[[-5,-3],[3,-5],[6,2],[-3,5],[0,0],[-6,1],[5,-2]].map(([dx,dy],i) => (
            <circle key={i} cx={cx+dx*S} cy={cy+dy*S} r={(1.2+i%2*0.6)*S} fill="#BF360C" opacity="0.6" />
          ))}
        </g>
      );
    case "gochujang":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={16*S} ry={13*S} fill="#C41E1E" opacity="0.8" transform={`rotate(${rot} ${cx} ${cy})`} />
          <ellipse cx={cx-3*S} cy={cy-2*S} rx={9*S} ry={6*S} fill="#E53935" opacity="0.4" transform={`rotate(${rot+15} ${cx-3*S} ${cy-2*S})`} />
        </g>
      );
    case "egg":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={27*S} ry={22*S} fill="#FFFEF8" transform={`rotate(${rot} ${cx} ${cy})`} />
          <circle cx={cx} cy={cy-S} r={10*S} fill="#FFB300" />
          <circle cx={cx-3*S} cy={cy-4*S} r={3*S} fill="#FFCA28" opacity="0.5" />
        </g>
      );
    case "sesameOil":
      return (
        <g opacity="0.5">
          <ellipse cx={cx} cy={cy} rx={18*S} ry={15*S} fill="#C49A1A" opacity="0.3" transform={`rotate(${rot} ${cx} ${cy})`} />
          <path d={`M${cx-12*S} ${cy} Q${cx} ${cy-6*S} ${cx+12*S} ${cy}`} stroke="#C49A1A" strokeWidth={2*S} fill="none" strokeLinecap="round" />
        </g>
      );
    case "sesameSeeds":
      return (
        <g>
          {[[-6,-5,10],[0,-7,-15],[6,-3,20],[-5,3,-8],[5,5,5],[0,0,25],[-7,2,12],[7,-2,-10],[-3,6,18],[4,-6,-5]].map(([dx,dy,r],i) => (
            <ellipse key={i} cx={cx+dx*S} cy={cy+dy*S} rx={3*S} ry={1.5*S} fill="#F5E6B8" transform={`rotate(${r} ${cx+dx*S} ${cy+dy*S})`} />
          ))}
        </g>
      );
    case "fishsauce":
      return (
        <g opacity="0.4">
          <ellipse cx={cx} cy={cy} rx={12*S} ry={9*S} fill="#8D6E63" opacity="0.3" />
          <path d={`M${cx-8*S} ${cy} Q${cx} ${cy-5*S} ${cx+8*S} ${cy}`} stroke="#8D6E63" strokeWidth={2*S} fill="none" strokeLinecap="round" />
        </g>
      );
    case "vinegar":
      return (
        <g opacity="0.35">
          <ellipse cx={cx} cy={cy} rx={10*S} ry={8*S} fill="#A5D6A7" opacity="0.25" />
          <path d={`M${cx-6*S} ${cy} Q${cx} ${cy-3*S} ${cx+6*S} ${cy}`} stroke="#A5D6A7" strokeWidth={1.5*S} fill="none" strokeLinecap="round" />
        </g>
      );
    case "garlic":
      return (
        <g>
          {[[-5,-3],[2,-5],[5,0],[-2,4],[3,3],[-4,1],[4,-3],[0,5]].map(([dx,dy],i) => (
            <rect key={i} x={cx+dx*S-2*S} y={cy+dy*S-1.5*S} width={4.5*S} height={3.5*S} rx={1.2*S} fill="#F5EDD5" stroke="#DDD5C0" strokeWidth={0.3*S} />
          ))}
        </g>
      );
    default:
      return <circle cx={cx} cy={cy} r={8*S} fill="#999" />;
  }
}

/** Mixed: sauce colors as base gradient, 건더기 rendered on top */
function MixedView({
  mixedColor,
  mixedColor2,
  drops,
}: {
  mixedColor: string;
  mixedColor2: string;
  drops: DroppedItem[];
  ingredients: Ingredient[];
}) {
  const counts = drops.reduce<Record<string, number>>((acc, d) => {
    acc[d.ingredientId] = (acc[d.ingredientId] || 0) + 1;
    return acc;
  }, {});

  const riceCount = counts["rice"] || 0;
  const bomdongCount = counts["bomdong"] || 0;
  const eggCount = counts["egg"] || 0;
  const seedCount = counts["sesameSeeds"] || 0;
  const garlicCount = counts["garlic"] || 0;
  const gochugaluCount = counts["gochugaru"] || 0;

  return (
    <g>
      {/* Base sauce color */}
      <defs>
        <radialGradient id="mixGrad" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor={mixedColor2} />
          <stop offset="100%" stopColor={mixedColor} />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="96" fill="url(#mixGrad)" />

      {/* Rice grain texture underneath sauce — dense coverage */}
      {riceCount > 0 && (
        <g opacity={Math.min(0.2 + riceCount * 0.08, 0.6)}>
          {Array.from({ length: riceCount * 40 }, (_, i) => {
            const [x, y] = randInBowl(i * 3 + 900);
            const rot = rand(i * 3 + 901) * 180;
            const size = 3.5 + rand(i * 3 + 902) * 2.5;
            return (
              <ellipse key={`rg${i}`} cx={x} cy={y} rx={size} ry={size * 0.4} fill="#FFF"
                opacity={0.3 + rand(i * 3 + 903) * 0.3}
                transform={`rotate(${rot} ${x} ${y})`} />
            );
          })}
        </g>
      )}

      {/* Sauce swirl texture */}
      <g opacity="0.2">
        <path d="M70 110 Q90 95 120 110 Q150 125 170 110" stroke={mixedColor2} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M80 130 Q100 115 130 130 Q155 145 175 125" stroke={mixedColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M65 120 Q95 140 125 120 Q155 100 180 120" stroke={mixedColor2} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* ── 건더기: 고춧가루 flakes ── */}
      {gochugaluCount > 0 && (() => {
        const n = gochugaluCount * 4;
        return (
          <g>
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = randInBowl(i * 7 + 100);
              const rx = 6 + rand(i * 7 + 101) * 4;
              const ry = 3 + rand(i * 7 + 102) * 3;
              const rot = rand(i * 7 + 103) * 360 - 180;
              return (
                <g key={`gc${i}`}>
                  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#E64A19" transform={`rotate(${rot} ${x} ${y})`} />
                  <circle cx={x + (i % 2 ? 1.5 : -1.5)} cy={y} r={1.2} fill="#BF360C" opacity="0.6" />
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* ── 건더기: 봄동 pieces ── */}
      {bomdongCount > 0 && (() => {
        const n = bomdongCount * 3;
        return (
          <g>
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = randInBowl(i * 7 + 200);
              const rx = 10 + rand(i * 7 + 201) * 10;
              const ry = 7 + rand(i * 7 + 202) * 6;
              const rot = rand(i * 7 + 203) * 360 - 180;
              return (
                <g key={`b${i}`}>
                  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#6DBE45" transform={`rotate(${rot} ${x} ${y})`} />
                  <ellipse cx={x} cy={y} rx={rx * 0.65} ry={ry * 0.65} fill="#8DC63F" transform={`rotate(${rot} ${x} ${y})`} opacity="0.7" />
                  <line x1={x - rx * 0.5} y1={y} x2={x + rx * 0.5} y2={y}
                    stroke="#3A7D32" strokeWidth="0.4" opacity="0.3" transform={`rotate(${rot} ${x} ${y})`} />
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* ── 건더기: 계란 흰자 shreds ── */}
      {eggCount > 0 && (() => {
        const n = eggCount * 3;
        return (
          <g>
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = randInBowl(i * 7 + 300);
              const rx = 9 + rand(i * 7 + 301) * 7;
              const ry = 4 + rand(i * 7 + 302) * 4;
              const rot = rand(i * 7 + 303) * 360 - 180;
              return (
                <ellipse key={`ew${i}`} cx={x} cy={y} rx={rx} ry={ry} fill="#FFFEF8"
                  transform={`rotate(${rot} ${x} ${y})`} stroke="#F0EAD6" strokeWidth="0.3" />
              );
            })}
          </g>
        );
      })()}

      {/* ── 건더기: 마늘 bits ── */}
      {garlicCount > 0 && (() => {
        const n = garlicCount * 4;
        return (
          <g>
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = randInBowl(i * 7 + 400);
              const rot = rand(i * 7 + 401) * 360;
              return (
                <rect key={`g${i}`} x={x - 2.5} y={y - 2} width="5" height="4" rx="1.5"
                  fill="#F5EDD5" stroke="#DDD5C0" strokeWidth="0.3"
                  transform={`rotate(${rot} ${x} ${y})`} />
              );
            })}
          </g>
        );
      })()}

      {/* ── 건더기: 깨소금 scattered ── */}
      {seedCount > 0 && (() => {
        const n = seedCount * 5;
        return (
          <g>
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = randInBowl(i * 7 + 500);
              const rot = rand(i * 7 + 501) * 360 - 180;
              return (
                <ellipse key={`s${i}`} cx={x} cy={y} rx="3" ry="1.5" fill="#F5E6B8"
                  transform={`rotate(${rot} ${x} ${y})`} />
              );
            })}
          </g>
        );
      })()}

      {/* Steam — only if rice is present (warm) */}
      {riceCount > 0 && (
        <g opacity={Math.min(riceCount * 0.06, 0.2)} className="animate-steam">
          <path d="M100 88 Q102 74 98 62" stroke="#999" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M120 83 Q122 69 118 57" stroke="#999" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M140 88 Q142 74 138 62" stroke="#999" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/** Deterministic hash-based random 0~1 (identical on server & client) */
function rand(seed: number): number {
  return ((seed * 2654435761) >>> 0) / 4294967296;
}

/** Random point inside the bowl circle (center 120, radius ~75) */
function randInBowl(seed: number): [number, number] {
  const angle = rand(seed) * Math.PI * 2;
  const r = Math.sqrt(rand(seed + 1)) * 75;
  return [120 + Math.cos(angle) * r, 120 + Math.sin(angle) * r];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}
