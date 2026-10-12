"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  Pause,
  Heart,
  Shuffle,
  Check,
  Loader2,
  User,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Track } from "@/types/player";
import { Album } from "@/data/mockTracks";
import { Artist } from "@/lib/youtubeService";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { cn } from "@/lib/utils";

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface ArtistPageViewProps {
  artist: { id?: string; name: string; avatarUrl?: string };
  onBack: () => void;
  onOpenAlbum: (albumId: string, artistName?: string, albumTitle?: string, coverUrl?: string, year?: string) => void;
}

export const ArtistPageView: React.FC<ArtistPageViewProps> = ({
  artist,
  onBack,
  onOpenAlbum,
}) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);

  const [artistData, setArtistData] = useState<{
    artist: Artist;
    songs: Track[];
    albums: Album[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSongsCount, setVisibleSongsCount] = useState(10);
  const [visibleAlbumsCount, setVisibleAlbumsCount] = useState(6);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setVisibleSongsCount(10);
    setVisibleAlbumsCount(6);

    const targetQuery = artist.name || artist.id || "";
    fetch(`/api/music/artist/${encodeURIComponent(targetQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.artist) {
          setArtistData(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch artist details:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [artist.name, artist.id]);

  const avatarUrl = artistData?.artist?.avatarUrl || artist.avatarUrl || "";

  return (
    <section className="space-y-8 font-normal">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full matte-glass text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-border group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Artist</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {artist.name}
          </span>
        </div>
      </div>

      {/* Hero Artist Header */}
      <SpotlightCard className="overflow-hidden p-6 sm:p-10 matte-glass">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
          {/* Circular Artist Avatar */}
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-black/40 border border-white/20 shadow-2xl shrink-0 flex items-center justify-center relative">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <User
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30 absolute pointer-events-none -z-0",
                isLoading && "animate-pulse"
              )}
            />
          </div>

          {/* Artist Meta & Actions */}
          <div className="flex flex-col justify-center space-y-3 min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="font-medium text-foreground text-[11px] tracking-wide uppercase">
                Verified Artist
              </span>
            </div>

            <h1
              className="text-3xl sm:text-6xl font-normal tracking-[-0.03em] text-foreground truncate"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              {artist.name}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              {artistData?.artist?.subscribers || "Verified Artist • Discography"}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  if (artistData?.songs && artistData.songs.length > 0) {
                    playTrack(artistData.songs[0], artistData.songs);
                  }
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
                title="Play Artist"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  if (artistData?.songs && artistData.songs.length > 0) {
                    const shuffled = [...artistData.songs].sort(() => Math.random() - 0.5);
                    playTrack(shuffled[0], shuffled);
                  }
                }}
                className="p-2.5 rounded-full matte-glass border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFollowing((prev) => !prev)}
                className="px-4 py-2 rounded-full matte-glass border border-border text-xs font-medium text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* SECTION 1: POPULAR SONGS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
          <span className="text-sm font-normal text-foreground">Popular</span>
          <span className="text-xs text-muted-foreground">
            {artistData?.songs?.length || 0} songs available
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-foreground" />
            <span>Loading artist songs...</span>
          </div>
        ) : artistData?.songs && artistData.songs.length > 0 ? (
          <div className="space-y-1">
            {artistData.songs.slice(0, visibleSongsCount).map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isTrackPlaying = isCurrent && isPlaying;
              const isFav = favorites.includes(track.id);

              return (
                <div
                  key={`artist-song-${track.id}-${idx}`}
                  onClick={() => playTrack(track, artistData.songs)}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-xl matte-glass hover:bg-black/5 dark:hover:bg-white/[0.05] border border-border transition-all cursor-pointer select-none",
                    isCurrent && "bg-foreground/5 border-foreground/20"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs tabular-nums text-muted-foreground group-hover:hidden">
                      {idx + 1}
                    </span>
                    <div className="w-5 text-center hidden group-hover:flex items-center justify-center">
                      {isTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current text-foreground" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current text-foreground translate-x-0.5" />
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={track.coverUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (track.youtubeId && !target.src.includes("i.ytimg.com")) {
                            target.src = `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`;
                          } else {
                            target.style.opacity = "0";
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={cn(
                          "text-xs truncate font-normal",
                          isCurrent ? "text-foreground font-medium" : "text-foreground"
                        )}
                      >
                        {track.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {track.album}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Heart
                        className={cn(
                          "w-3.5 h-3.5 transition-all",
                          isFav
                            ? "fill-current text-foreground scale-110"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                      />
                    </button>
                    <span className="text-xs tabular-nums text-muted-foreground font-normal min-w-[36px] text-right">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Load more Songs text button without background */}
            {artistData.songs.length > visibleSongsCount && (
              <div className="pt-2">
                <button
                  onClick={() => setVisibleSongsCount((prev) => prev + 15)}
                  className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-muted-foreground"
                >
                  <span>Load more Songs</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-normal">
            No songs listed for this artist.
          </div>
        )}
      </div>

      {/* SECTION 2: DISCOGRAPHY / ALBUMS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
          <span className="text-sm font-normal text-foreground">Albums</span>
          <span className="text-xs text-muted-foreground">
            {artistData?.albums?.length || 0} albums
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-foreground" />
            <span>Loading albums...</span>
          </div>
        ) : artistData?.albums && artistData.albums.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {artistData.albums.slice(0, visibleAlbumsCount).map((album, idx) => (
                <SpotlightCard
                  key={`artist-album-${album.id}-${idx}`}
                  onClick={() => onOpenAlbum(album.id, artist.name, album.title, album.coverUrl, album.year)}
                  className="cursor-pointer group p-3 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10 mb-2.5 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={album.coverUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "0";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-medium bg-foreground text-background">
                      Album
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-foreground truncate">
                      {album.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {album.year} • {album.genre}
                    </p>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            {/* Load more Albums text button without background */}
            {artistData.albums.length > visibleAlbumsCount && (
              <div className="pt-2">
                <button
                  onClick={() => setVisibleAlbumsCount((prev) => prev + 12)}
                  className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-muted-foreground"
                >
                  <span>Load more Albums</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-normal">
            No albums found for this artist.
          </div>
        )}
      </div>
    </section>
  );
};
