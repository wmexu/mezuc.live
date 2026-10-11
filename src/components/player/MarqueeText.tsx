"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number; // pixels per second
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  className,
  style,
  speed = 28,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch / mobile device
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkTouch();
  }, []);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && textRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const tWidth = textRef.current.scrollWidth;
        if (tWidth > cWidth + 2) {
          setOverflowDistance(tWidth - cWidth + 12);
        } else {
          setOverflowDistance(0);
        }
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  const durationSec = Math.max(3, overflowDistance / speed);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("overflow-hidden whitespace-nowrap relative select-none", className)}
      style={style}
    >
      <span
        ref={textRef}
        className={cn(
          "inline-block transition-transform ease-in-out",
          overflowDistance > 0 && isTouchDevice && "animate-marquee-loop"
        )}
        style={{
          transform:
            overflowDistance > 0 && !isTouchDevice && isHovered
              ? `translateX(-${overflowDistance}px)`
              : undefined,
          transitionDuration:
            overflowDistance > 0 && !isTouchDevice ? `${durationSec}s` : "0.4s",
          ["--marquee-distance" as string]: `-${overflowDistance}px`,
          ["--marquee-duration" as string]: `${durationSec * 2 + 2}s`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
