export type AudioQuality = "normal" | "high" | "lossless";
export type RepeatMode = "off" | "all" | "one";
export type PlayerView = "player" | "search" | "library" | "now-playing";

export interface Track {
  id: string;
  youtubeId?: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string;
  genre?: string;
  year?: string;
  bpm?: number;
  bitrate?: string;
  isFavorite?: boolean;
  notes?: string;
  source?: "local" | "youtube" | "mock";
}
