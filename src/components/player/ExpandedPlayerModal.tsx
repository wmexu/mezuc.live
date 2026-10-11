"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Mic2,
  ArrowLeft,
  Compass,
  Loader2,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import WakeSlider from "@/components/react-bits/WakeSlider";
import JellyRadio from "@/components/react-bits/JellyRadio";
import { ProgressScrubber } from "./ProgressScrubber";
import { MarqueeText } from "./MarqueeText";
import { AudioQuality } from "@/types/player";
import { getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface LyricLine {
  time: number;
  text: string;
}

export const ExpandedPlayerModal: React.FC = () => {
  const isExpandedPlayer = usePlayerStore((s) => s.isExpandedPlayer);
  const setIsExpandedPlayer = usePlayerStore((s) => s.setIsExpandedPlayer);
  const isLyricsModalOpen = usePlayerStore((s) => s.isLyricsModalOpen);
  const setIsLyricsModalOpen = usePlayerStore((s) => s.setIsLyricsModalOpen);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const quality = usePlayerStore((s) => s.quality);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const favorites = usePlayerStore((s) => s.favorites);
  const language = usePlayerStore((s) => s.language);
  const t = getTranslation(language);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setQuality = usePlayerStore((s) => s.setQuality);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);

  const viewMode = isLyricsModalOpen ? "lyrics" : "player";
  const setViewMode = (mode: "player" | "lyrics") => setIsLyricsModalOpen(mode === "lyrics");
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "Escape") {
        setIsExpandedPlayer(false);
        setIsLyricsModalOpen(false);
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        nextTrack();
      } else if (e.key === "ArrowLeft") {
        prevTrack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack, setIsExpandedPlayer, setIsLyricsModalOpen]);

  // Fetch synced lyrics from LRCLIB
  useEffect(() => {
    if (!currentTrack) return;
    let isMounted = true;
    setIsLoadingLyrics(true);
    setLyricsError(null);
    setIsUserScrolled(false);

    const q = new URLSearchParams({
      track: currentTrack.title,
      artist: currentTrack.artist,
      duration: String(currentTrack.duration),
    });

    fetch(`/api/lyrics?${q.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.lines && data.lines.length > 0) {
          setLyrics(data.lines);
        } else {
          setLyrics([]);
          setLyricsError("Lyrics not found for this track");
        }
      })
      .catch(() => {
        if (isMounted) setLyricsError("Could not load lyrics");
      })
      .finally(() => {
        if (isMounted) setIsLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.title, currentTrack?.artist, currentTrack?.duration]);

  // Determine active lyric line index
  const activeLineIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, currentTime]);

  // Auto-scroll to active lyric line unless user manually scrolled
  useEffect(() => {
    if (viewMode !== "lyrics" || isUserScrolled || activeLineIndex === -1) return;
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex, viewMode, isUserScrolled]);

  const scrollToActiveLine = () => {
    setIsUserScrolled(false);
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  if (!isExpandedPlayer || !currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/45 backdrop-blur-[48px] flex flex-col justify-between p-3 sm:p-8 overflow-y-auto sm:overflow-hidden font-normal select-none"
      >
        {/* Top Header Floating Matte Panel */}
        <div className="matte-glass backdrop-blur-[48px] rounded-full sm:rounded-2xl border border-border px-3 sm:px-8 py-2.5 sm:py-3 max-w-4xl w-full mx-auto flex items-center justify-between shadow-2xl shrink-0 z-20">
          {/* PC only: muzec.live branding indicator (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <span className="text-xs tracking-widest text-muted-foreground font-normal">
              muzec.live
            </span>
          </div>

          {/* Quality Selector & Close button */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
            <JellyRadio
              items={[
                { value: "normal", label: "Normal 320k" },
                { value: "high", label: "High 24-bit" },
                { value: "lossless", label: "Lossless 96kHz" },
              ]}
              value={quality}
              onChange={(val) => setQuality(val as AudioQuality)}
              size="sm"
              gap={4}
              radius={16}
              swell={0.08}
              barge={2}
              shrink={0.04}
              jelly={0.8}
              bounce={0.2}
              stagger={16}
              stiffness={580}
            />
            <button
              onClick={() => {
                setIsExpandedPlayer(false);
                setIsLyricsModalOpen(false);
              }}
              className="p-1.5 sm:p-2 rounded-full matte-glass text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center border border-border cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: ALBUM ART PLAYER VIEW                                 */}
        {/* ============================================================ */}
        {viewMode === "player" && (
          <>
            {/* Center: Large Floating Matte Card with Homepage Glass Reference */}
            <div className="matte-glass backdrop-blur-[48px] rounded-3xl border border-white/10 p-4 sm:p-10 max-w-xl w-full mx-auto text-center flex flex-col items-center justify-center space-y-3 sm:space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] my-auto shrink-0">
              <div className="relative w-36 h-36 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Track Info with smooth Marquee scroll / ticker */}
              <div className="space-y-1.5 w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-2.5 max-w-full px-2">
                  <div className="max-w-[260px] sm:max-w-md overflow-hidden">
                    <MarqueeText
                      text={currentTrack.title}
                      className="text-foreground font-normal tracking-[-0.035em] text-[clamp(22px,3.8vw,48px)] leading-[1.12]"
                      style={{
                        fontFamily: "var(--font-geist-sans), sans-serif",
                        fontWeight: 400,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => toggleFavorite(currentTrack.id)}
                    aria-label="Toggle Favorite"
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-all duration-200",
                        isFav
                          ? "fill-current text-foreground scale-110"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground font-normal truncate max-w-sm">
                  {currentTrack.artist} — {currentTrack.album}
                </p>
              </div>

              {/* Scrubber */}
              <div className="w-full space-y-1.5">
                <ProgressScrubber
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={seekTo}
                />
                <div className="flex justify-between text-xs tabular-nums text-muted-foreground font-normal px-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls: Shuffle, Previous, Play, Next, Repeat */}
              <div className="flex items-center justify-center gap-5 sm:gap-8 pt-1">
                <button
                  onClick={toggleShuffle}
                  title={`Shuffle ${shuffle ? "On" : "Off"}`}
                  className={cn(
                    "p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                    shuffle
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  onClick={prevTrack}
                  title="Previous Track"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.06 }}
                  onClick={togglePlay}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-none focus:outline-none cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                  )}
                </motion.button>

                <button
                  onClick={nextTrack}
                  title="Next Track"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={toggleRepeat}
                  title={`Repeat: ${repeatMode}`}
                  className={cn(
                    "p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                    repeatMode !== "off"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="w-5 h-5 text-foreground" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Floating Matte Panel: Volume on LEFT, Lyrics Button on RIGHT */}
            <div className="matte-glass backdrop-blur-[48px] rounded-full sm:rounded-2xl border border-white/10 px-5 sm:px-6 py-2.5 sm:py-3 max-w-xl w-full mx-auto flex items-center justify-between shadow-xl text-xs text-muted-foreground font-normal shrink-0 z-20">
              {/* LEFT: Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div style={{ width: 110 }}>
                  <WakeSlider
                    value={Math.round((isMuted ? 0 : volume) * 100)}
                    defaultValue={Math.round((isMuted ? 0 : volume) * 100)}
                    min={0}
                    max={100}
                    step={1}
                    bars={14}
                    height={30}
                    restHeight={8}
                    gap={3}
                    sensitivity={1}
                    reach={4}
                    skew={0.6}
                    glide={0.3}
                    smoothing={100}
                    showValue={false}
                    onChange={(val) => setVolume(val / 100)}
                    disabled={false}
                  />
                </div>
                <span className="text-foreground tabular-nums text-[11px] min-w-[3ch] hidden sm:inline">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* RIGHT: Matte Panel Inside Matte Panel Lyrics Button */}
              <button
                onClick={() => setViewMode("lyrics")}
                className="flex items-center gap-2 px-4 py-2 rounded-full matte-glass border border-white/15 text-foreground hover:bg-foreground/10 transition-all cursor-pointer text-xs font-normal shadow-sm"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>Lyrics</span>
              </button>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SPOTIFY-STYLE SYNCHRONIZED LYRICS VIEW               */}
        {/* ============================================================ */}
        {viewMode === "lyrics" && (
          <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto my-3 relative overflow-hidden">
            {/* Song Meta Minimal Indicator */}
            <div className="text-center pt-2 pb-1 shrink-0">
              <h3
                className="text-lg sm:text-xl text-foreground font-normal tracking-tight truncate max-w-md mx-auto"
                style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
              >
                {currentTrack.title}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Lyrics Scrollable Container */}
            <div
              ref={lyricsContainerRef}
              onWheel={() => setIsUserScrolled(true)}
              onTouchMove={() => setIsUserScrolled(true)}
              className="flex-1 overflow-y-auto px-4 sm:px-12 py-12 space-y-7 text-center scroll-smooth no-scrollbar"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
              }}
            >
              {isLoadingLyrics ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                  <span className="text-sm">Retrieving synchronized lyrics from LRCLIB...</span>
                </div>
              ) : lyricsError ? (
                <div className="py-24 text-center space-y-2 text-muted-foreground">
                  <p className="text-sm">{lyricsError}</p>
                  <p className="text-xs text-muted-foreground/60">
                    Enjoying {currentTrack.title} in pure lossless sound
                  </p>
                </div>
              ) : lyrics.length === 0 ? (
                <div className="py-24 text-sm text-muted-foreground">
                  Instrumental or no lyrics available
                </div>
              ) : (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeLineIndex;

                  return (
                    <motion.div
                      key={`line-${idx}-${line.time}`}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => seekTo(line.time)}
                      className={cn(
                        "transition-all duration-300 cursor-pointer select-none py-1",
                        isActive
                          ? "text-white font-medium sm:font-semibold text-2xl sm:text-4xl leading-relaxed scale-102"
                          : "text-white/35 hover:text-white/65 text-lg sm:text-2xl leading-relaxed"
                      )}
                      style={{
                        fontFamily: "var(--font-geist-sans), sans-serif",
                      }}
                    >
                      {line.text}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Floating Synchronize Button when user scrolled away */}
            <AnimatePresence>
              {isUserScrolled && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className="absolute bottom-20 left-0 right-0 flex items-center justify-center z-30 pointer-events-none"
                >
                  <button
                    onClick={scrollToActiveLine}
                    className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-medium shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronize</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Controls in Lyrics Mode: Volume on LEFT, Back Button on RIGHT */}
            <div className="matte-glass backdrop-blur-[48px] rounded-full sm:rounded-2xl border border-white/10 px-5 sm:px-6 py-2.5 sm:py-3 max-w-xl w-full mx-auto flex items-center justify-between shadow-xl text-xs text-muted-foreground font-normal shrink-0 z-20">
              {/* LEFT: Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div style={{ width: 110 }}>
                  <WakeSlider
                    value={Math.round((isMuted ? 0 : volume) * 100)}
                    defaultValue={Math.round((isMuted ? 0 : volume) * 100)}
                    min={0}
                    max={100}
                    step={1}
                    bars={14}
                    height={30}
                    restHeight={8}
                    gap={3}
                    sensitivity={1}
                    reach={4}
                    skew={0.6}
                    glide={0.3}
                    smoothing={100}
                    showValue={false}
                    onChange={(val) => setVolume(val / 100)}
                    disabled={false}
                  />
                </div>
                <span className="text-foreground tabular-nums text-[11px] min-w-[3ch] hidden sm:inline">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* RIGHT: Back Button */}
              <button
                onClick={() => {
                  setViewMode("player");
                  setIsLyricsModalOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full matte-glass border border-white/15 text-foreground hover:bg-foreground/10 transition-all cursor-pointer text-xs font-normal shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
