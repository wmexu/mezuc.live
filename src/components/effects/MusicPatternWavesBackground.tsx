"use client";

import React, { useEffect, useMemo, useState } from "react";
import PatternWaves from "@/components/react-bits/PatternWaves";
import { usePlayerStore } from "@/store/usePlayerStore";

// Sophisticated, non-toxic, muted color palettes mapped to tracks (Red, Yellow, Green)
interface TrackColorTheme {
  color: string;
  accentColor: string;
}

const COLOR_PALETTES: TrackColorTheme[] = [
  // 1. Red: Muted Terracotta & Dusky Wine
  { color: "#b65959", accentColor: "#823e3e" },
  // 2. Green: Muted Sage & Deep Forest Moss
  { color: "#5a8c6a", accentColor: "#3e634a" },
  // 3. Yellow: Warm Vintage Ochre & Antique Amber
  { color: "#c99a52", accentColor: "#8f6b33" },
  // 4. Red: Subdued Crimson Rust
  { color: "#b85b4b", accentColor: "#7e392d" },
  // 5. Green: Calm Juniper Pine
  { color: "#568774", accentColor: "#395c4e" },
  // 6. Yellow: Warm Wheat Brass
  { color: "#bf9f56", accentColor: "#876d34" },
  // 7. Green: Calm Eucalyptus
  { color: "#658e6d", accentColor: "#46674d" },
  // 8. Red: Muted Clay Brick
  { color: "#ab5d54", accentColor: "#753a33" },
];

const THEMES: Record<string, TrackColorTheme> = {
  "track-1": COLOR_PALETTES[0], // Red
  "track-2": COLOR_PALETTES[1], // Green
  "track-3": COLOR_PALETTES[2], // Yellow
  "track-4": COLOR_PALETTES[3], // Red
  "track-5": COLOR_PALETTES[4], // Green
  "track-6": COLOR_PALETTES[5], // Yellow
  "track-7": COLOR_PALETTES[6], // Green
  "track-8": COLOR_PALETTES[7], // Red
};

export const MusicPatternWavesBackground: React.FC = () => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const customAccentColor = usePlayerStore((s) => s.customAccentColor);
  const isNoTheme = customAccentColor === "no-theme" || customAccentColor === "none";

  const theme = useMemo(() => {
    if (customAccentColor) {
      if (customAccentColor === "monochrome" || customAccentColor.toLowerCase() === "#ffffff") {
        const monoColor = isDark ? "#ffffff" : "#000000";
        return { color: monoColor, accentColor: monoColor };
      }
      if (isNoTheme) {
        const solidColor = isDark ? "#000000" : "#ffffff";
        return { color: solidColor, accentColor: solidColor };
      }
      return { color: customAccentColor, accentColor: customAccentColor };
    }
    if (!currentTrack) return THEMES["track-1"];
    if (THEMES[currentTrack.id]) return THEMES[currentTrack.id];
    // Deterministic hash for imported audio
    const hash = (currentTrack.title || currentTrack.id)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLOR_PALETTES[hash % COLOR_PALETTES.length];
  }, [currentTrack, customAccentColor, isDark, isNoTheme]);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-auto overflow-hidden bg-white dark:bg-black transition-colors duration-500"
      style={{ isolation: "isolate" }}
      aria-hidden="true"
    >
      {!isNoTheme && (
        <PatternWaves
          preset="silk"
          color={theme.color}
          accentColor={theme.accentColor}
          backgroundColor={isDark ? "#000000" : "#ffffff"}
          fade="edges"
          interactive={true}
          cursorSize={50}
          cursorStrength={0.6}
          pattern="dot"
          wave="silk"
          spacing={9}
          markSize={0.95}
          depth={0.95}
          light={0}
          shine={isDark ? 0.8 : 0.4}
          contrast={1.2}
          speed={isPlaying ? 0.35 : 0.12}
          scale={1}
          direction={20}
          opacity={isDark ? 0.88 : 0.8}
          fadeSize={0.5}
          characters=".:-=+*#%@"
          intro={true}
          paused={false}
        />
      )}
    </div>
  );
};
