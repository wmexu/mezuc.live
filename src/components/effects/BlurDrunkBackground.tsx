"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePlayerStore } from "@/store/usePlayerStore";

export const BlurDrunkBackground: React.FC = () => {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [mounted, setMounted] = useState(false);

  // Consistent initial coordinates between SSR and hydration
  const mouseX = useMotionValue(600);
  const mouseY = useMotionValue(350);

  // Viscous liquid spring physics per specification:
  // stiffness: 70, damping: 24, mass: 1.5
  const springX = useSpring(mouseX, {
    stiffness: 70,
    damping: 24,
    mass: 1.5,
  });

  const springY = useSpring(mouseY, {
    stiffness: 70,
    damping: 24,
    mass: 1.5,
  });

  useEffect(() => {
    setMounted(true);
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 3);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      {/* Primary Viscous Liquid Drunk Light Follower */}
      <motion.div
        style={{
          x: mounted ? springX : 600,
          y: mounted ? springY : 350,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isPlaying ? [1, 1.15, 1.05, 1.2, 1] : [1, 1.05, 1],
          opacity: isPlaying ? 0.09 : 0.06,
        }}
        transition={{
          duration: isPlaying ? 3.6 : 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[680px] h-[680px] rounded-full bg-white blur-[120px]"
      />

      {/* Secondary Ambient Corner Resonator (Subtle Silver Rim) */}
      <motion.div
        animate={{
          opacity: [0.03, 0.06, 0.03],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-40 right-10 w-[500px] h-[500px] rounded-full bg-zinc-300 blur-[140px]"
      />

      {/* Deep OLED Bottom Grounding Anchor */}
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[400px] rounded-full bg-white/[0.04] blur-[130px]" />
    </div>
  );
};
