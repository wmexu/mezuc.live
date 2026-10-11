"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ProgressScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  className?: string;
  showTooltip?: boolean;
}

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const ProgressScrubber: React.FC<ProgressScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  className,
  showTooltip = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  const calculatePercent = useCallback(
    (clientX: number) => {
      if (!containerRef.current || duration <= 0) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
      return ratio * 100;
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const pct = calculatePercent(e.clientX);
    setDragPercent(pct);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pct = calculatePercent(e.clientX);
    if (isDragging) {
      setDragPercent(pct);
    }
    setHoverPercent(pct);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const finalPct = dragPercent !== null ? dragPercent : calculatePercent(e.clientX);
      const targetSeconds = (finalPct / 100) * duration;
      onSeek(targetSeconds);
      setIsDragging(false);
      setDragPercent(null);
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragPercent(null);
    setHoverPercent(null);
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activePercent = isDragging && dragPercent !== null ? dragPercent : currentPercent;
  const displayTime =
    isDragging && dragPercent !== null
      ? (dragPercent / 100) * duration
      : hoverPercent !== null
      ? (hoverPercent / 100) * duration
      : currentTime;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={() => {
        if (!isDragging) setHoverPercent(null);
      }}
      className={cn(
        "relative flex-1 py-2 cursor-pointer select-none touch-none group flex items-center",
        className
      )}
    >
      {/* Floating Elastic Tooltip Bubble */}
      <AnimatePresence>
        {showTooltip && (isDragging || hoverPercent !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute text-[11px] tabular-nums font-normal px-2 py-0.5 rounded-full pointer-events-none -translate-x-1/2 z-30 shadow-md bg-black text-white dark:bg-white dark:text-black border border-white/10 dark:border-black/10"
            style={{
              left: `${isDragging && dragPercent !== null ? dragPercent : hoverPercent}%`,
            }}
          >
            {formatTime(displayTime)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrubber Track Bar with Elastic Expansion */}
      <div
        className={cn(
          "w-full rounded-full overflow-hidden transition-all duration-200 ease-out",
          // Elastic height expansion on hover or drag
          isDragging ? "h-2 sm:h-2.5" : "h-1 group-hover:h-2",
          // White theme: unplayed is white/light gray; Dark theme: unplayed is dark zinc
          "bg-zinc-200/90 dark:bg-zinc-800 border border-black/5 dark:border-transparent"
        )}
      >
        {/* Filled Already Played Bar */}
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-75",
            // White theme: played is black; Dark theme: played is white
            "bg-black dark:bg-white"
          )}
          style={{ width: `${Math.min(100, Math.max(0, activePercent))}%` }}
        />
      </div>

      {/* Elastic Draggable Thumb Handle */}
      <motion.div
        animate={{
          scale: isDragging ? 1.35 : hoverPercent !== null ? 1.15 : 0,
          opacity: isDragging || hoverPercent !== null ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 pointer-events-none z-20",
          // White theme: black thumb with shadow; Dark theme: white thumb with glow
          "bg-black shadow-[0_2px_8px_rgba(0,0,0,0.35)] dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.7)]"
        )}
        style={{ left: `${Math.min(100, Math.max(0, activePercent))}%` }}
      />
    </div>
  );
};
