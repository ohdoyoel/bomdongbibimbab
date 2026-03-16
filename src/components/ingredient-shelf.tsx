"use client";

import React, { useCallback } from "react";
import type { Ingredient } from "@/lib/cooking-steps";
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

interface IngredientShelfProps {
  ingredients: Ingredient[];
  dropCounts: Record<string, number>;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

export function IngredientShelf({ ingredients, dropCounts, onDragStart, onDragEnd }: IngredientShelfProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-4 px-4 min-w-max">
        {ingredients.map((ingredient) => (
          <IngredientItem
            key={ingredient.id}
            ingredient={ingredient}
            count={dropCounts[ingredient.id] || 0}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

function IngredientItem({
  ingredient,
  count,
  onDragStart,
  onDragEnd,
}: {
  ingredient: Ingredient;
  count: number;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      onDragStart(ingredient.id);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [ingredient.id, onDragStart]
  );

  const handlePointerUp = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  const SvgIcon = SVG_MAP[ingredient.id];

  return (
    <div
      data-testid={`ingredient-${ingredient.id}`}
      className="flex flex-col items-center gap-0.5 select-none"
    >
      <div
        className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-md bg-white hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {SvgIcon && <SvgIcon className="w-16 h-16" />}
        {/* Count badge */}
        {count > 0 && (
          <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
            {count}
          </div>
        )}
      </div>
      <span className="text-[10px] text-foreground/60 font-medium whitespace-nowrap">
        {ingredient.name}
      </span>
      <span className="text-[9px] text-foreground/30">
        {ingredient.volume}%/회
      </span>
    </div>
  );
}
