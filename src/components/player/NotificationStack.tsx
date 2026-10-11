"use client";

import React from "react";
import {
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  Moon,
  Sun,
  Sparkles,
  Globe,
  Disc3,
  X,
} from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";
import {
  NotificationIconType,
  useNotificationStore,
} from "@/store/useNotificationStore";
import { cn } from "@/lib/utils";

const renderIcon = (type: NotificationIconType) => {
  switch (type) {
    case "heart":
      return <Heart className="w-4 h-4 fill-current text-foreground" />;
    case "heart-off":
      return <Heart className="w-4 h-4 text-muted-foreground" />;
    case "shuffle-on":
      return <Shuffle className="w-4 h-4 text-foreground" />;
    case "shuffle-off":
      return <Shuffle className="w-4 h-4 text-muted-foreground" />;
    case "repeat-all":
      return <Repeat className="w-4 h-4 text-foreground" />;
    case "repeat-one":
      return <Repeat1 className="w-4 h-4 text-foreground" />;
    case "repeat-off":
      return <Repeat className="w-4 h-4 text-muted-foreground" />;
    case "theme-dark":
      return <Moon className="w-4 h-4 text-foreground" />;
    case "theme-light":
      return <Sun className="w-4 h-4 text-foreground" />;
    case "palette":
      return <Sparkles className="w-4 h-4 text-foreground" />;
    case "globe":
      return <Globe className="w-4 h-4 text-foreground" />;
    case "quality":
      return <Disc3 className="w-4 h-4 text-foreground" />;
    default:
      return <Sparkles className="w-4 h-4 text-foreground" />;
  }
};

export const NotificationStack: React.FC = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed top-24 right-4 sm:right-6 z-50 pointer-events-none flex flex-col gap-2 max-w-[340px] w-full"
    >
      <AnimatedList className="flex flex-col gap-2">
        {notifications.map((item) => (
          <AnimatedListItem key={item.id}>
            <div
              className={cn(
                "relative pointer-events-auto flex items-center gap-3 p-3 rounded-2xl matte-glass border border-border shadow-xl backdrop-blur-[36px]",
                "transition-all duration-200 select-none group"
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0 border border-foreground/10">
                {renderIcon(item.iconType)}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="text-xs font-medium text-foreground truncate"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {item.description}
                  </span>
                )}
              </div>

              <button
                onClick={() => removeNotification(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </aside>
  );
};
