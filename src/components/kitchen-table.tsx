"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import type { Ingredient, DroppedItem } from "@/lib/cooking-steps";
import { INGREDIENTS, BOWL_CAPACITY } from "@/lib/cooking-steps";
import { Bowl } from "@/components/bowl";
import { DragGhost } from "@/components/drag-ghost";
import {
  RiceSvg, BomdongSvg, GochugaluSvg, GochujangSvg,
  FishSauceSvg, VinegarSvg, GarlicSvg, SesameOilSvg,
  EggSvg, SesameSeedsSvg,
} from "./svg-ingredients";

const SVG_MAP: Record<string, React.FC<{ className?: string }>> = {
  rice: RiceSvg, bomdong: BomdongSvg, gochugaru: GochugaluSvg,
  gochujang: GochujangSvg, fishsauce: FishSauceSvg, vinegar: VinegarSvg,
  garlic: GarlicSvg, sesameOil: SesameOilSvg, egg: EggSvg, sesameSeeds: SesameSeedsSvg,
};

/**
 * Base positions of each ingredient on the table (% from top-left).
 * Each gets a seeded random offset + rotation for a natural scattered look.
 */
const TABLE_BASE: { id: string; left: number; top: number; size: number }[] = [
  // top row — 3 items spread across top, no overlap
  { id: "rice",        left: -15, top: -15, size: 38 },
  { id: "bomdong",     left: 28,  top: -18, size: 40 },
  { id: "egg",         left: 68,  top: -14, size: 34 },
  // left column — 2 items stacked, no overlap with each other or bowl
  { id: "gochugaru",   left: -14, top: 22,  size: 34 },
  { id: "garlic",      left: -12, top: 62,  size: 32 },
  // right column — 2 items stacked
  { id: "gochujang",   left: 78,  top: 22,  size: 34 },
  { id: "sesameOil",   left: 80,  top: 60,  size: 30 },
  // bottom row — 3 items spread across bottom
  { id: "vinegar",     left: -10, top: 82,  size: 30 },
  { id: "fishsauce",   left: 30,  top: 84,  size: 30 },
  { id: "sesameSeeds", left: 68,  top: 82,  size: 32 },
];

/** Static default positions (used for SSR, no randomness) */
function staticPositions() {
  return Object.fromEntries(
    TABLE_BASE.map((item) => [
      item.id,
      { left: `${item.left}%`, top: `${item.top}%`, size: `${item.size}%`, rotate: "0deg" },
    ])
  );
}

/** Random positions generated client-side only */
function randomPositions() {
  return Object.fromEntries(
    TABLE_BASE.map((item) => {
      const offX = (Math.random() - 0.5) * 4;
      const offY = (Math.random() - 0.5) * 4;
      const rot = (Math.random() - 0.5) * 30;
      return [
        item.id,
        { left: `${item.left + offX}%`, top: `${item.top + offY}%`, size: `${item.size}%`, rotate: `${rot.toFixed(1)}deg` },
      ];
    })
  );
}


interface KitchenTableProps {
  ingredients: Ingredient[];
  drops: DroppedItem[];
  fillAmount: number;
  isMixing: boolean;
  mixed: boolean;
  onDrop: (ingredientId: string, relX: number, relY: number) => void;
  onOverflow?: () => void;
}

export function KitchenTable({
  ingredients,
  drops,
  fillAmount,
  isMixing,
  mixed,
  onDrop,
  onOverflow,
}: KitchenTableProps) {
  const [tablePositions, setTablePositions] = useState(staticPositions);
  useEffect(() => { setTablePositions(randomPositions()); }, []);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isOverBowl, setIsOverBowl] = useState(false);
  const bowlRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const getBowlPx = useCallback(() => {
    if (!bowlRef.current) return 300;
    return bowlRef.current.getBoundingClientRect().width;
  }, []);

  const isFull = fillAmount >= BOWL_CAPACITY;

  const checkOverBowl = useCallback((x: number, y: number) => {
    if (!bowlRef.current) return false;
    const rect = bowlRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const r = rect.width / 2 + 15;
    return Math.hypot(x - cx, y - cy) < r;
  }, []);

  const toBowlRelative = useCallback((clientX: number, clientY: number) => {
    if (!bowlRef.current) return { x: 0.5, y: 0.5 };
    const rect = bowlRef.current.getBoundingClientRect();
    return {
      x: Math.max(0.12, Math.min(0.88, (clientX - rect.left) / rect.width)),
      y: Math.max(0.12, Math.min(0.88, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsOverBowl(checkOverBowl(e.clientX, e.clientY));
  }, [draggingId, checkOverBowl]);

  const handlePointerUp = useCallback(() => {
    if (draggingId && isOverBowl && dragPos) {
      const ing = INGREDIENTS.find((i) => i.id === draggingId);
      if (ing && fillAmount + ing.volume <= BOWL_CAPACITY) {
        const rel = toBowlRelative(dragPos.x, dragPos.y);
        onDrop(draggingId, rel.x, rel.y);
      } else if (ing) {
        onOverflow?.();
      }
    }
    setDraggingId(null);
    setDragPos(null);
    setIsOverBowl(false);
  }, [draggingId, isOverBowl, dragPos, fillAmount, onDrop, onOverflow, toBowlRelative]);

  const handleIngredientPointerDown = useCallback((id: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingId(id);
    setDragPos({ x: e.clientX, y: e.clientY });
  }, []);

  const draggingIngredient = draggingId ? ingredients.find((i) => i.id === draggingId) || null : null;

  const dropCounts = drops.reduce<Record<string, number>>((acc, d) => {
    acc[d.ingredientId] = (acc[d.ingredientId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      ref={sceneRef}
      className="relative w-full aspect-square max-w-[500px] mx-auto select-none touch-none overflow-visible"
      style={{ fontSize: "clamp(8px, 2vw, 16px)" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Ingredients placed around table */}
      {ingredients.map((ing) => {
        const pos = tablePositions[ing.id];
        const SvgIcon = SVG_MAP[ing.id];
        if (!pos || !SvgIcon) return null;
        const count = dropCounts[ing.id] || 0;

        return (
          <div
            key={ing.id}
            data-testid={`ingredient-${ing.id}`}
            className="absolute cursor-grab active:cursor-grabbing z-10 transition-transform hover:scale-105 active:scale-95"
            style={{ left: pos.left, top: pos.top, width: pos.size, height: pos.size, transform: `rotate(${pos.rotate})` }}
            onPointerDown={(e) => handleIngredientPointerDown(ing.id, e)}
          >
            <SvgIcon className="w-full h-full drop-shadow-md" />
          </div>
        );
      })}

      {/* Bowl in center */}
      <div
        ref={bowlRef}
        data-testid="bowl-area"
        className="absolute"
        style={{ left: "18%", top: "20%", width: "64%", height: "64%" }}
      >
        <Bowl
          ingredients={ingredients}
          drops={drops}
          fillAmount={fillAmount}
          isOver={isOverBowl && !isFull}
          isMixing={isMixing}
          mixed={mixed}
        />
      </div>

      {/* Drag ghost — same scale as bowl */}
      {draggingIngredient && dragPos && (
        <DragGhost
          ingredient={draggingIngredient}
          position={dragPos}
          bowlPx={getBowlPx()}
        />
      )}
    </div>
  );
}
