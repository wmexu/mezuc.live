"use client";

import React from "react";
import { Disc3, Search, Library, Sparkles, SlidersHorizontal } from "lucide-react";
import { Dock, DockIcon } from "@/components/ui/dock";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerStore } from "@/store/usePlayerStore";
import { PlayerView } from "@/types/player";
import { getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const FloatingDock: React.FC = () => {
  const activeView = usePlayerStore((s) => s.activeView);
  const setActiveView = usePlayerStore((s) => s.setActiveView);
  const isExpandedPlayer = usePlayerStore((s) => s.isExpandedPlayer);
  const setIsExpandedPlayer = usePlayerStore((s) => s.setIsExpandedPlayer);
  const setSelectedAlbumId = usePlayerStore((s) => s.setSelectedAlbumId);
  const language = usePlayerStore((s) => s.language);
  const t = getTranslation(language);

  const mainNav = [
    {
      id: "player" as PlayerView,
      label: t.flow,
      icon: Disc3,
      action: () => {
        setIsExpandedPlayer(false);
        setSelectedAlbumId(null);
        setActiveView("player");
      },
    },
    {
      id: "search" as PlayerView,
      label: t.search,
      icon: Search,
      action: () => {
        setIsExpandedPlayer(false);
        setActiveView("search");
      },
    },
    {
      id: "library" as PlayerView,
      label: t.library,
      icon: Library,
      action: () => {
        setIsExpandedPlayer(false);
        setActiveView("library");
      },
    },
  ];

  const secondaryNav = [
    {
      id: "now-playing" as PlayerView,
      label: t.canvas,
      icon: Sparkles,
      action: () => {
        setIsExpandedPlayer(false);
        setActiveView("now-playing");
      },
    },
    {
      id: "expanded" as const,
      label: t.focusMode,
      icon: SlidersHorizontal,
      action: () => setIsExpandedPlayer(true),
    },
  ];

  return (
    <div className="fixed bottom-3 md:bottom-24 left-0 right-0 z-40 md:z-30 pointer-events-none flex items-center justify-center px-4">
      <div className="pointer-events-auto flex items-center justify-center">
        <TooltipProvider delayDuration={0}>
          <Dock
            direction="middle"
            className="matte-glass backdrop-blur-[48px] !rounded-full border border-border shadow-[0_10px_35px_rgba(0,0,0,0.5)] px-3 py-2 flex items-center justify-center gap-2"
          >
            {/* Main Navigation Views */}
            {mainNav.map((item) => {
              const isActive = !isExpandedPlayer && activeView === item.id;
              const Icon = item.icon;

              return (
                <DockIcon key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={item.action}
                        aria-label={item.label}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center",
                          isActive
                            ? "bg-foreground text-background shadow-md hover:bg-foreground hover:text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.08]"
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="matte-glass border border-border text-foreground text-[11px] px-2.5 py-1 rounded-full shadow-lg font-normal"
                    >
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            })}

            {/* Separator inside the dock */}
            <Separator
              orientation="vertical"
              className="h-7 w-px bg-border mx-1 self-center"
            />

            {/* Canvas & Focus View */}
            {secondaryNav.map((item) => {
              const isActive =
                item.id === "expanded"
                  ? isExpandedPlayer
                  : !isExpandedPlayer && activeView === "now-playing";
              const Icon = item.icon;

              return (
                <DockIcon key={item.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={item.action}
                        aria-label={item.label}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-12 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center",
                          isActive
                            ? "bg-foreground text-background shadow-md hover:bg-foreground hover:text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.08]"
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="matte-glass border border-border text-foreground text-[11px] px-2.5 py-1 rounded-full shadow-lg font-normal"
                    >
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              );
            })}
          </Dock>
        </TooltipProvider>
      </div>
    </div>
  );
};
