"use client";

import React, { useEffect, useRef } from "react";
import { audioEngine } from "@/lib/audioEngine";
import { usePlayerStore } from "@/store/usePlayerStore";

interface SpectrumVisualizerProps {
  barCount?: number;
  height?: number;
  className?: string;
  variant?: "mini" | "standard" | "large";
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  barCount = 24,
  height = 36,
  className = "",
  variant = "standard",
}) => {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const freqData = audioEngine.getFrequencyData();
      const step = Math.floor(freqData.length / barCount) || 1;
      const barWidth = Math.max(2, (canvas.width / barCount) - 2.5);

      for (let i = 0; i < barCount; i++) {
        let val = 0;
        if (isPlaying) {
          val = freqData[i * step] || 0;
          // Normalize to 0..1
          val = Math.pow(val / 255, 1.2);
        } else {
          // Idle breathing wave
          val = 0.08 + 0.05 * Math.sin(phase + (i * 0.4));
        }

        const barHeight = Math.max(3, val * (canvas.height - 4));
        const x = i * (barWidth + 2.5);
        const y = canvas.height - barHeight;

        // Monochrome white / silver gradient
        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.35)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      phase += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, barCount]);

  const width = barCount * (variant === "mini" ? 5 : 8);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`inline-block select-none ${className}`}
      aria-hidden="true"
    />
  );
};
