import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AudioQuality, PlayerView, RepeatMode, Track } from "@/types/player";
import { MOCK_TRACKS, Album } from "@/data/mockTracks";
import { audioEngine } from "@/lib/audioEngine";
import { Language, getTranslation } from "@/lib/i18n";
import { parseAudioMetadata } from "@/lib/metadataParser";
import { saveAudioBlob, getAudioBlob } from "@/lib/idbStorage";
import { useNotificationStore } from "@/store/useNotificationStore";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  quality: AudioQuality;
  queue: Track[];
  currentIndex: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  activeView: PlayerView;
  favorites: string[];
  searchQuery: string;
  selectedTag: string;
  isExpandedPlayer: boolean;
  selectedAlbumId: string | null;
  theme: "dark" | "light";
  customAccentColor: string | null;
  language: Language;
  username: string;
  isSettingsOpen: boolean;
  importedTracks: Track[];
  isLyricsModalOpen: boolean;
  recentSearchAlbums: Album[];
  recentSearchTracks: Track[];

  // Actions
  setIsLyricsModalOpen: (open: boolean) => void;
  openLyricsModal: () => void;
  openFullscreenModal: () => void;
  closeModals: () => void;
  addRecentSearchAlbum: (album: Album) => void;
  addRecentSearchTrack: (track: Track) => void;
  clearSearchHistory: () => void;
  setUsername: (name: string) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQuality: (quality: AudioQuality) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setActiveView: (view: PlayerView) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  setSelectedAlbumId: (id: string | null) => void;
  setIsExpandedPlayer: (open: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  setCustomAccentColor: (color: string | null) => void;
  setLanguage: (lang: Language) => void;
  setIsSettingsOpen: (open: boolean) => void;
  loadUserAudioFile: (file: File) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => {
      // Connect engine callbacks
      if (typeof window !== "undefined") {
        audioEngine.setCallbacks(
          (time: number) => {
            set({ currentTime: time });
          },
          () => {
            const { repeatMode, nextTrack, currentTrack, queue, currentIndex, pause } = get();
            if (repeatMode === "one" && currentTrack) {
              audioEngine.play(currentTrack, 0);
              set({ currentTime: 0, isPlaying: true });
            } else if (repeatMode === "all") {
              nextTrack();
            } else {
              // repeatMode === "off"
              if (currentIndex < queue.length - 1) {
                nextTrack();
              } else {
                // End of album / queue: automatically fetch and play similar songs
                if (currentTrack) {
                  const targetId = currentTrack.youtubeId || currentTrack.id.replace(/^yt-/, "");
                  fetch(
                    `/api/music/related?id=${targetId}&title=${encodeURIComponent(
                      currentTrack.title
                    )}&artist=${encodeURIComponent(currentTrack.artist)}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.tracks && data.tracks.length > 0) {
                        const newTracks = data.tracks.filter(
                          (nt: Track) => !get().queue.some((q) => q.id === nt.id)
                        );
                        if (newTracks.length > 0) {
                          set({ queue: [...get().queue, ...newTracks] });
                          get().nextTrack();
                          return;
                        }
                      }
                      pause();
                      set({ currentTime: 0 });
                    })
                    .catch(() => {
                      pause();
                      set({ currentTime: 0 });
                    });
                } else {
                  pause();
                  set({ currentTime: 0 });
                }
              }
            }
          }
        );
      }

      return {
        currentTrack: MOCK_TRACKS[0],
        isPlaying: false,
        currentTime: 0,
        duration: MOCK_TRACKS[0].duration,
        volume: 0.85,
        isMuted: false,
        quality: "lossless",
        queue: [...MOCK_TRACKS],
        currentIndex: 0,
        shuffle: false,
        repeatMode: "off",
        activeView: "player",
        favorites: [MOCK_TRACKS[0].id, MOCK_TRACKS[3].id],
        searchQuery: "",
        selectedTag: "ALL",
        isExpandedPlayer: false,
        selectedAlbumId: null,
        theme: "dark",
        customAccentColor: null,
        language: "en",
        username: "",
        isSettingsOpen: false,
        importedTracks: [],
        isLyricsModalOpen: false,
        recentSearchAlbums: [],
        recentSearchTracks: [],

        setIsLyricsModalOpen: (open: boolean) => set({ isLyricsModalOpen: open }),
        openLyricsModal: () => set({ isExpandedPlayer: true, isLyricsModalOpen: true }),
        openFullscreenModal: () => set({ isExpandedPlayer: true, isLyricsModalOpen: false }),
        closeModals: () => set({ isExpandedPlayer: false, isLyricsModalOpen: false }),

        addRecentSearchAlbum: (album: Album) => {
          const existing = (get().recentSearchAlbums || []).filter((a) => a.id !== album.id);
          set({ recentSearchAlbums: [album, ...existing].slice(0, 10) });
        },

        addRecentSearchTrack: (track: Track) => {
          const existing = (get().recentSearchTracks || []).filter((t) => t.id !== track.id);
          set({ recentSearchTracks: [track, ...existing].slice(0, 25) });
        },

        clearSearchHistory: () => set({ recentSearchAlbums: [], recentSearchTracks: [] }),

        setUsername: (name: string) => set({ username: name }),

        setSelectedAlbumId: (id: string | null) => set({ selectedAlbumId: id }),

        setTheme: (theme: "dark" | "light") => {
          if (typeof document !== "undefined") {
            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          set({ theme });
        },

        setCustomAccentColor: (color: string | null) => {
          set({ customAccentColor: color });
        },

        setLanguage: (lang: Language) => {
          set({ language: lang });
        },

        setIsSettingsOpen: (open: boolean) => {
          set({ isSettingsOpen: open });
        },

        playTrack: (track: Track, newQueue?: Track[]) => {
          const currentQueue = newQueue || get().queue;
          let idx = currentQueue.findIndex((t) => t.id === track.id);
          let updatedQueue = currentQueue;

          if (idx === -1) {
            updatedQueue = [track, ...currentQueue];
            idx = 0;
          }

          audioEngine.setQuality(get().quality);
          audioEngine.setVolume(get().isMuted ? 0 : get().volume);
          audioEngine.play(track, 0);

          set({
            currentTrack: track,
            queue: updatedQueue,
            currentIndex: idx,
            isPlaying: true,
            currentTime: 0,
            duration: track.duration,
          });
        },

        togglePlay: () => {
          const { isPlaying, currentTrack, currentTime } = get();
          if (!currentTrack) {
            const first = get().queue[0] || MOCK_TRACKS[0];
            get().playTrack(first);
            return;
          }

          if (isPlaying) {
            audioEngine.pause();
            set({ isPlaying: false });
          } else {
            audioEngine.setQuality(get().quality);
            audioEngine.setVolume(get().isMuted ? 0 : get().volume);
            audioEngine.play(currentTrack, currentTime);
            set({ isPlaying: true });
          }
        },

        pause: () => {
          audioEngine.pause();
          set({ isPlaying: false });
        },

        nextTrack: () => {
          const { queue, currentIndex, shuffle, playTrack } = get();
          if (queue.length === 0) return;

          let nextIdx: number;
          if (shuffle) {
            if (queue.length <= 1) {
              nextIdx = 0;
            } else {
              let rand = Math.floor(Math.random() * (queue.length - 1));
              if (rand >= currentIndex) rand++;
              nextIdx = rand;
            }
          } else {
            nextIdx = (currentIndex + 1) % queue.length;
          }

          playTrack(queue[nextIdx]);
        },

        prevTrack: () => {
          const { queue, currentIndex, currentTime } = get();
          if (currentTime > 3) {
            audioEngine.seek(0);
            set({ currentTime: 0 });
            return;
          }

          if (queue.length === 0) return;
          const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
          get().playTrack(queue[prevIdx]);
        },

        seekTo: (time: number) => {
          audioEngine.seek(time);
          set({ currentTime: time });
        },

        setVolume: (volume: number) => {
          const clamped = Math.max(0, Math.min(1, volume));
          audioEngine.setVolume(get().isMuted ? 0 : clamped);
          set({ volume: clamped });
        },

        toggleMute: () => {
          const { isMuted, volume } = get();
          const newMuted = !isMuted;
          audioEngine.setVolume(newMuted ? 0 : volume);
          set({ isMuted: newMuted });
        },

        setQuality: (quality: AudioQuality) => {
          audioEngine.setQuality(quality);
          set({ quality });
          const t = getTranslation(get().language);
          const label =
            quality === "normal"
              ? "Normal 320k"
              : quality === "high"
              ? "High 24-bit"
              : "Lossless 96kHz";
          useNotificationStore.getState().addNotification({
            title: `${t.notifQuality}${label}`,
            iconType: "quality",
          });
        },

        toggleShuffle: () => {
          const nextShuffle = !get().shuffle;
          set({ shuffle: nextShuffle });
          const t = getTranslation(get().language);
          useNotificationStore.getState().addNotification({
            title: nextShuffle ? t.notifShuffleOn : t.notifShuffleOff,
            iconType: nextShuffle ? "shuffle-on" : "shuffle-off",
          });
        },

        toggleRepeat: () => {
          // Off -> All (Repeat Playlist) -> One (Repeat Song) -> Off
          const modes: RepeatMode[] = ["off", "all", "one"];
          const nextIndex = (modes.indexOf(get().repeatMode) + 1) % modes.length;
          const nextMode = modes[nextIndex];
          set({ repeatMode: nextMode });

          const t = getTranslation(get().language);
          const notif =
            nextMode === "all"
              ? { title: t.notifRepeatPlaylist, iconType: "repeat-all" as const }
              : nextMode === "one"
              ? { title: t.notifRepeatSong, iconType: "repeat-one" as const }
              : { title: t.notifRepeatOff, iconType: "repeat-off" as const };
          useNotificationStore.getState().addNotification(notif);
        },

        toggleFavorite: (trackId: string) => {
          const isFav = get().favorites.includes(trackId);
          const track =
            get().queue.find((t) => t.id === trackId) || get().currentTrack;
          const t = getTranslation(get().language);
          set((state) => ({
            favorites: isFav
              ? state.favorites.filter((id) => id !== trackId)
              : [...state.favorites, trackId],
          }));
          useNotificationStore.getState().addNotification({
            title: !isFav ? t.notifAddedFavorite : t.notifRemovedFavorite,
            description: track?.title,
            iconType: !isFav ? "heart" : "heart-off",
          });
        },

        addToQueue: (track: Track) => {
          set((state) => ({ queue: [...state.queue, track] }));
        },

        removeFromQueue: (index: number) => {
          set((state) => {
            const updated = [...state.queue];
            updated.splice(index, 1);
            let nextIndex = state.currentIndex;
            if (index < state.currentIndex) {
              nextIndex = Math.max(0, state.currentIndex - 1);
            }
            return { queue: updated, currentIndex: nextIndex };
          });
        },

        clearQueue: () => {
          const { currentTrack } = get();
          set({
            queue: currentTrack ? [currentTrack] : [],
            currentIndex: 0,
          });
        },

        setActiveView: (view: PlayerView) => {
          set({ activeView: view });
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        setSelectedTag: (tag: string) => {
          set({ selectedTag: tag });
        },

        setIsExpandedPlayer: (open: boolean) => {
          set({ isExpandedPlayer: open });
        },

        loadUserAudioFile: async (file: File) => {
          const objectUrl = URL.createObjectURL(file);
          const meta = await parseAudioMetadata(file);
          const trackId = `custom-${Date.now()}`;

          const customTrack: Track = {
            id: trackId,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            audioUrl: objectUrl,
            genre: meta.genre,
            year: meta.year,
            bitrate: meta.bitrate,
            notes: `Imported local master (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
            coverUrl: meta.coverUrl,
          };

          // Save to IndexedDB so audio data persists across reloads
          await saveAudioBlob(trackId, file);

          set((state) => ({
            importedTracks: [customTrack, ...state.importedTracks.filter((t) => t.id !== trackId)],
          }));

          get().playTrack(customTrack);
        },
      };
    },
    {
      name: "muzec-live-player-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        quality: state.quality,
        favorites: state.favorites,
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        theme: state.theme,
        customAccentColor: state.customAccentColor,
        language: state.language,
        username: state.username,
        currentTrack: state.currentTrack,
        currentTime: state.currentTime,
        duration: state.duration,
        importedTracks: state.importedTracks,
        recentSearchAlbums: state.recentSearchAlbums,
        recentSearchTracks: state.recentSearchTracks,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Sync documentElement class
        if (typeof document !== "undefined") {
          if (state.theme === "light") {
            document.documentElement.classList.remove("dark");
          } else {
            document.documentElement.classList.add("dark");
          }
        }

        // Restore imported track audioUrl from IndexedDB if needed
        if (state.currentTrack && state.currentTrack.id.startsWith("custom-")) {
          getAudioBlob(state.currentTrack.id).then((blob) => {
            if (blob && state.currentTrack) {
              const url = URL.createObjectURL(blob);
              state.currentTrack.audioUrl = url;
            }
          });
        }

        // Migrate older mock tracks to real songs
        if (
          state.currentTrack &&
          (state.currentTrack.id.startsWith("track-") || (!state.currentTrack.youtubeId && !state.currentTrack.audioUrl))
        ) {
          state.currentTrack = MOCK_TRACKS[0];
          state.queue = [...MOCK_TRACKS];
          state.currentIndex = 0;
        }
      },
    }
  )
);
