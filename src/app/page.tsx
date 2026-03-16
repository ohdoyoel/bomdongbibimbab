"use client";

import React, { useState, useCallback } from "react";
import { INGREDIENTS, BOWL_CAPACITY, type Ingredient, type DroppedItem } from "@/lib/cooking-steps";
import { KitchenTable } from "@/components/kitchen-table";
import { Bowl } from "@/components/bowl";
import { ShareCard } from "@/components/share-card";
import { RiceSvg, BomdongSvg, GochugaluSvg, GochujangSvg, FishSauceSvg, VinegarSvg, GarlicSvg, SesameOilSvg, EggSvg, SesameSeedsSvg } from "@/components/svg-ingredients";
import { SnackbarProvider, Snackbar, SnackbarAvoidOverlap, useSnackbarAdapter } from "seed-design/ui/snackbar";

const SVG_MAP: Record<string, React.FC<{ className?: string }>> = {
  rice: RiceSvg, bomdong: BomdongSvg, gochugaru: GochugaluSvg,
  gochujang: GochujangSvg, fishsauce: FishSauceSvg, vinegar: VinegarSvg,
  garlic: GarlicSvg, sesameOil: SesameOilSvg, egg: EggSvg, sesameSeeds: SesameSeedsSvg,
};

export default function Home() {
  return (
    <SnackbarProvider>
      <HomeInner />
    </SnackbarProvider>
  );
}

type Phase = "cooking" | "mixing" | "done";

function HomeInner() {
  const [phase, setPhase] = useState<Phase>("cooking");
  const [ingredients] = useState<Ingredient[]>(() => INGREDIENTS.map((i) => ({ ...i })));
  const [drops, setDrops] = useState<DroppedItem[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixed, setMixed] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const adapter = useSnackbarAdapter();

  const fillAmount = drops.reduce((sum, d) => {
    const ing = ingredients.find((i) => i.id === d.ingredientId);
    return sum + (ing?.volume || 0);
  }, 0);

  const dropCounts = drops.reduce<Record<string, number>>((acc, d) => {
    acc[d.ingredientId] = (acc[d.ingredientId] || 0) + 1;
    return acc;
  }, {});

  const handleDrop = useCallback((ingredientId: string, relX: number, relY: number) => {
    setDrops((prev) => [...prev, { ingredientId, x: relX, y: relY }]);
    const ing = INGREDIENTS.find((i) => i.id === ingredientId);
    if (ing) {
      adapter.dismiss();
      setTimeout(() => {
        adapter.create({
          timeout: 1500,
          render: () => <Snackbar message={`${ing.name} 추가!`} />,
        });
      }, 50);
    }
  }, [adapter]);

  const handleOverflow = useCallback(() => {
    adapter.dismiss();
    setTimeout(() => {
      adapter.create({
        timeout: 2000,
        render: () => <Snackbar message="그릇이 가득 찼어요!" variant="critical" />,
      });
    }, 50);
  }, [adapter]);

  const handleMix = useCallback(() => {
    setIsMixing(true);
    setPhase("mixing");
    setTimeout(() => {
      setMixed(true);
      setIsMixing(false);
      setTimeout(() => setPhase("done"), 800);
    }, 2000);
  }, []);

  const handleRestart = useCallback(() => {
    setPhase("cooking");
    setDrops([]);
    setMixed(false);
    setIsMixing(false);
  }, []);

  // ─── Done ─────────────────────────────────
  if (phase === "done") {
    return (
      <div className="min-h-dvh wood-bg flex flex-col items-center px-6 py-8">
        <div className="text-center animate-fadeInUp flex-1 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold text-foreground/80 mb-4">봄동비빔밥 만들기</h2>
          <div className="relative mb-4 w-full max-w-[280px]">
            <Bowl ingredients={ingredients} drops={drops} fillAmount={fillAmount} isOver={false} isMixing={false} mixed={true} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">완성!</h1>
          <p className="text-lg text-foreground/60 mb-3">나만의 봄동비빔밥이 완성되었어요!</p>
          {/* Recipe summary with SVG icons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-[320px]">
            {Object.entries(dropCounts).map(([id, count]) => {
              const ing = ingredients.find((i) => i.id === id);
              const SvgIcon = SVG_MAP[id];
              if (!ing || !SvgIcon) return null;
              return (
                <div key={id} className="flex items-center gap-1 bg-white/60 rounded-full pl-1 pr-2.5 py-1">
                  <SvgIcon className="w-7 h-7" />
                  <span className="text-xs font-medium text-foreground/70">x{count}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <button
              onClick={() => setShowShare(true)}
              className="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              공유하기
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-4 bg-foreground/10 text-foreground font-bold text-base rounded-2xl hover:bg-foreground/15 transition-colors active:scale-95"
            >
              다시 만들기
            </button>
          </div>
          <a
            href="https://github.com/ohdoyoel/bomdongbibimbab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-foreground/25 hover:text-foreground/50 transition-colors mt-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="text-[11px] font-medium">ohdoyoel</span>
          </a>
        </div>
        {showShare && (
          <ShareCard onClose={() => setShowShare(false)}>
            <div className="text-center flex-1 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-foreground/80 mb-4">봄동비빔밥 만들기</h2>
              <div className="relative mb-4 w-full max-w-[280px]">
                <Bowl ingredients={ingredients} drops={drops} fillAmount={fillAmount} isOver={false} isMixing={false} mixed={true} />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">완성!</h1>
              <p className="text-lg text-foreground/60 mb-3">나만의 봄동비빔밥이 완성되었어요!</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
                {Object.entries(dropCounts).map(([id, count]) => {
                  const ing = ingredients.find((i) => i.id === id);
                  const SvgIcon = SVG_MAP[id];
                  if (!ing || !SvgIcon) return null;
                  return (
                    <div key={id} className="flex items-center gap-1 bg-white/60 rounded-full pl-1 pr-2.5 py-1">
                      <SvgIcon className="w-7 h-7" />
                      <span className="text-xs font-medium text-foreground/70">x{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ShareCard>
        )}
      </div>
    );
  }

  // ─── Cooking / Mixing ─────────────────────
  const isFull = fillAmount >= BOWL_CAPACITY;

  return (
    <div className="min-h-dvh wood-bg flex flex-col">
      <header className="px-4 pt-4 pb-1 text-center">
        <h1 className="text-4xl font-bold text-foreground/80">봄동비빔밥 만들기</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 overflow-visible">
        <KitchenTable
          ingredients={ingredients}
          drops={drops}
          fillAmount={fillAmount}
          isMixing={isMixing}
          mixed={mixed}
          onDrop={handleDrop}
          onOverflow={handleOverflow}
        />
      </div>

      <SnackbarAvoidOverlap>
        <div className="px-6 pb-6 pt-2 h-[72px] max-w-[640px] mx-auto w-full">
          {phase === "mixing" ? null : (
            <button
              onClick={handleMix}
              disabled={drops.length === 0}
              className={`w-full py-4 font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-95 ${
                drops.length > 0
                  ? "bg-primary text-white hover:shadow-xl"
                  : "bg-foreground/10 text-foreground/30 cursor-not-allowed shadow-none"
              }`}
            >
              쓱쓱 비비기!
            </button>
          )}
        </div>
      </SnackbarAvoidOverlap>

      <a
        href="https://github.com/ohdoyoel/bomdongbibimbab"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 flex items-center gap-1.5 text-foreground/25 hover:text-foreground/50 transition-colors z-20 hidden md:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span className="text-[11px] font-medium">ohdoyoel</span>
      </a>
    </div>
  );
}
