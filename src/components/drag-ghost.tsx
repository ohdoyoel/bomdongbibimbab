"use client";

import React from "react";
import type { Ingredient } from "@/lib/cooking-steps";

interface DragGhostProps {
  ingredient: Ingredient | null;
  position: { x: number; y: number } | null;
  bowlPx?: number;
}

export function DragGhost({ ingredient, position, bowlPx = 300 }: DragGhostProps) {
  if (!ingredient || !position) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x - bowlPx / 2,
        top: position.y - bowlPx / 2,
        width: bowlPx,
        height: bowlPx,
        opacity: 0.9,
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
      }}
    >
      <svg viewBox="0 0 240 240" className="w-full h-full">
        <DropPreview id={ingredient.id} />
      </svg>
    </div>
  );
}

function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Same visuals as IngredientDrop in bowl.tsx, centered at 120,120 (bowl center) */
function DropPreview({ id }: { id: string }) {
  const cx = 120, cy = 120;
  const S = 1.8;
  switch (id) {
    case "rice":
      return (
        <g>
          <circle cx={cx} cy={cy} r={33*S} fill="#FEFEFE" />
          {Array.from({ length: 35 }, (_, i) => {
            const angle = rand(i * 5 + 50) * Math.PI * 2;
            const dist = Math.sqrt(rand(i * 5 + 51)) * 28 * S;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const rot = rand(i * 5 + 52) * 180;
            const sz = (3.5 + rand(i * 5 + 53) * 2) * S;
            return (
              <ellipse key={i} cx={cx+dx} cy={cy+dy} rx={sz} ry={sz*0.38}
                fill={rand(i * 5 + 54) > 0.5 ? "#F0EDE5" : "#E8E4D8"}
                transform={`rotate(${rot} ${cx+dx} ${cy+dy})`} />
            );
          })}
        </g>
      );
    case "bomdong":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={27*S} ry={21*S} fill="#6DBE45" />
          <ellipse cx={cx-3*S} cy={cy-3*S} rx={18*S} ry={15*S} fill="#8DC63F" />
          <ellipse cx={cx} cy={cy-4*S} rx={10*S} ry={9*S} fill="#C5E17A" opacity="0.7" />
          <path d={`M${cx} ${cy-18*S} Q${cx-S} ${cy} ${cx} ${cy+15*S}`} stroke="#3A7D32" strokeWidth={0.6*S} fill="none" opacity="0.3" />
        </g>
      );
    case "gochugaru":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={15*S} ry={12*S} fill="#E64A19" opacity="0.7" />
          {[[-5,-3],[3,-5],[6,2],[-3,5],[0,0]].map(([dx,dy],i) => (
            <circle key={i} cx={cx+dx*S} cy={cy+dy*S} r={(1.2+i%2*0.6)*S} fill="#BF360C" opacity="0.6" />
          ))}
        </g>
      );
    case "gochujang":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={16*S} ry={13*S} fill="#C41E1E" opacity="0.8" />
          <ellipse cx={cx-3*S} cy={cy-2*S} rx={9*S} ry={6*S} fill="#E53935" opacity="0.4" />
        </g>
      );
    case "egg":
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={27*S} ry={22*S} fill="#FFFEF8" />
          <circle cx={cx} cy={cy-S} r={10*S} fill="#FFB300" />
          <circle cx={cx-3*S} cy={cy-4*S} r={3*S} fill="#FFCA28" opacity="0.5" />
        </g>
      );
    case "sesameOil":
      return (
        <g opacity="0.6">
          <ellipse cx={cx} cy={cy} rx={18*S} ry={15*S} fill="#C49A1A" opacity="0.3" />
          <path d={`M${cx-12*S} ${cy} Q${cx} ${cy-6*S} ${cx+12*S} ${cy}`} stroke="#C49A1A" strokeWidth={2*S} fill="none" strokeLinecap="round" />
        </g>
      );
    case "sesameSeeds":
      return (
        <g>
          {[[-6,-5,10],[0,-7,-15],[6,-3,20],[-5,3,-8],[5,5,5],[0,0,25],[-7,2,12],[7,-2,-10]].map(([dx,dy,r],i) => (
            <ellipse key={i} cx={cx+dx*S} cy={cy+dy*S} rx={3*S} ry={1.5*S} fill="#F5E6B8" transform={`rotate(${r} ${cx+dx*S} ${cy+dy*S})`} />
          ))}
        </g>
      );
    case "fishsauce":
      return (
        <g opacity="0.5">
          <ellipse cx={cx} cy={cy} rx={12*S} ry={9*S} fill="#8D6E63" opacity="0.3" />
          <path d={`M${cx-8*S} ${cy} Q${cx} ${cy-5*S} ${cx+8*S} ${cy}`} stroke="#8D6E63" strokeWidth={2*S} fill="none" strokeLinecap="round" />
        </g>
      );
    case "vinegar":
      return (
        <g opacity="0.45">
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
