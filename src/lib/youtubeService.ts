import { Innertube, UniversalCache } from "youtubei.js";
import { Track } from "@/types/player";
import { Album, MOCK_ALBUMS } from "@/data/mockTracks";

let innertubeInstance: Innertube | null = null;
let initPromise: Promise<Innertube> | null = null;

async function getInnertube(): Promise<Innertube> {
  if (innertubeInstance) return innertubeInstance;
  if (!initPromise) {
    initPromise = Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    }).then((yt) => {
      innertubeInstance = yt;
      return yt;
    });
  }
  return initPromise;
}

function extractThumbnails(obj: any): any[] | undefined {
  if (!obj) return undefined;
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.contents)) return obj.contents;
  if (Array.isArray(obj.thumbnails)) return obj.thumbnails;
  if (obj.thumbnail && Array.isArray(obj.thumbnail.contents)) return obj.thumbnail.contents;
  return undefined;
}

function getBestThumbnail(thumbnails?: any, videoId?: string): string {
  const list = extractThumbnails(thumbnails);
  if (list && list.length > 0) {
    const best = list[0] || list[list.length - 1];
    let url = best.url || "";
    if (url.includes("=w120-h120") || url.includes("=w60-h60") || url.includes("=w226-h226")) {
      url = url.replace(/=w\d+-h\d+/, "=w544-h544");
    }
    if (url) return url;
  }
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=540&q=80";
}

function parseDurationSec(duration: unknown): number {
  if (typeof duration === "object" && duration !== null && "seconds" in duration) {
    const s = Number((duration as { seconds?: number }).seconds);
    if (!isNaN(s) && s > 0) return s;
  }
  if (typeof duration === "string") {
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 210;
}

export async function searchYouTubeMusic(query: string, limit = 20): Promise<Track[]> {
  try {
    const yt = await getInnertube();
    const search = await yt.music.search(query, { type: "song" });

    const contents = search.songs?.contents || [];
    const tracks: Track[] = contents.slice(0, limit).map((s) => {
      const videoId = s.id || "";
      const artistsList = s.artists?.map((a) => a.name).filter(Boolean) || [];
      const artist = artistsList.join(", ") || "Unknown Artist";
      const album = s.album?.name || "Single";
      const durationSec = parseDurationSec(s.duration);
      const coverUrl = getBestThumbnail(s.thumbnails, videoId);

      return {
        id: `yt-${videoId}`,
        youtubeId: videoId,
        title: s.title || "Untitled",
        artist,
        album,
        duration: durationSec,
        coverUrl,
        genre: "Music",
        year: "2025",
        bitrate: "256 kbps AAC",
        notes: `YouTube Music Master • ${artist} — ${album}`,
        source: "youtube",
      };
    });

    return tracks;
  } catch (error) {
    console.error("YouTube Music search error:", error);
    return [];
  }
}

export async function searchYouTubeMusicAlbums(query: string, limit = 12): Promise<Album[]> {
  try {
    const yt = await getInnertube();
    const search = await yt.music.search(query, { type: "album" });

    const contents = search.albums?.contents || [];
    return contents.slice(0, limit).map((a) => {
      const albumId = a.id || "";
      const artist = a.artists?.map((x) => x.name).join(", ") || a.author?.name || "Various Artists";
      const year = a.year || "2024";
      const coverUrl = getBestThumbnail((a as any).thumbnail || a.thumbnails);
      return {
        id: albumId,
        title: a.title || "Album",
        artist,
        year,
        genre: "Album",
        tracksCount: 10,
        totalDuration: 1800,
        coverUrl,
        notes: `Album by ${artist} (${year})`,
        trackIds: [],
      };
    });
  } catch (error) {
    console.error("YouTube Music album search error:", error);
    return [];
  }
}

export async function getYouTubeAlbumDetails(albumId: string): Promise<{ album: Album; tracks: Track[] } | null> {
  try {
    const yt = await getInnertube();
    let details: any = null;

    // 1. Try direct lookup by albumId
    try {
      details = await yt.music.getAlbum(albumId);
    } catch {
      details = null;
    }

    // 2. If direct lookup failed or returned no contents, search YouTube for the album
    if (!details || !details.contents || details.contents.length === 0) {
      const localAlbum = MOCK_ALBUMS.find(
        (a) => a.id.toLowerCase() === albumId.toLowerCase() || a.title.toLowerCase() === albumId.toLowerCase()
      );
      const query = localAlbum
        ? `${localAlbum.title} ${localAlbum.artist}`
        : albumId.replace(/^album-/, "").replace(/-/g, " ");

      const search = await yt.music.search(query, { type: "album" });
      const firstAlbum = search.albums?.contents?.[0];
      if (firstAlbum?.id) {
        details = await yt.music.getAlbum(firstAlbum.id);
        albumId = firstAlbum.id;
      }
    }

    if (!details) return null;

    const header: any = details.header;
    const title = header?.title?.text || (details as any).title || "Album";
    const artist =
      header?.author?.name ||
      header?.artists?.[0]?.name ||
      header?.strapline_text_one?.text ||
      "Various Artists";
    const year =
      header?.year?.text ||
      header?.subtitle?.runs?.find((r: any) => /^\d{4}$/.test(r.text))?.text ||
      "2024";
    const coverUrl = getBestThumbnail(header?.thumbnail || header?.thumbnails);

    const tracks: Track[] = (details.contents || []).map((t: any, idx: number) => {
      const videoId = t.id || "";
      const trackTitle = t.title || `Track ${idx + 1}`;
      const trackDuration = parseDurationSec(t.duration);
      const trackArtist = t.artists?.map((a: any) => a.name).join(", ") || artist;
      const rawTrackThumbs = extractThumbnails(t.thumbnail || t.thumbnails);
      const trackCover = (rawTrackThumbs && rawTrackThumbs.length > 0)
        ? getBestThumbnail(rawTrackThumbs)
        : coverUrl;

      return {
        id: `yt-${videoId || idx}`,
        youtubeId: videoId,
        title: trackTitle,
        artist: trackArtist,
        album: title,
        duration: trackDuration,
        coverUrl: trackCover,
        genre: "Album Track",
        year,
        bitrate: "256 kbps AAC",
        notes: `${trackArtist} — ${title}`,
        source: "youtube",
      };
    });

    const album: Album = {
      id: albumId,
      title,
      artist,
      year,
      genre: "Album",
      tracksCount: tracks.length,
      totalDuration: tracks.reduce((acc, tr) => acc + tr.duration, 0),
      coverUrl,
      notes: `${artist} — ${title} (${year})`,
      trackIds: tracks.map((t) => t.id),
    };

    return { album, tracks };
  } catch (err) {
    console.error("Failed to get YouTube album details:", err);
    return null;
  }
}

export async function getTrendingYouTubeMusic(): Promise<Track[]> {
  try {
    return await searchYouTubeMusic("top hits 2025 global", 25);
  } catch (error) {
    console.error("YouTube Music trending error:", error);
    return [];
  }
}

export async function getRelatedTracks(videoId: string, title?: string, artist?: string): Promise<Track[]> {
  try {
    const yt = await getInnertube();
    // Try search based on artist or title for radio continuation
    const query = artist ? `${artist} songs` : title ? `${title} radio` : "top hits";
    const results = await searchYouTubeMusic(query, 10);
    return results.filter((t) => t.youtubeId !== videoId);
  } catch {
    return [];
  }
}
