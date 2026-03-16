"use client";

import React, { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas-pro";

interface ShareCardProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ShareCard({ onClose, children }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setIsGenerating(true);
    try {
      const rect = cardRef.current.getBoundingClientRect();
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#D7B98E",
        scale: 3,
        useCORS: true,
        logging: false,
        width: rect.width,
        height: rect.height,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      });
    } catch {
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;
    const file = new File([blob], "bomdong-bibimbap.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "봄동비빔밥 완성!", text: "내가 만든 봄동비빔밥", files: [file] });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        if ((err as Error).name !== "AbortError") downloadImage(blob);
      }
    } else {
      downloadImage(blob);
    }
  }, [generateImage]);

  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (blob) downloadImage(blob);
  }, [generateImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative bg-[#D7B98E] overflow-hidden shadow-2xl animate-fadeInUp flex flex-col rounded-3xl"
        style={{ maxHeight: "95dvh", width: "min(100vw, 420px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Captured content — mirrors done screen exactly */}
        <div
          ref={cardRef}
          className="wood-bg flex flex-col items-center px-6 py-8 overflow-auto"
          style={{ aspectRatio: "9/16", width: "100%" }}
        >
          {children}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-4 bg-[#C4A47A]">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 bg-[#D4462A] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {isGenerating ? "이미지 생성 중..." : shareSuccess ? "공유 완료!" : "공유하기"}
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 bg-black/10 text-[#2D1B0E] font-bold rounded-xl hover:bg-black/15 transition-colors disabled:opacity-50 text-sm"
          >
            {isGenerating ? "..." : "저장하기"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#2D1B0E]/60 hover:bg-white transition-colors text-lg"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function downloadImage(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bomdong-bibimbap.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
