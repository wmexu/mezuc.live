"use client";

import React from "react";
import { MusicPatternWavesBackground } from "@/components/effects/MusicPatternWavesBackground";
import { TopBar } from "@/components/player/TopBar";
import { MainViews } from "@/components/player/MainViews";
import { BottomPlayer } from "@/components/player/BottomPlayer";
import { FloatingDock } from "@/components/player/FloatingDock";
import { ExpandedPlayerModal } from "@/components/player/ExpandedPlayerModal";
import { SettingsModal } from "@/components/player/SettingsModal";
import { NotificationStack } from "@/components/player/NotificationStack";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background overflow-x-hidden font-sans transition-colors duration-300">
      {/* Pattern Waves Background (Silk, music-reactive colors, interactive ripples) */}
      <MusicPatternWavesBackground />

      {/* Floating Magic UI Animated Notification Stack */}
      <NotificationStack />

      {/* Foreground Interactive Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header Bar with Magic UI Text Animate & Jelly Radio */}
        <TopBar />

        {/* Main Interactive Views */}
        <MainViews />

        {/* Floating Magic UI Dock */}
        <FloatingDock />

        {/* Minimalist Bottom Player with WakeSlider Volume Popover */}
        <BottomPlayer />

        {/* Full-screen Focus Mode Modal */}
        <ExpandedPlayerModal />

        {/* Matte Glass Settings Modal */}
        <SettingsModal />
      </div>
    </div>
  );
}
