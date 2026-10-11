"use client";

import React, { ComponentPropsWithoutRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0.9, opacity: 0, y: -12 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
    transition: { type: "spring" as const, stiffness: 400, damping: 32 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full pointer-events-auto">
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export const AnimatedList = React.memo(
  ({ children, className, ...props }: AnimatedListProps) => {
    return (
      <div className={className} {...props}>
        <AnimatePresence mode="popLayout">
          {children}
        </AnimatePresence>
      </div>
    );
  }
);
AnimatedList.displayName = "AnimatedList";
