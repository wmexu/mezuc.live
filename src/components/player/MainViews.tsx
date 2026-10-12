"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  Heart,
  Clock,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Music2,
  Disc,
  Check,
  User,
  Shuffle,
  Disc3,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { MOCK_TRACKS, MOCK_ALBUMS, Album } from "@/data/mockTracks";
import { Track } from "@/types/player";
import { Artist } from "@/lib/youtubeService";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { JellyRadio } from "@/components/react-bits/JellyRadio";
import { ArtistPageView } from "./ArtistPageView";
import { getTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const formatTime = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const GENRES = ["all", "ambient", "minimal", "techno"];

export const MainViews: React.FC = () => {
  const activeView = usePlayerStore((s) => s.activeView);
  const setActiveView = usePlayerStore((s) => s.setActiveView);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const queue = usePlayerStore((s) => s.queue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const searchQuery = usePlayerStore((s) => s.searchQuery);
  const setSearchQuery = usePlayerStore((s) => s.setSearchQuery);
  const selectedTag = usePlayerStore((s) => s.selectedTag.toLowerCase());
  const setSelectedTag = usePlayerStore((s) => s.setSelectedTag);
  const quality = usePlayerStore((s) => s.quality);
  const loadUserAudioFile = usePlayerStore((s) => s.loadUserAudioFile);
  const selectedAlbumId = usePlayerStore((s) => s.selectedAlbumId);
  const setSelectedAlbumId = usePlayerStore((s) => s.setSelectedAlbumId);
  const selectedArtist = usePlayerStore((s) => s.selectedArtist);
  const setSelectedArtist = usePlayerStore((s) => s.setSelectedArtist);
  const openArtist = usePlayerStore((s) => s.openArtist);
  const openAlbum = usePlayerStore((s) => s.openAlbum);
  const selectedAlbumMeta = usePlayerStore((s) => s.selectedAlbumMeta);
  const language = usePlayerStore((s) => s.language);
  const username = usePlayerStore((s) => s.username);
  const recentSearchAlbums = usePlayerStore((s) => s.recentSearchAlbums) || [];
  const recentSearchTracks = usePlayerStore((s) => s.recentSearchTracks) || [];
  const addRecentSearchAlbum = usePlayerStore((s) => s.addRecentSearchAlbum);
  const addRecentSearchTrack = usePlayerStore((s) => s.addRecentSearchTrack);
  const clearSearchHistory = usePlayerStore((s) => s.clearSearchHistory);
  const t = getTranslation(language);

  const [libraryTab, setLibraryTab] = useState<"queue" | "favorites">("queue");
  const [apiResults, setApiResults] = useState<Track[]>([]);
  const [apiAlbums, setApiAlbums] = useState<Album[]>([]);
  const [apiArtists, setApiArtists] = useState<Artist[]>([]);
  const [visibleAlbumsCount, setVisibleAlbumsCount] = useState(4);
  const [visibleArtistsCount, setVisibleArtistsCount] = useState(4);
  const [searchSongsPage, setSearchSongsPage] = useState(1);
  const [isLoadingMoreSongs, setIsLoadingMoreSongs] = useState(false);
  const songScrollTriggerRef = useRef<HTMLDivElement>(null);

  // Artist Page Data State
  const [artistData, setArtistData] = useState<{
    artist: Artist;
    songs: Track[];
    albums: Album[];
  } | null>(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);
  const [visibleArtistSongsCount, setVisibleArtistSongsCount] = useState(10);
  const [visibleArtistAlbumsCount, setVisibleArtistAlbumsCount] = useState(6);
  const [isArtistFollowing, setIsArtistFollowing] = useState(false);

  const [remoteAlbumData, setRemoteAlbumData] = useState<{ album: Album; tracks: Track[] } | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasScrolledToPopular, setHasScrolledToPopular] = useState(false);
  const popularTriggerRef = useRef<HTMLDivElement>(null);

  // Fetch Spotify-style Artist Page details when an artist is selected
  useEffect(() => {
    if (!selectedArtist) {
      setArtistData(null);
      setIsLoadingArtist(false);
      return;
    }

    setArtistData(null);
    setIsLoadingArtist(true);
    setVisibleArtistSongsCount(10);
    setVisibleArtistAlbumsCount(6);

    const targetQuery = selectedArtist.name || selectedArtist.id || "";
    fetch(`/api/music/artist/${encodeURIComponent(targetQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.artist) {
          setArtistData(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch artist details:", err))
      .finally(() => setIsLoadingArtist(false));
  }, [selectedArtist]);

  // Lazy load Popular catalog when scrolled to it on search page
  useEffect(() => {
    if (hasScrolledToPopular) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasScrolledToPopular(true);
        }
      },
      { rootMargin: "250px" }
    );
    if (popularTriggerRef.current) {
      observer.observe(popularTriggerRef.current);
    }
    return () => observer.disconnect();
  }, [hasScrolledToPopular, activeView]);

  // Live YouTube Music Search Debounce Effect (Songs, Albums, and Artists)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setApiResults([]);
      setApiAlbums([]);
      setApiArtists([]);
      setIsSearching(false);
      setVisibleAlbumsCount(4);
      setVisibleArtistsCount(4);
      setSearchSongsPage(1);
      return;
    }

    setIsSearching(true);
    setVisibleAlbumsCount(4);
    setVisibleArtistsCount(4);
    setSearchSongsPage(1);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}&limit=25`);
        if (res.ok) {
          const data = await res.json();
          setApiResults(data.tracks || []);
          setApiAlbums(data.albums || []);
          setApiArtists(data.artists || []);
        }
      } catch (err) {
        console.warn("YouTube live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite Scroll Handler: Automatically load 20 more songs when user scrolls to bottom
  const loadMoreSearchSongs = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q || isLoadingMoreSongs) return;

    setIsLoadingMoreSongs(true);
    try {
      const nextPage = searchSongsPage + 1;
      const res = await fetch(
        `/api/music/search?q=${encodeURIComponent(q)}&limit=20&page=${nextPage}`
      );
      if (res.ok) {
        const data = await res.json();
        const incomingTracks: Track[] = data.tracks || [];
        if (incomingTracks.length > 0) {
          setApiResults((prev) => {
            const seen = new Set(prev.map((t) => t.id));
            const fresh = incomingTracks.filter((t) => !seen.has(t.id) && (seen.add(t.id), true));
            return [...prev, ...fresh];
          });
          setSearchSongsPage(nextPage);
        }
      }
    } catch (err) {
      console.warn("Failed to load more songs:", err);
    } finally {
      setIsLoadingMoreSongs(false);
    }
  }, [searchQuery, isLoadingMoreSongs, searchSongsPage, apiResults]);

  useEffect(() => {
    if (activeView !== "search" || !searchQuery.trim()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreSearchSongs();
        }
      },
      { rootMargin: "350px" }
    );

    if (songScrollTriggerRef.current) {
      observer.observe(songScrollTriggerRef.current);
    }
    return () => observer.disconnect();
  }, [activeView, searchQuery, loadMoreSearchSongs]);

  // Remote Album Tracklist Fetcher (artist-aware to prevent same-name collisions)
  useEffect(() => {
    if (!selectedAlbumId) {
      setRemoteAlbumData(null);
      setIsLoadingAlbum(false);
      return;
    }

    // Guard: Do not re-fetch if this album is already loaded into remoteAlbumData
    if (
      remoteAlbumData?.album &&
      (remoteAlbumData.album.id === selectedAlbumId ||
       remoteAlbumData.album.title.toLowerCase() === selectedAlbumId.toLowerCase())
    ) {
      return;
    }

    setRemoteAlbumData(null);
    setIsLoadingAlbum(true);

    const metaArtist = selectedAlbumMeta?.artist;
    const metaTitle = selectedAlbumMeta?.title;
    const queryArtist = metaArtist
      ? `?artist=${encodeURIComponent(metaArtist)}&title=${encodeURIComponent(metaTitle || "")}`
      : "";

    fetch(`/api/music/album/${encodeURIComponent(selectedAlbumId)}${queryArtist}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.album && data.tracks && data.tracks.length > 0) {
          setRemoteAlbumData(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch remote album:", err))
      .finally(() => setIsLoadingAlbum(false));
  }, [selectedAlbumId]);

  // Filtered tracks for Discover / Flow
  const filteredTracks = useMemo(() => {
    return MOCK_TRACKS.filter((t) => {
      if (selectedTag !== "all" && t.genre?.toLowerCase() !== selectedTag) {
        return false;
      }
      return true;
    });
  }, [selectedTag]);

  // Active album for Album Detail view
  const activeAlbum: Album = useMemo(() => {
    if (
      remoteAlbumData?.album &&
      (remoteAlbumData.album.id === selectedAlbumId ||
       remoteAlbumData.album.title.toLowerCase() === (selectedAlbumId || "").toLowerCase())
    ) {
      return remoteAlbumData.album;
    }
    if (!selectedAlbumId) return MOCK_ALBUMS[0];

    // 1. Check recent search albums
    const foundInRecent = recentSearchAlbums.find(
      (a) =>
        a.id.toLowerCase() === selectedAlbumId.toLowerCase() ||
        a.title.toLowerCase() === selectedAlbumId.toLowerCase()
    );
    if (foundInRecent) return foundInRecent;

    // 2. Check api search albums
    const foundInApi = apiAlbums.find(
      (a) =>
        a.id.toLowerCase() === selectedAlbumId.toLowerCase() ||
        a.title.toLowerCase() === selectedAlbumId.toLowerCase()
    );
    if (foundInApi) return foundInApi;

    // 3. Check mock albums
    const found = MOCK_ALBUMS.find(
      (a) =>
        a.id.toLowerCase() === selectedAlbumId.toLowerCase() ||
        a.title.toLowerCase() === selectedAlbumId.toLowerCase() ||
        a.trackIds.includes(selectedAlbumId)
    );
    if (found) return found;

    // 4. Use selectedAlbumMeta
    if (selectedAlbumMeta && selectedAlbumMeta.id === selectedAlbumId) {
      const cleanTitle =
        selectedAlbumMeta.title && !selectedAlbumMeta.title.startsWith("MPRE")
          ? selectedAlbumMeta.title
          : selectedAlbumMeta.artist
          ? `${selectedAlbumMeta.artist} Album`
          : "Album";
      return {
        id: selectedAlbumId,
        title: cleanTitle,
        artist: selectedAlbumMeta.artist || "Artist",
        year: selectedAlbumMeta.year || "2024",
        genre: "Album",
        tracksCount: 1,
        totalDuration: 1800,
        coverUrl: selectedAlbumMeta.coverUrl || "",
        notes: `${selectedAlbumMeta.artist || "Artist"} — ${cleanTitle}`,
        trackIds: [],
      };
    }

    const safeTitle = selectedAlbumId.startsWith("MPRE") ? "Album" : selectedAlbumId;
    return {
      id: selectedAlbumId,
      title: safeTitle,
      artist: "Artist",
      year: "2024",
      genre: "Album",
      tracksCount: 1,
      totalDuration: 1800,
      coverUrl: "",
      notes: safeTitle,
      trackIds: [],
    };
  }, [selectedAlbumId, remoteAlbumData, recentSearchAlbums, apiAlbums, selectedAlbumMeta]);

  // Tracks for active album in Album Detail view
  const albumTracks = useMemo(() => {
    if (remoteAlbumData?.tracks && remoteAlbumData.tracks.length > 0) {
      return remoteAlbumData.tracks;
    }
    // Only return mock tracks that explicitly belong to this active album
    const tracks = MOCK_TRACKS.filter(
      (t) =>
        t.album.toLowerCase() === activeAlbum.title.toLowerCase() ||
        activeAlbum.trackIds.includes(t.id)
    );
    // Never fall back to random songs from other artists while loading
    return tracks;
  }, [activeAlbum, remoteAlbumData]);

  // Search filtered tracks: live YouTube API results when searched (empty when search bar is empty)
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const base =
      apiResults.length > 0
        ? apiResults
        : MOCK_TRACKS.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.artist.toLowerCase().includes(q) ||
              t.album.toLowerCase().includes(q) ||
              t.genre?.toLowerCase().includes(q)
          );
    const seen = new Set<string>();
    return base.filter((t) => !seen.has(t.id) && (seen.add(t.id), true));
  }, [searchQuery, apiResults]);

  // Search filtered albums: live YouTube API results when searched (empty when search bar is empty)
  const searchAlbumResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    if (apiAlbums.length > 0) return apiAlbums;
    return MOCK_ALBUMS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.genre?.toLowerCase().includes(q)
    );
  }, [searchQuery, apiAlbums]);

  // Search filtered artists: live YouTube API results with accent-insensitive matching
  const searchArtistResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    if (apiArtists.length > 0) return apiArtists;

    const mockArtists: Artist[] = [
      { id: "tame-impala", name: "Tame Impala", avatarUrl: MOCK_TRACKS[0].coverUrl, subscribers: "12M monthly listeners" },
      { id: "arctic-monkeys", name: "Arctic Monkeys", avatarUrl: MOCK_TRACKS[1].coverUrl, subscribers: "35M monthly listeners" },
      { id: "lady-gaga", name: "Lady Gaga & Bruno Mars", avatarUrl: MOCK_TRACKS[2].coverUrl, subscribers: "70M monthly listeners" },
      { id: "djo", name: "Djo", avatarUrl: MOCK_TRACKS[3].coverUrl, subscribers: "18M monthly listeners" },
      { id: "the-neighbourhood", name: "The Neighbourhood", avatarUrl: MOCK_TRACKS[4].coverUrl, subscribers: "25M monthly listeners" },
      { id: "the-weeknd", name: "The Weeknd", avatarUrl: MOCK_TRACKS[5].coverUrl, subscribers: "110M monthly listeners" },
      { id: "kendrick-lamar", name: "Kendrick Lamar", avatarUrl: MOCK_TRACKS[6].coverUrl, subscribers: "65M monthly listeners" },
      { id: "daft-punk", name: "Daft Punk", avatarUrl: MOCK_TRACKS[2].coverUrl, subscribers: "22M monthly listeners" },
      { id: "kaarija", name: "Käärijä", avatarUrl: "", subscribers: "3.2M monthly listeners" },
    ];
    return mockArtists.filter((a) => a.name.toLowerCase().includes(q));
  }, [searchQuery, apiArtists]);

  // Favorite tracks
  const favoriteTracks = useMemo(() => {
    return MOCK_TRACKS.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  const featuredTrack = MOCK_TRACKS[0];
  const isFeaturedPlaying = isPlaying && currentTrack?.id === featuredTrack.id;
  const isAlbumPlaying = isPlaying && albumTracks.some((t) => t.id === currentTrack?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-[210px] sm:pt-28 pb-48 font-normal w-full overflow-x-hidden">
      {selectedArtist && activeView !== "search" ? (
        <ArtistPageView
          artist={selectedArtist}
          onBack={() => setSelectedArtist(null)}
          onOpenAlbum={(albumId, artistName, albumTitle, coverUrl, year) =>
            openAlbum(albumId, artistName, albumTitle, coverUrl, year)
          }
        />
      ) : (
        <>
          {/* VIEW 1: FLOW (DISCOVER / HOME or ALBUM DETAIL) */}
          {activeView === "player" && (
        <>
          {/* BRANCH A: ALBUM DETAIL VIEW (When an album is opened) */}
          {selectedAlbumId ? (
            <section className="space-y-6">
              {/* Back to Catalog / Home Navigation Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedAlbumId(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full matte-glass text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer border border-border group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>{t.backToCatalog}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.album}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {activeAlbum.title}
                  </span>
                </div>
              </div>

              {/* Hero Album Card with Matte Glass Screen Protector Effect */}
              <SpotlightCard className="overflow-hidden p-6 sm:p-10 matte-glass">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
                    {/* Hero Artwork */}
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0 group shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeAlbum.coverUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "0";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    </div>

                    {/* Hero Information */}
                    <div className="flex flex-col space-y-2 justify-center">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-[10px] tracking-widest text-muted-foreground px-2 py-0.5 rounded matte-glass border border-border font-normal">
                          {t.featuredMaster}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {activeAlbum.year} • {activeAlbum.genre}
                        </span>
                      </div>

                      <h2
                        className="text-foreground font-normal tracking-[-0.035em] text-[clamp(28px,3.8vw,56px)] leading-[1.08]"
                        style={{
                          fontFamily: "var(--font-geist-sans), sans-serif",
                        }}
                      >
                        {activeAlbum.title}
                      </h2>

                      <p className="text-sm sm:text-base text-muted-foreground font-normal">
                        {activeAlbum.artist} — {activeAlbum.title}
                      </p>

                      <p className="text-xs text-muted-foreground/80 max-w-xl font-normal leading-relaxed">
                        {activeAlbum.notes}
                      </p>

                      {/* Micro specs */}
                      <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] text-muted-foreground tabular-nums font-normal">
                        <span>{formatTime(activeAlbum.totalDuration)}</span>
                        <span>•</span>
                        <span>{activeAlbum.tracksCount} {t.tracksCount}</span>
                        <span>•</span>
                        <span>24-bit 96kHz</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Right Action: Master Play / Favorite / Quality Pill */}
                  <div className="flex flex-col items-center lg:items-end gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (isAlbumPlaying) {
                            togglePlay();
                          } else if (albumTracks.length > 0) {
                            addRecentSearchAlbum(activeAlbum);
                            playTrack(albumTracks[0], albumTracks);
                          }
                        }}
                        className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-foreground text-background font-normal text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                      >
                        {isAlbumPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>{t.pauseMaster}</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>{t.playMaster}</span>
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={() => {
                          if (albumTracks[0]) toggleFavorite(albumTracks[0].id);
                        }}
                        className="p-3 rounded-full matte-glass text-foreground hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer border border-border"
                      >
                        <Heart
                          className={cn(
                            "w-4 h-4",
                            albumTracks[0] &&
                              favorites.includes(albumTracks[0].id) &&
                              "fill-current text-current"
                          )}
                        />
                      </button>
                    </div>

                    {/* Clean Quality Badge */}
                    <div className="flex items-center justify-center px-3 py-1.5 rounded-full matte-glass border border-border">
                      <span className="text-[10px] tracking-wider text-muted-foreground font-normal">
                        {quality === "lossless"
                          ? "Lossless 96kHz"
                          : quality === "high"
                          ? "High 24-bit"
                          : "Normal 320k"}
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Tighter Section for Genre Filter Tabs & Song List (mt-3.5 directly under buttons) */}
              <div className="space-y-3.5 pt-2">
                {/* Genre Filter Tabs using JellyRadio */}
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <JellyRadio
                      items={[
                        { value: "all", label: t.all },
                        { value: "ambient", label: t.ambient },
                        { value: "minimal", label: t.minimal },
                        { value: "techno", label: t.techno },
                      ]}
                      value={selectedTag}
                      onChange={(val) => setSelectedTag(val)}
                      size="sm"
                      gap={6}
                      radius={16}
                      swell={0.08}
                      barge={2}
                      shrink={0.04}
                      jelly={0.8}
                      bounce={0.2}
                      stagger={16}
                      stiffness={580}
                    />
                  </div>

                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:flex items-center font-normal">
                    {albumTracks.length} {t.tracksCount}
                  </span>
                </div>

                {/* Spotify-style Track Table enclosed in Matte Glass Panel — directly mt-3.5 under buttons */}
                <div className="matte-glass backdrop-blur-[48px] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-border shadow-2xl">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-[11px] tracking-wider text-muted-foreground border-b border-border items-center">
                    <div className="col-span-1 flex items-center justify-center text-center font-normal">
                      {t.colNumber}
                    </div>
                    <div className="col-span-6 sm:col-span-5 flex items-center font-normal">
                      {t.colTitle}
                    </div>
                    <div className="hidden sm:flex sm:col-span-3 items-center font-normal">
                      {t.colAlbum}
                    </div>
                    <div className="hidden sm:flex sm:col-span-2 items-center justify-center text-center font-normal">
                      {t.colQuality}
                    </div>
                    <div className="col-span-5 sm:col-span-1 flex items-center justify-end pr-2 font-normal">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {isLoadingAlbum ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                      <span className="text-xs font-normal">Loading master album tracks...</span>
                    </div>
                  ) : albumTracks.length === 0 ? (
                    <div className="py-16 text-center text-xs text-muted-foreground font-normal">
                      No tracks available in this album
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1.5">
                      {albumTracks.map((track, idx) => {
                        const isThisTrack = currentTrack?.id === track.id;
                        const isThisPlaying = isThisTrack && isPlaying;
                        const isFav = favorites.includes(track.id);

                        return (
                          <div
                            key={track.id}
                            onClick={() => {
                              addRecentSearchAlbum(activeAlbum);
                              playTrack(track, albumTracks);
                            }}
                            className={cn(
                              "grid grid-cols-12 gap-4 px-4 py-3 rounded-xl items-center cursor-pointer group transition-all duration-200 select-none",
                              isThisTrack
                                ? "bg-foreground/10 border border-foreground/20"
                                : "hover:bg-foreground/5 border border-transparent"
                            )}
                          >
                            {/* Column 1: Index / Play Icon */}
                          <div className="col-span-1 flex items-center justify-center text-center text-xs font-normal">
                            <span
                              className={cn(
                                "group-hover:hidden tabular-nums flex items-center justify-center",
                                isThisPlaying
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {(idx + 1).toString().padStart(2, "0")}
                            </span>
                            <button
                              type="button"
                              className="hidden group-hover:flex items-center justify-center text-foreground focus:outline-none"
                            >
                              {isThisPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current" />
                              )}
                            </button>
                          </div>

                          {/* Column 2: Artwork & Title / Artist */}
                          <div className="col-span-6 sm:col-span-5 flex items-center gap-3.5 min-w-0">
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
                            <div className="flex flex-col min-w-0 justify-center">
                              <span
                                className={cn(
                                  "text-sm truncate font-normal tracking-tight",
                                  isThisTrack
                                    ? "text-foreground font-medium"
                                    : "text-foreground/90"
                                )}
                              >
                                {track.title}
                              </span>
                              <span className="text-xs text-muted-foreground truncate font-normal">
                                {track.artist}
                              </span>
                            </div>
                          </div>

                          {/* Column 3: Album */}
                          <div className="hidden sm:flex sm:col-span-3 items-center text-xs text-muted-foreground truncate font-normal">
                            {track.album}
                          </div>

                          {/* Column 4: Bitrate / Quality */}
                          <div className="hidden sm:flex sm:col-span-2 items-center justify-center text-center text-[11px] text-muted-foreground font-normal">
                            {track.bitrate}
                          </div>

                          {/* Column 5: Duration & Actions */}
                          <div className="col-span-5 sm:col-span-1 flex items-center justify-end gap-2 pr-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(track.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity focus:outline-none flex items-center justify-center cursor-pointer"
                            >
                              <Heart
                                className={cn(
                                  "w-3.5 h-3.5",
                                  isFav && "opacity-100 fill-current text-current"
                                )}
                              />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(track);
                              }}
                              title="Add to queue"
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity focus:outline-none flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-xs tabular-nums text-muted-foreground select-none font-normal">
                              {formatTime(track.duration)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            </section>
          ) : (
            /* BRANCH B: SPOTIFY-STYLE MAIN PAGE (In our minimalist matte glass aesthetic) */
            <section className="space-y-10">
              {/* Top Filter Tabs & Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <JellyRadio
                    items={[
                      { value: "all", label: t.all },
                      { value: "ambient", label: t.ambient },
                      { value: "minimal", label: t.minimal },
                      { value: "techno", label: t.techno },
                    ]}
                    value={selectedTag}
                    onChange={(val) => setSelectedTag(val)}
                    size="sm"
                    gap={6}
                    radius={16}
                    swell={0.08}
                    barge={2}
                    shrink={0.04}
                    jelly={0.8}
                    bounce={0.2}
                    stagger={16}
                    stiffness={580}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      isPlaying
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] border border-black/20 dark:border-white/20"
                    )}
                  />
                  <span className="truncate max-w-xs sm:max-w-md">
                    {isPlaying
                      ? `${t.sessionFlow} • ${currentTrack?.title || "Master"}`
                      : t.sessionPaused}
                  </span>
                </div>
              </div>

              {/* 1. Quick 6 Cards Grid (2 in line on mobile with small gaps, 3 on desktop) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {MOCK_TRACKS.slice(0, 6).map((track) => {
                  const isThisTrack = currentTrack?.id === track.id;
                  const isThisPlaying = isThisTrack && isPlaying;

                  return (
                    <div
                      key={`quick-${track.id}`}
                      onClick={() => playTrack(track, MOCK_TRACKS)}
                      className={cn(
                        "group relative flex items-center gap-2 sm:gap-3.5 p-1.5 sm:p-2 rounded-xl matte-glass border border-border transition-all cursor-pointer overflow-hidden shadow-sm",
                        isThisTrack
                          ? "bg-foreground/10 border-foreground/30"
                          : "hover:bg-foreground/10"
                      )}
                    >
                      {/* Thumbnail Cover */}
                      <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10 shadow-sm">
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Text info */}
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {track.title}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {track.artist}
                        </span>
                      </div>

                      {/* Play / Equalizer State */}
                      <div className="pr-1.5 sm:pr-3 flex items-center shrink-0">
                        {isThisPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4">
                            <span className="w-0.5 sm:w-1 bg-foreground animate-[pulse_0.8s_ease-in-out_infinite] h-full rounded-full" />
                            <span className="w-0.5 sm:w-1 bg-foreground animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-3/4 rounded-full" />
                            <span className="w-0.5 sm:w-1 bg-foreground animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-1/2 rounded-full" />
                          </div>
                        ) : (
                          <motion.div
                            initial={false}
                            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                          >
                            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Section: Start Here / Featured Master + Daily Mixes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl text-foreground font-normal tracking-[-0.03em]">
                    {t.startHere}
                  </h3>
                  <button
                    onClick={() => setSelectedAlbumId(MOCK_ALBUMS[0].id)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t.showAll}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Big Featured Card (Master Resonance aligned and balanced) */}
                  <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 rounded-2xl matte-glass border border-border flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                    <div className="space-y-4 z-10 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded matte-glass border border-border font-normal">
                          {t.featuredMaster}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          24-bit 96kHz
                        </span>
                      </div>

                      <h4
                        className="text-2xl sm:text-3xl text-foreground font-normal tracking-tight leading-snug"
                        style={{
                          fontFamily: "var(--font-geist-sans), sans-serif",
                        }}
                      >
                        3. Master Resonance
                      </h4>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {t.featuredMasterDesc}
                      </p>
                    </div>

                    {/* Bottom action buttons: aligned with bottom and left edges */}
                    <div className="flex items-center gap-3 mt-auto pt-8 z-10">
                      <button
                        onClick={() => playTrack(MOCK_TRACKS[0], MOCK_TRACKS)}
                        className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-normal hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                      >
                        {t.playMaster}
                      </button>

                      <button
                        onClick={() => openAlbum(MOCK_ALBUMS[0].id, MOCK_ALBUMS[0].artist, MOCK_ALBUMS[0].title, MOCK_ALBUMS[0].coverUrl, MOCK_ALBUMS[0].year)}
                        className="px-4 py-2.5 rounded-full matte-glass text-foreground text-xs hover:bg-foreground/10 transition-colors border border-border cursor-pointer font-normal"
                      >
                        {t.openAlbum}
                      </button>
                    </div>

                    {/* Circular play decoration: aligned with bottom and right gaps matching padding */}
                    <div className="absolute right-6 sm:right-8 bottom-6 sm:bottom-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-foreground/[0.04] border border-foreground/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300 pointer-events-none shadow-sm">
                      <Play className="w-8 h-8 text-foreground/20 fill-foreground/10 translate-x-0.5" />
                    </div>
                  </SpotlightCard>

                  {/* Right: Curated Daily Mixes #1, #2, #3 */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground tracking-wide font-normal">
                        {t.curatedForYou}, <strong className="text-foreground font-medium">{username.trim() || "guest"}</strong>
                      </span>
                      <span className="text-[11px] text-muted-foreground">{t.mixesCount}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 flex-1">
                      {[
                        {
                          num: 1,
                          title: `${t.dailyMixPrefix} #1`,
                          artists: "Tame Impala, Djo",
                          genre: "Psych-Pop",
                          albumId: MOCK_ALBUMS[0].id,
                          coverUrl: MOCK_ALBUMS[0].coverUrl,
                        },
                        {
                          num: 2,
                          title: `${t.dailyMixPrefix} #2`,
                          artists: "Arctic Monkeys",
                          genre: "Indie Rock",
                          albumId: MOCK_ALBUMS[1].id,
                          coverUrl: MOCK_ALBUMS[1].coverUrl,
                        },
                        {
                          num: 3,
                          title: `${t.dailyMixPrefix} #3`,
                          artists: "Daft Punk, Kendrick",
                          genre: "Electronic / Hip-Hop",
                          albumId: MOCK_ALBUMS[2].id,
                          coverUrl: MOCK_ALBUMS[2].coverUrl,
                        },
                      ].map((mix) => (
                        <div
                          key={`mix-${mix.num}`}
                          onClick={() => setSelectedAlbumId(mix.albumId)}
                          className="group p-3.5 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10 mb-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mix.coverUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = "0";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-foreground text-background">
                              #{mix.num}
                            </div>
                            <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-medium text-foreground truncate">
                              {mix.title}
                            </h5>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {mix.artists}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Section: Keep Listening / Curated Albums & Artists */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl text-foreground font-normal tracking-[-0.03em]">
                    {t.keepListening}
                  </h3>
                  <button
                    onClick={() => setSelectedAlbumId(MOCK_ALBUMS[1].id)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t.showAll}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Albums and Artists Cards matching Reference 2 & 3 */}
                  {MOCK_ALBUMS.map((album) => (
                    <SpotlightCard
                      key={`album-card-${album.id}`}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="cursor-pointer group p-3.5 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 mb-3 shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={album.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = "0";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Floating Play Button on hover */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.08 }}
                          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </motion.div>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm text-foreground truncate font-normal">
                          {album.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-normal">
                          {album.artist}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border font-normal">
                          <span>{album.genre}</span>
                          <span className="tabular-nums">{album.year}</span>
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}

                  {/* Circular Artist Cards like Tame Impala and Radiohead in Reference 2 & 3 */}
                  {[
                    {
                      name: "Tame Impala",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[0].coverUrl,
                      track: MOCK_TRACKS[0],
                    },
                    {
                      name: "Arctic Monkeys",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[1].coverUrl,
                      track: MOCK_TRACKS[1],
                    },
                    {
                      name: "Lady Gaga & Bruno",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[2].coverUrl,
                      track: MOCK_TRACKS[2],
                    },
                    {
                      name: "Djo",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[3].coverUrl,
                      track: MOCK_TRACKS[3],
                    },
                    {
                      name: "The Neighbourhood",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[4].coverUrl,
                      track: MOCK_TRACKS[4],
                    },
                    {
                      name: "Kendrick Lamar",
                      role: t.artistRole,
                      coverUrl: MOCK_TRACKS[6].coverUrl,
                      track: MOCK_TRACKS[6],
                    },
                  ].map((artist) => (
                    <SpotlightCard
                      key={`artist-${artist.name}`}
                      onClick={() => playTrack(artist.track, MOCK_TRACKS)}
                      className="cursor-pointer group p-3.5 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-square rounded-full overflow-hidden bg-black/40 border border-white/10 mb-3 shadow-[0_10px_20px_rgba(0,0,0,0.4)] mx-auto w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={artist.coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = "0";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-full"
                        />

                        {/* Floating Play Button on hover */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.08 }}
                          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </motion.div>
                      </div>

                      <div className="text-center sm:text-left">
                        <h4 className="text-xs sm:text-sm text-foreground truncate font-normal">
                          {artist.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-normal">
                          {artist.role}
                        </p>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>

              {/* 4. Section: Recently Played */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl text-foreground font-normal tracking-[-0.03em]">
                    {t.recentlyPlayed}
                  </h3>
                  <span className="text-xs text-muted-foreground">{t.sessionArchive}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {MOCK_TRACKS.slice(6, 10).map((track) => (
                    <div
                      key={`recent-${track.id}`}
                      onClick={() => playTrack(track, MOCK_TRACKS)}
                      className="group p-3 rounded-xl matte-glass border border-border hover:bg-foreground/5 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className="text-xs font-medium text-foreground truncate">
                          {track.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {track.artist}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* VIEW 2: SEARCH */}
      {activeView === "search" && (
        <section className="space-y-8">
          <div className="flex flex-col space-y-2">
            <h2
              className="text-foreground font-normal tracking-[-0.035em] text-[clamp(40px,4.5vw,68px)] leading-[1.08]"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              {t.searchAndCurate}
            </h2>
            <p className="text-sm text-muted-foreground font-normal">
              Filter through pristine monochromatic catalog or explore sonic
              textures.
            </p>
          </div>

          {/* Search Category Tiles: 2 horizontal lines on mobile with touch swipe, standard 4 cols on desktop */}
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[minmax(160px,180px)] sm:auto-cols-auto sm:grid-flow-row sm:grid-rows-none sm:grid-cols-4 gap-2.5 sm:gap-4 overflow-x-auto sm:overflow-x-visible no-scrollbar overscroll-x-contain touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {[
              { label: "Top Global Hits", query: "Top Hits 2025" },
              { label: "The Weeknd & R&B", query: "The Weeknd" },
              { label: "Daft Punk & House", query: "Daft Punk" },
              { label: "Hip-Hop & Trap", query: "Travis Scott" },
              { label: "Indie Rock & AM", query: "Arctic Monkeys" },
              { label: "Psychedelic Pop", query: "Tame Impala" },
              { label: "West Coast Hip-Hop", query: "Kendrick Lamar" },
              { label: "Neo-Soul & Acoustic", query: "Frank Ocean" },
            ].map((cat) => (
              <SpotlightCard
                key={cat.label}
                onClick={() => setSearchQuery(cat.query)}
                className="cursor-pointer p-4 matte-glass border border-border hover:border-foreground/20 transition-all shrink-0 select-none"
              >
                <div className="text-sm text-foreground font-normal">
                  {cat.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 font-normal">
                  tag: #{cat.query.toLowerCase()}
                </div>
              </SpotlightCard>
            ))}
          </div>

          {/* ============================================================ */}
          {/* BRANCH A: ACTIVE SEARCH QUERY RESULTS                         */}
          {/* ============================================================ */}
          {searchQuery.trim().length > 0 ? (
            <>
              {/* Albums and Artists Search Results Mixed Section */}
              {(searchAlbumResults.length > 0 || searchArtistResults.length > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                    <div className="flex items-center gap-2">
                      <Disc className="w-3.5 h-3.5" />
                      <span>Albums and Artists ({searchAlbumResults.length + searchArtistResults.length})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {/* First 4 (or visible count) Artists: Circular Avatar with +100 font-weight on name (font-semibold) */}
                    {searchArtistResults.slice(0, visibleArtistsCount).map((artist, idx) => (
                      <SpotlightCard
                        key={`search-artist-${artist.id || artist.name}-${idx}`}
                        onClick={() => openArtist(artist.name, artist.avatarUrl, artist.id)}
                        className="cursor-pointer group p-3 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-square rounded-full overflow-hidden bg-black/40 border border-white/10 mb-2.5 shadow-md mx-auto w-full flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {artist.avatarUrl ? (
                            <img
                              src={artist.avatarUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-full"
                            />
                          ) : null}
                          <User className="w-8 h-8 text-muted-foreground/30 absolute pointer-events-none -z-0" />
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-medium bg-foreground text-background">
                            Artist
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-foreground truncate">
                            {artist.name}
                          </h5>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {artist.subscribers || "Verified Artist"}
                          </p>
                        </div>
                      </SpotlightCard>
                    ))}

                    {/* First 4 (or visible count) Albums: Standard Album Card */}
                    {searchAlbumResults.slice(0, visibleAlbumsCount).map((album, idx) => (
                      <SpotlightCard
                        key={`search-album-${album.id}-${idx}`}
                        onClick={() => {
                          addRecentSearchAlbum(album);
                          openAlbum(album.id, album.artist, album.title, album.coverUrl, album.year);
                        }}
                        className="cursor-pointer group p-3 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/10 mb-2.5 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={album.coverUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
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
                            {album.artist}
                          </p>
                          <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                            {album.year}
                          </span>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>

                  {/* Buttons at the end of the mixed Albums and Artists list: text only, no background */}
                  <div className="flex items-center gap-5 pt-2">
                    {visibleAlbumsCount < searchAlbumResults.length && (
                      <button
                        onClick={() => setVisibleAlbumsCount((prev) => prev + 8)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center font-normal"
                      >
                        Load more Albums
                      </button>
                    )}
                    {visibleArtistsCount < searchArtistResults.length && (
                      <button
                        onClick={() => setVisibleArtistsCount((prev) => prev + 8)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center font-semibold"
                      >
                        Load more Artists
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Songs Search Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                  <div className="flex items-center gap-2">
                    <span>Songs ({searchResults.length})</span>
                    {isSearching && (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Searching YouTube Music...</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-foreground transition-colors font-normal cursor-pointer"
                  >
                    Clear filter
                  </button>
                </div>

                <div className="space-y-1">
                  {searchResults.map((track, idx) => (
                    <div
                      key={`search-${track.id}-${idx}`}
                      onClick={() => {
                        addRecentSearchTrack(track);
                        playTrack(track, searchResults);
                      }}
                      className="flex items-center justify-between p-3.5 rounded-xl matte-glass hover:bg-black/5 dark:hover:bg-white/[0.05] border border-border transition-all cursor-pointer group w-full min-w-0 overflow-hidden"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={track.coverUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-foreground truncate font-normal tracking-tight">
                              {track.title}
                            </span>
                            {track.source === "youtube" && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded matte-glass border border-border text-muted-foreground shrink-0 font-medium">
                                YT Music
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate font-normal">
                            {track.artist} • {track.album}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 font-normal shrink-0 pl-2">
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {track.bitrate}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatTime(track.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(track);
                          }}
                          className="p-1.5 rounded matte-glass text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer border border-border shrink-0"
                          title="Add to queue"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Trigger for Search Songs */}
                <div ref={songScrollTriggerRef} className="py-4 text-center">
                  {isLoadingMoreSongs ? (
                    <span className="text-xs text-muted-foreground font-semibold inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
                      <span>Loading..</span>
                    </span>
                  ) : searchResults.length >= 20 ? (
                    <span className="text-xs text-muted-foreground font-semibold">
                      Loading..
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            /* ============================================================ */
            /* BRANCH B: EMPTY SEARCH QUERY (RECENTS & LAZY POPULAR)         */
            /* ============================================================ */
            <div className="space-y-8">
              {/* 1. RECENTS SECTION */}
              {(recentSearchAlbums.length > 0 || recentSearchTracks.length > 0) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recents</span>
                    </div>
                    <button
                      onClick={clearSearchHistory}
                      className="hover:text-foreground transition-colors font-normal cursor-pointer text-[11px]"
                    >
                      Clear history
                    </button>
                  </div>

                  {/* Recent Albums (Desktop: max 6, Mobile: max 4) */}
                  {recentSearchAlbums.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs text-muted-foreground font-normal tracking-wide">
                        Recent Albums
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {recentSearchAlbums.slice(0, 6).map((album, idx) => (
                          <SpotlightCard
                            key={`recent-album-${album.id}-${idx}`}
                            onClick={() => {
                              addRecentSearchAlbum(album);
                              openAlbum(album.id, album.artist, album.title, album.coverUrl, album.year);
                            }}
                            className={cn(
                              "cursor-pointer group p-3 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between",
                              idx >= 4 && "hidden sm:flex"
                            )}
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
                                {album.artist}
                              </p>
                              <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                                {album.year}
                              </span>
                            </div>
                          </SpotlightCard>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Songs (Under recent albums, max 20 songs) */}
                  {recentSearchTracks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs text-muted-foreground font-normal tracking-wide">
                        Recent Songs
                      </h4>
                      <div className="space-y-1">
                        {recentSearchTracks.slice(0, 20).map((track, idx) => (
                          <div
                            key={`recent-track-${track.id}-${idx}`}
                            onClick={() => {
                              addRecentSearchTrack(track);
                              playTrack(track, recentSearchTracks);
                            }}
                            className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl matte-glass hover:bg-black/5 dark:hover:bg-white/[0.05] border border-border transition-all cursor-pointer group w-full min-w-0 overflow-hidden"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
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
                              <div className="flex flex-col min-w-0 flex-1 justify-center">
                                <span className="text-sm text-foreground truncate font-normal tracking-tight">
                                  {track.title}
                                </span>
                                <span className="text-xs text-muted-foreground truncate font-normal">
                                  {track.artist} • {track.album}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 sm:gap-4 font-normal shrink-0 pl-2">
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {formatTime(track.duration)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToQueue(track);
                                }}
                                className="p-1.5 rounded matte-glass text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer border border-border shrink-0"
                                title="Add to queue"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. POPULAR SECTION (Lazy loaded only when user scrolls to it) */}
              <div ref={popularTriggerRef} className="space-y-6 pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Popular</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Trending Masters</span>
                </div>

                {!hasScrolledToPopular ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-foreground" />
                    <span className="text-xs font-normal">Scroll to load popular catalog...</span>
                  </div>
                ) : (
                  <>
                    {/* 6 Popular Albums for Desktop, 4 for Mobile */}
                    <div className="space-y-3">
                      <h4 className="text-xs text-muted-foreground font-normal tracking-wide">
                        Popular Albums
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {MOCK_ALBUMS.slice(0, 6).map((album, idx) => (
                          <SpotlightCard
                            key={`popular-album-${album.id}-${idx}`}
                            onClick={() => {
                              addRecentSearchAlbum(album);
                              openAlbum(album.id, album.artist, album.title, album.coverUrl, album.year);
                            }}
                            className={cn(
                              "cursor-pointer group p-3 rounded-xl matte-glass border border-border hover:border-foreground/25 transition-all flex flex-col justify-between",
                              idx >= 4 && "hidden sm:flex"
                            )}
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
                                Popular
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-foreground truncate">
                                {album.title}
                              </h5>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {album.artist}
                              </p>
                              <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                                {album.year}
                              </span>
                            </div>
                          </SpotlightCard>
                        ))}
                      </div>
                    </div>

                    {/* 10 Popular Songs after that */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs text-muted-foreground font-normal tracking-wide">
                        Popular Songs
                      </h4>
                      <div className="space-y-1">
                        {MOCK_TRACKS.slice(0, 10).map((track) => (
                          <div
                            key={`popular-track-${track.id}`}
                            onClick={() => {
                              addRecentSearchTrack(track);
                              playTrack(track, MOCK_TRACKS);
                            }}
                            className="flex items-center justify-between p-3.5 rounded-xl matte-glass hover:bg-black/5 dark:hover:bg-white/[0.05] border border-border transition-all cursor-pointer group w-full min-w-0 overflow-hidden"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={track.coverUrl}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1 justify-center">
                                <span className="text-sm text-foreground truncate font-normal tracking-tight">
                                  {track.title}
                                </span>
                                <span className="text-xs text-muted-foreground truncate font-normal">
                                  {track.artist} • {track.album}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 sm:gap-4 font-normal shrink-0 pl-2">
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {formatTime(track.duration)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToQueue(track);
                                }}
                                className="p-1.5 rounded matte-glass text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer border border-border shrink-0"
                                title="Add to queue"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* VIEW 3: LIBRARY & QUEUE */}
      {activeView === "library" && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2
                className="text-foreground font-normal tracking-[-0.035em] text-[clamp(40px,4.5vw,68px)] leading-[1.08]"
                style={{
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontWeight: 400,
                }}
              >
                {t.soundArchive}
              </h2>
              <p className="text-sm text-muted-foreground font-normal">
                Session queue, saved favorites, and lossless local master
                imports.
              </p>
            </div>

            {/* Library sub tabs using JellyRadio */}
            <div className="flex items-center justify-center">
              <JellyRadio
                items={[
                  { value: "queue", label: `${t.queue} (${queue.length})` },
                  { value: "favorites", label: `${t.favorites} (${favoriteTracks.length})` },
                ]}
                value={libraryTab}
                onChange={(val) => setLibraryTab(val as "queue" | "favorites")}
                chipColor="#27272a"
                activeColor="#f5f5f5"
                textColor="#f5f5f5"
                activeTextColor="#18181b"
                size="sm"
                gap={6}
                radius={16}
                swell={0.08}
                barge={2}
                shrink={0.04}
                jelly={0.8}
                bounce={0.2}
                stagger={16}
                stiffness={580}
              />
            </div>
          </div>

          {/* Drag & Drop Audio Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("audio/")) {
                loadUserAudioFile(file);
              }
            }}
            className="p-6 rounded-2xl border border-dashed border-border hover:border-foreground/30 matte-glass transition-all text-center flex flex-col items-center justify-center space-y-2 cursor-pointer group"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "audio/*";
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) loadUserAudioFile(file);
              };
              input.click();
            }}
          >
            <Upload className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="text-sm text-foreground font-normal">
              Drag & Drop Local Master Audio File
            </div>
            <div className="text-xs text-muted-foreground font-normal">
              Supports FLAC, WAV, AIFF, and MP3. Instant zero-latency decoding.
            </div>
          </div>

          {/* Queue Tab Content */}
          {libraryTab === "queue" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                <span>Now Playing & Up Next</span>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors font-normal cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.clearQueue}</span>
                  </button>
                )}
              </div>

              {queue.map((track, i) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                  <div
                    key={`q-${track.id}-${i}`}
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all select-none font-normal min-w-0 w-full overflow-hidden",
                      isCurrent
                        ? "matte-glass border-foreground/30"
                        : "matte-glass border-border hover:bg-black/5 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <div
                      onClick={() => playTrack(track)}
                      className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer flex-1 overflow-hidden"
                    >
                      <span className="text-xs text-muted-foreground w-4 sm:w-5 text-center flex items-center justify-center font-normal shrink-0">
                        {isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-foreground inline-block animate-pulse" />
                        ) : (
                          (i + 1).toString().padStart(2, "0")
                        )}
                      </span>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center overflow-hidden pr-2">
                        <span className="text-xs sm:text-sm text-foreground truncate font-normal tracking-tight">
                          {track.title}
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground truncate font-normal">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-4 font-normal shrink-0 pl-1">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={() => removeFromQueue(i)}
                        title="Remove from queue"
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Favorites Tab Content */}
          {libraryTab === "favorites" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2 font-normal">
                <span>Saved to Collection ({favoriteTracks.length})</span>
                {favoriteTracks.length > 0 && (
                  <button
                    onClick={() => playTrack(favoriteTracks[0], favoriteTracks)}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors font-normal cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {favoriteTracks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-normal">
                  No saved tracks yet. Heart any track to save it here.
                </div>
              ) : (
                favoriteTracks.map((track) => (
                  <div
                    key={`fav-${track.id}`}
                    onClick={() => playTrack(track, favoriteTracks)}
                    className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl matte-glass hover:bg-black/5 dark:hover:bg-white/[0.05] border border-border transition-all cursor-pointer group min-w-0 w-full overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center overflow-hidden pr-2">
                        <span className="text-xs sm:text-sm text-foreground truncate font-normal tracking-tight">
                          {track.title}
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground truncate font-normal">
                          {track.artist} • {track.album}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-4 font-normal shrink-0 pl-1">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                        className="p-1.5 text-foreground flex items-center justify-center cursor-pointer shrink-0"
                      >
                        <Heart className="w-4 h-4 fill-current text-current" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* VIEW 4: CANVAS / NOW-PLAYING */}
      {activeView === "now-playing" && currentTrack && (
        <section className="space-y-12 max-w-4xl mx-auto text-center font-normal">
          <div className="space-y-3">
            <span className="text-[11px] tracking-widest text-muted-foreground px-3 py-1 rounded-full matte-glass border border-border font-normal">
              Lossless Audio Canvas
            </span>
            <h2
              className="text-foreground font-normal tracking-[-0.035em] text-[clamp(40px,4.5vw,68px)] leading-[1.08]"
              style={{
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontWeight: 400,
              }}
            >
              {currentTrack.title}
            </h2>
            <p className="text-lg text-muted-foreground font-normal">
              {currentTrack.artist} — {currentTrack.album}
            </p>
          </div>

          {/* Large Monochromatic Vinyl Art */}
          <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-black/40 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-700",
                isPlaying ? "scale-105" : "scale-100"
              )}
            />
            <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
          </div>

          {/* Sound Specs Matrix with Matte Glass */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-xl matte-glass border border-border text-center font-normal">
              <div className="text-[10px] text-muted-foreground tracking-wider">
                Bit Depth
              </div>
              <div className="text-base text-foreground mt-1">24-bit</div>
            </div>
            <div className="p-4 rounded-xl matte-glass border border-border text-center font-normal">
              <div className="text-[10px] text-muted-foreground tracking-wider">
                Sample Rate
              </div>
              <div className="text-base text-foreground mt-1">96.0 kHz</div>
            </div>
            <div className="p-4 rounded-xl matte-glass border border-border text-center font-normal">
              <div className="text-[10px] text-muted-foreground tracking-wider">
                Dynamic Range
              </div>
              <div className="text-base text-foreground mt-1">114 dB</div>
            </div>
            <div className="p-4 rounded-xl matte-glass border border-border text-center font-normal">
              <div className="text-[10px] text-muted-foreground tracking-wider">
                Physics Lag
              </div>
              <div className="text-base text-foreground mt-1">Viscous</div>
            </div>
          </div>

          {/* Liner Notes */}
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed border-t border-border pt-6 font-normal">
            &ldquo;{currentTrack.notes}&rdquo;
          </p>
        </section>
      )}
        </>
      )}
    </main>
  );
};
