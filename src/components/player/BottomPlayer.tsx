"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Maximize2,
  ListMusic,
  Mic2,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import WakeSlider from "@/components/react-bits/WakeSlider";
import { ProgressScrubber } from "./ProgressScrubber";
import { MarqueeText } from "./MarqueeText";
import { getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const BottomPlayer: React.FC = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const favorites = usePlayerStore((s) => s.favorites);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const setIsExpandedPlayer = usePlayerStore((s) => s.setIsExpandedPlayer);
  const setIsLyricsModalOpen = usePlayerStore((s) => s.setIsLyricsModalOpen);
  const openLyricsModal = usePlayerStore((s) => s.openLyricsModal);
  const openFullscreenModal = usePlayerStore((s) => s.openFullscreenModal);
  const setActiveView = usePlayerStore((s) => s.setActiveView);
  const language = usePlayerStore((s) => s.language);
  const t = getTranslation(language);

  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        volumeContainerRef.current &&
        !volumeContainerRef.current.contains(e.target as Node)
      ) {
        setIsVolumeOpen(false);
      }
    };

    if (isVolumeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVolumeOpen]);

  if (!currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);
  const volumePercent = Math.round((isMuted ? 0 : volume) * 100);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* 1. MOBILE FLOATING MINI-PLAYER PILL (Above navigation dock, matching Reference 4) */}
      <div className="md:hidden fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto pointer-events-auto">
        <div
          onClick={() => setIsExpandedPlayer(true)}
          className="relative flex items-center justify-between gap-3 p-2 rounded-2xl matte-glass backdrop-blur-[48px] border border-border shadow-2xl cursor-pointer overflow-hidden group select-none"
        >
          {/* Cover Art */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track info with smooth horizontal marquee ticker */}
          <div className="flex flex-col min-w-0 flex-1 justify-center">
            <MarqueeText
              text={currentTrack.title}
              className="text-xs font-medium text-foreground tracking-tight"
            />
            <span className="text-[11px] text-muted-foreground truncate">
              {currentTrack.artist}
            </span>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1 pr-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openLyricsModal();
              }}
              aria-label="Synced Lyrics"
              title="Synced Lyrics"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentTrack.id);
              }}
              aria-label="Toggle Favorite"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isFav
                    ? "fill-current text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Subtle bottom progress bar */}
          <div className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. DESKTOP FULL FOOTER PLAYER */}
      <footer className="hidden md:block fixed bottom-0 left-0 right-0 z-40 matte-glass backdrop-blur-[48px] !rounded-none !border-x-0 !border-b-0 border-t border-border px-4 sm:px-8 py-3.5 select-none font-normal transition-colors">
        <div className="relative w-full max-w-7xl mx-auto flex items-center justify-between min-h-[56px]">
          {/* Left: Track Info & Favorite */}
          <div className="flex items-center gap-3.5 min-w-[200px] max-w-[280px] sm:max-w-[340px] z-10">
            <button
              onClick={() => setIsExpandedPlayer(true)}
              className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 group focus:outline-none cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </button>

            <div className="flex flex-col min-w-0">
              <button
                onClick={() => setIsExpandedPlayer(true)}
                className="text-base text-foreground text-left hover:underline focus:outline-none font-normal cursor-pointer tracking-tight"
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 400,
                }}
              >
                <MarqueeText text={currentTrack.title} />
              </button>
              <p
                className="text-xs text-muted-foreground truncate font-normal"
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 400,
                }}
              >
                {currentTrack.artist}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              title={isFav ? "Remove from Favorites" : "Save to Favorites"}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-colors ml-1 focus:outline-none cursor-pointer"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isFav
                    ? "fill-current text-current scale-110"
                    : "text-muted-foreground hover:text-foreground"
                )}
              />
            </button>
          </div>

          {/* Center: Exactly Centered Controls & Scrubber */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg lg:max-w-xl flex flex-col items-center justify-center gap-1.5 pointer-events-auto">
            {/* Main Playback Buttons */}
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {/* Shuffle (Turns from gray to black in light theme, and gray to white in dark theme) */}
              <button
                onClick={toggleShuffle}
                title={`Shuffle ${shuffle ? "On" : "Off"}`}
                className={cn(
                  "p-1.5 rounded-full transition-colors focus:outline-none cursor-pointer",
                  shuffle
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={prevTrack}
                title="Previous Track"
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Play / Pause */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={togglePlay}
                title={isPlaying ? "Pause" : "Play"}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-none focus:outline-none cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </motion.button>

              {/* Next */}
              <button
                onClick={nextTrack}
                title="Next Track"
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Repeat Mode (Turns from gray to black in light theme, and gray to white in dark theme) */}
              <button
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
                className={cn(
                  "p-1.5 rounded-full transition-colors focus:outline-none cursor-pointer",
                  repeatMode !== "off"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4 text-foreground" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Time Scrubber (Centered with continuous dragging & elastic animation) */}
            <div className="w-full flex items-center justify-center gap-3">
              <span className="text-[11px] tabular-nums text-muted-foreground w-10 text-right select-none font-normal">
                {formatTime(currentTime)}
              </span>

              <ProgressScrubber
                currentTime={currentTime}
                duration={duration}
                onSeek={seekTo}
              />

              <span className="text-[11px] tabular-nums text-muted-foreground w-10 text-left select-none font-normal">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Master Volume & Secondary Controls */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Popover Container for WakeSlider Volume */}
            <div className="relative" ref={volumeContainerRef}>
              <button
                onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                title={`Volume: ${volumePercent}%`}
                className={cn(
                  "p-2 rounded-full transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer",
                  isVolumeOpen
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.08]"
                )}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Volume Popover Panel */}
              <AnimatePresence>
                {isVolumeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute bottom-12 right-0 matte-glass backdrop-blur-[36px] rounded-2xl border border-border p-4 shadow-2xl flex flex-col items-center gap-3 w-56 z-50 pointer-events-auto"
                  >
                    <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-normal">{t.masterVolume}</span>
                      <button
                        onClick={toggleMute}
                        className="hover:text-foreground transition-colors text-[11px] underline cursor-pointer"
                      >
                        {isMuted ? t.unmute : t.mute}
                      </button>
                    </div>

                    <div className="w-full flex items-center justify-center py-1">
                      <WakeSlider
                        value={volumePercent}
                        defaultValue={volumePercent}
                        min={0}
                        max={100}
                        step={1}
                        bars={18}
                        height={40}
                        restHeight={10}
                        gap={3}
                        sensitivity={1}
                        reach={4}
                        skew={0.6}
                        glide={0.3}
                        smoothing={100}
                        showValue={true}
                        onChange={(val) => {
                          setVolume(val / 100);
                        }}
                        disabled={false}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Lyrics View Switcher */}
            <button
              onClick={() => openLyricsModal()}
              title="Open Synced Lyrics"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors focus:outline-none cursor-pointer"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            {/* Expand / Focus Canvas */}
            <button
              onClick={() => openFullscreenModal()}
              title="Focus Mode"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors focus:outline-none cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
