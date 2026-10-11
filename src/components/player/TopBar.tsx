"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, UploadCloud, Settings } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import JellyRadio from "@/components/react-bits/JellyRadio";
import { usePlayerStore } from "@/store/usePlayerStore";
import { AudioQuality } from "@/types/player";
import { getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const TopBar: React.FC = () => {
  const quality = usePlayerStore((s) => s.quality);
  const setQuality = usePlayerStore((s) => s.setQuality);
  const searchQuery = usePlayerStore((s) => s.searchQuery);
  const setSearchQuery = usePlayerStore((s) => s.setSearchQuery);
  const setActiveView = usePlayerStore((s) => s.setActiveView);
  const loadUserAudioFile = usePlayerStore((s) => s.loadUserAudioFile);
  const setSelectedAlbumId = usePlayerStore((s) => s.setSelectedAlbumId);
  const setIsSettingsOpen = usePlayerStore((s) => s.setIsSettingsOpen);
  const language = usePlayerStore((s) => s.language);
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile smart scroll state: higher part collapses when scrolling down, expands when scrolling up
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // On desktop viewports (>= 640px), always stay fully visible and fixed
      if (window.innerWidth >= 640) {
        if (isMobileCollapsed) setIsMobileCollapsed(false);
        return;
      }

      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 15) {
        // At the top: always show full header
        setIsMobileCollapsed(false);
      } else if (diff > 8 && currentScrollY > 40) {
        // Scrolling down: smoothly close higher part
        setIsMobileCollapsed(true);
      } else if (diff < -5) {
        // Scrolling up (even shortly): bring higher part back!
        setIsMobileCollapsed(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileCollapsed]);

  const handleSearchFocus = () => {
    setActiveView("search");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadUserAudioFile(file);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full matte-glass backdrop-blur-[48px] !rounded-none !border-x-0 !border-t-0 border-b border-border transition-colors font-normal">
      {/* 1. DESKTOP UNIFIED TOPBAR (Permanent fixed bar across desktop) */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-8 h-20 items-center justify-between gap-4">
        {/* Left: Corner Icon "m." and branding */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSelectedAlbumId(null);
              setActiveView("player");
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <span
              className="text-[36px] leading-[36px] text-foreground select-none group-hover:opacity-80 transition-opacity font-normal tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              m.
            </span>

            <div className="flex flex-col justify-between h-[36px] py-[2px]">
              <div className="flex items-center gap-1.5 leading-none">
                <TextAnimate
                  animation="slideUp"
                  by="word"
                  className="text-[16px] leading-none text-foreground inline-block font-normal tracking-[-0.03em]"
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontWeight: 400,
                  }}
                >
                  muzec.live
                </TextAnimate>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 group-hover:bg-foreground animate-pulse" />
              </div>
              <span
                className="text-[11px] leading-none text-muted-foreground font-normal tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 400,
                }}
              >
                {t.streamingPlatform}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 lg:mx-6 items-center justify-center">
          <div className="relative w-full group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0) {
                  setActiveView("search");
                }
              }}
              onFocus={handleSearchFocus}
              placeholder={t.searchPlaceholder}
              className="w-full bg-black/5 dark:bg-white/[0.04] text-sm text-foreground placeholder-muted-foreground rounded-full pl-10 pr-12 py-2 border border-border focus:border-foreground/30 focus:bg-black/10 dark:focus:bg-white/[0.08] focus:outline-none transition-all duration-200 font-normal backdrop-blur-md"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-zinc-900 border border-border text-muted-foreground font-normal">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: React Bits Jelly Radio, Master Upload & Settings Modal Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-[12px] text-muted-foreground font-normal"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              {t.quality}
            </span>
            <JellyRadio
              items={[
                { value: "normal", label: "Normal 320k" },
                { value: "high", label: "High 24-bit" },
                { value: "lossless", label: "Lossless 96kHz" },
              ]}
              value={quality}
              onChange={(val) => setQuality(val as AudioQuality)}
              size="sm"
              gap={6}
              radius={16}
              swell={0.08}
              barge={2}
              shrink={0.04}
              jelly={0.8}
              bounce={0.2}
              stagger={16}
              stiffness={580}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import lossless audio file (.flac, .wav, .mp3)"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border text-xs text-foreground transition-all duration-200 font-normal shrink-0 cursor-pointer"
            style={{
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
            }}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span
              className="hidden sm:inline font-normal"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              {t.importAudio}
            </span>
          </button>

          {/* Settings Modal Trigger Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title={t.settings}
            className="flex items-center justify-center w-9 h-9 rounded-full matte-glass text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer shrink-0 focus:outline-none border border-border"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MOBILE COLLAPSIBLE TWO-TIER TOPBAR */}
      <div className="sm:hidden flex flex-col w-full">
        {/* Tier A: Higher Part with Logo, Import, Settings (Closes on scroll down, returns on scroll up) */}
        <div
          className={cn(
            "flex items-center justify-between px-4 transition-all duration-300 ease-in-out overflow-hidden border-b border-border/40",
            isMobileCollapsed
              ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none py-0 border-transparent"
              : "max-h-16 opacity-100 translate-y-0 py-2.5"
          )}
        >
          {/* Logo & Subtitle */}
          <button
            onClick={() => {
              setSelectedAlbumId(null);
              setActiveView("player");
            }}
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          >
            <span
              className="text-[28px] leading-[28px] text-foreground select-none font-normal tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              m.
            </span>
            <div className="flex flex-col justify-center leading-none">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[15px] font-normal tracking-[-0.03em] text-foreground">
                  muzec.live
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" />
              </div>
              <span className="text-[10px] text-muted-foreground font-normal tracking-[-0.01em] mt-0.5">
                {t.streamingPlatform}
              </span>
            </div>
          </button>

          {/* Right: Import + Higher Settings Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              title={t.importAudio}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-border text-foreground matte-glass hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title={t.settings}
              className="flex items-center justify-center w-8 h-8 rounded-full matte-glass text-foreground hover:bg-foreground/5 transition-all duration-200 cursor-pointer focus:outline-none border border-border"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier B: Downer Part with Search & Quality settings (Takes place and stays fixed as you scroll down) */}
        <div className="px-4 py-2.5 flex flex-col gap-2">
          {/* Search bar */}
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0) setActiveView("search");
              }}
              placeholder={t.searchPlaceholder}
              className="w-full bg-black/5 dark:bg-white/[0.04] text-xs text-foreground placeholder-muted-foreground rounded-full pl-8 pr-4 py-1.5 border border-border focus:outline-none font-normal"
            />
          </div>

          {/* Quality row: Quality text on left, Normal/High/Lossless moved to the right (NO duplicate settings button) */}
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] text-muted-foreground font-normal"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              {t.quality}
            </span>
            <div className="flex items-center">
              <JellyRadio
                items={[
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                  { value: "lossless", label: "Lossless" },
                ]}
                value={quality}
                onChange={(val) => setQuality(val as AudioQuality)}
                size="sm"
                gap={5}
                radius={16}
                swell={0.08}
                barge={2}
                shrink={0.04}
                jelly={0.8}
                bounce={0.2}
                stagger={16}
                stiffness={580}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
