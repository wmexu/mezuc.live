"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Palette,
  Globe,
  SunMoon,
  RotateCcw,
  User,
  Pencil,
  Check,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { JellyRadio } from "@/components/react-bits/JellyRadio";
import { Language, getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ACCENT_PRESETS = [
  { name: "Monochrome", color: "monochrome" },
  { name: "Terracotta", color: "#b65959" },
  { name: "Sage Moss", color: "#5a8c6a" },
  { name: "Warm Ochre", color: "#c99a52" },
  { name: "Deep Violet", color: "#8b5cf6" },
  { name: "Cyan Ice", color: "#06b6d4" },
];

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = usePlayerStore((s) => s.isSettingsOpen);
  const setIsSettingsOpen = usePlayerStore((s) => s.setIsSettingsOpen);
  const theme = usePlayerStore((s) => s.theme);
  const setTheme = usePlayerStore((s) => s.setTheme);
  const language = usePlayerStore((s) => s.language);
  const setLanguage = usePlayerStore((s) => s.setLanguage);
  const username = usePlayerStore((s) => s.username);
  const setUsername = usePlayerStore((s) => s.setUsername);
  const customAccentColor = usePlayerStore((s) => s.customAccentColor);
  const setCustomAccentColor = usePlayerStore((s) => s.setCustomAccentColor);

  const t = getTranslation(language);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(!username.trim());
  const [usernameInput, setUsernameInput] = useState(username);

  if (!isSettingsOpen) return null;

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    useNotificationStore.getState().addNotification({
      title: newTheme === "dark" ? t.notifThemeDark : t.notifThemeLight,
      iconType: newTheme === "dark" ? "theme-dark" : "theme-light",
    });
  };

  const handleAccentChange = (color: string | null, name?: string) => {
    setCustomAccentColor(color);
    useNotificationStore.getState().addNotification({
      title: t.notifWaveAccent,
      description:
        name ||
        (color === "no-theme"
          ? t.noTheme
          : color || t.resetDefaultColor),
      iconType: "palette",
    });
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const langNames: Record<Language, string> = {
      en: "English",
      ru: "Русский",
      es: "Español",
      fi: "Suomi",
    };
    useNotificationStore.getState().addNotification({
      title: `${t.notifLanguage}${langNames[newLang]}`,
      iconType: "globe",
    });
  };

  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    setUsername(trimmed);
    setIsEditingUsername(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="relative w-full max-w-lg rounded-3xl matte-glass backdrop-blur-[48px] border border-border p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full matte-glass flex items-center justify-center border border-border">
                <Sparkles className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-foreground tracking-tight">
                  {t.settingsTitle}
                </h3>
                <p className="text-xs text-muted-foreground">{t.appearance}</p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 rounded-full matte-glass text-muted-foreground hover:text-foreground transition-colors border border-border cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 0: Username / Profile Setting */}
          <div className="space-y-3 p-4 rounded-2xl matte-glass border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{t.username}</span>
              </div>
            </div>

            <div className="pt-1">
              {!isEditingUsername && username.trim() ? (
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
                  <span
                    className="text-sm font-medium text-foreground tracking-tight"
                    style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                  >
                    {username}
                  </span>
                  <button
                    onClick={() => {
                      setUsernameInput(username);
                      setIsEditingUsername(true);
                    }}
                    title={t.editUsername}
                    className="p-1.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {/* Rotated pencil icon in our minimalist style */}
                    <Pencil className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveUsername();
                    }}
                    placeholder={t.enterUsername}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.saveUsername}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Light / Dark Theme using JellyRadio */}
          <div className="space-y-3 p-4 rounded-2xl matte-glass border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <SunMoon className="w-4 h-4 text-muted-foreground" />
                <span>{t.theme}</span>
              </div>
              <span className="text-[11px] text-muted-foreground capitalize">
                {theme === "dark" ? t.darkTheme : t.lightTheme}
              </span>
            </div>

            <div className="pt-1">
              <JellyRadio
                items={[
                  { value: "dark", label: t.darkTheme },
                  { value: "light", label: t.lightTheme },
                ]}
                value={theme}
                onChange={(val) => handleThemeChange(val as "dark" | "light")}
                size="sm"
                gap={8}
                radius={16}
                swell={0.08}
                barge={2}
                shrink={0.03}
                stiffness={580}
              />
            </div>
          </div>

          {/* Section 2: Fixed Theme Color using react-colorful */}
          <div className="space-y-4 p-4 rounded-2xl matte-glass border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span>{t.fixedAccentColor}</span>
              </div>

              {customAccentColor && (
                <button
                  onClick={() => handleAccentChange(null)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={t.resetDefaultColor}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.resetDefaultColor}</span>
                </button>
              )}
            </div>

            {/* Color Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_PRESETS.map((preset) => {
                const isActive =
                  preset.color === "monochrome"
                    ? customAccentColor === "monochrome" || customAccentColor === "#ffffff"
                    : customAccentColor === preset.color;

                const dotColor =
                  preset.color === "monochrome"
                    ? theme === "dark"
                      ? "#ffffff"
                      : "#000000"
                    : preset.color;

                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setShowColorPicker(false);
                      handleAccentChange(preset.color, preset.name);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer",
                      isActive
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "matte-glass text-muted-foreground hover:text-foreground border-border"
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer",
                  showColorPicker
                    ? "bg-foreground text-background border-foreground"
                    : "matte-glass text-muted-foreground hover:text-foreground border-border"
                )}
              >
                {t.customColor}
              </button>

              {/* No Theme Option (Solid Pure Black or Pure White) */}
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  handleAccentChange("no-theme", t.noTheme);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer",
                  customAccentColor === "no-theme"
                    ? "bg-foreground text-background border-foreground shadow-sm font-medium"
                    : "matte-glass text-muted-foreground hover:text-foreground border-border"
                )}
              >
                {t.noTheme}
              </button>
            </div>

            {/* react-colorful HexColorPicker Panel */}
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 space-y-3 overflow-hidden"
                >
                  <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-border flex flex-col items-center gap-3">
                    <HexColorPicker
                      color={
                        customAccentColor && !["monochrome", "no-theme"].includes(customAccentColor)
                          ? customAccentColor
                          : "#b65959"
                      }
                      onChange={(newColor) => handleAccentChange(newColor, newColor)}
                      className="w-full !w-full"
                    />

                    <div className="w-full flex items-center justify-between text-xs px-2 pt-1">
                      <span className="text-muted-foreground">Hex:</span>
                      <span className="font-mono text-foreground font-medium uppercase">
                        {customAccentColor || "#b65959"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Language Selector (English, Russian, Spanish, Suomi) */}
          <div className="space-y-3 p-4 rounded-2xl matte-glass border border-border overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>{t.language}</span>
            </div>

            <div className="pt-1 w-full overflow-x-auto no-scrollbar scrollbar-none pb-1.5 -mx-1 px-1">
              <div className="inline-flex min-w-max">
                <JellyRadio
                  items={[
                    { value: "en", label: "English" },
                    { value: "ru", label: "Русский" },
                    { value: "es", label: "Español" },
                    { value: "fi", label: "Suomi" },
                  ]}
                  value={language}
                  onChange={(val) => handleLanguageChange(val as Language)}
                  size="sm"
                  gap={6}
                  radius={16}
                  swell={0.08}
                  barge={2}
                  shrink={0.03}
                  stiffness={580}
                />
              </div>
            </div>
          </div>

          {/* Footer Action: Contact Me Link */}
          <div className="pt-2 flex justify-end">
            <a
              href="https://t.me/wmexu?text=Hello,%20i%20want%20to%20contact%20you%20about%20muzec."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer shadow-md inline-flex items-center gap-1.5 select-none"
            >
              <span>{t.contactMe}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
