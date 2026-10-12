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

export async function searchYouTubeMusic(query: string, limit = 20, offset = 0): Promise<Track[]> {
  try {
    const yt = await getInnertube();
    const search = await yt.music.search(query, { type: "song" });

    let contents = [...(search.songs?.contents || [])];
    let currentSearch: any = search;

    while (contents.length < offset + limit && currentSearch?.has_continuation) {
      try {
        const continuation = await currentSearch.getContinuation();
        const nextBatch = continuation?.contents?.contents || continuation?.contents || [];
        if (Array.isArray(nextBatch) && nextBatch.length > 0) {
          contents = [...contents, ...nextBatch];
          currentSearch = continuation;
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    const tracks: Track[] = contents.slice(offset, offset + limit).map((s) => {
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

    const uniqueTracks: Track[] = [];
    const seen = new Set<string>();
    for (const t of tracks) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        uniqueTracks.push(t);
      }
    }

    return uniqueTracks;
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

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  subscribers?: string;
  verified?: boolean;
}

export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function searchYouTubeMusicArtists(query: string, limit = 12): Promise<Artist[]> {
  try {
    const yt = await getInnertube();
    const search = await yt.music.search(query, { type: "artist" });
    const contents = search.artists?.contents || [];

    const normalizedQ = normalizeSearchText(query);

    const artists: Artist[] = contents.map((a: any) => {
      const artistId = a.id || "";
      const name = a.name || a.title || "Artist";
      const subscribers =
        a.subscribers?.text ||
        (typeof a.subscribers === "string" ? a.subscribers : undefined);
      const rawThumbs = extractThumbnails((a as any).thumbnail || a.thumbnails);
      const avatarUrl = getBestThumbnail(rawThumbs);
      return {
        id: artistId || `artist-${normalizeSearchText(name)}`,
        name,
        avatarUrl,
        subscribers,
        verified: true,
      };
    });

    // Sort: Exact match first, then startsWith, then word match
    artists.sort((a, b) => {
      const aNorm = normalizeSearchText(a.name);
      const bNorm = normalizeSearchText(b.name);

      const aExact = aNorm === normalizedQ ? 100 : 0;
      const bExact = bNorm === normalizedQ ? 100 : 0;
      if (aExact !== bExact) return bExact - aExact;

      const aStarts = aNorm.startsWith(normalizedQ) ? 50 : 0;
      const bStarts = bNorm.startsWith(normalizedQ) ? 50 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      const aWord = aNorm.split(/\s+/).some((w) => w.startsWith(normalizedQ)) ? 25 : 0;
      const bWord = bNorm.split(/\s+/).some((w) => w.startsWith(normalizedQ)) ? 25 : 0;
      if (aWord !== bWord) return bWord - aWord;

      return 0;
    });

    // Deduplicate by normalized name
    const seen = new Set<string>();
    const deduplicated = artists.filter((a) => {
      const norm = normalizeSearchText(a.name);
      if (seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });

    return deduplicated.slice(0, limit);
  } catch (error) {
    console.error("YouTube Music artist search error:", error);
    return [];
  }
}

export async function getYouTubeAlbumDetails(
  albumId: string,
  artistParam?: string,
  titleParam?: string
): Promise<{ album: Album; tracks: Track[] } | null> {
  try {
    const yt = await getInnertube();
    let details: any = null;

    // 1. Try direct lookup by albumId if it is a genuine YouTube album ID
    if (albumId && (albumId.startsWith("MPRE") || albumId.startsWith("OLAK") || albumId.length > 20)) {
      try {
        details = await yt.music.getAlbum(albumId);
      } catch {
        details = null;
      }
    }

    // 2. If direct lookup failed or returned no contents, search YouTube specifically for the artist's album
    if (!details || !details.contents || details.contents.length === 0) {
      const localAlbum = MOCK_ALBUMS.find(
        (a) =>
          a.id.toLowerCase() === albumId.toLowerCase() ||
          a.title.toLowerCase() === albumId.toLowerCase()
      );

      const effectiveTitle =
        titleParam || localAlbum?.title || albumId.replace(/^album-/, "").replace(/-/g, " ");
      const effectiveArtist = artistParam || localAlbum?.artist || "";
      const query = effectiveArtist ? `${effectiveTitle} ${effectiveArtist}` : effectiveTitle;

      const search = await yt.music.search(query, { type: "album" });
      const albumsList = search.albums?.contents || [];

      // If artist was specified, match specifically against that artist to avoid collisions with same-named albums!
      let matchedAlbum = null;
      if (effectiveArtist) {
        const normArtist = normalizeSearchText(effectiveArtist);
        matchedAlbum = albumsList.find((a: any) => {
          const aArtist = normalizeSearchText(
            a.artists?.map((x: any) => x.name).join(" ") || a.author?.name || ""
          );
          return aArtist.includes(normArtist) || normArtist.includes(aArtist);
        });
      }
      if (!matchedAlbum && albumsList.length > 0) {
        matchedAlbum = albumsList[0];
      }

      if (matchedAlbum?.id) {
        details = await yt.music.getAlbum(matchedAlbum.id);
        albumId = matchedAlbum.id;
      }
    }

    if (!details) return null;

    const header: any = details.header;
    const title = header?.title?.text || (details as any).title || titleParam || "Album";
    const artist =
      header?.author?.name ||
      header?.artists?.[0]?.name ||
      header?.strapline_text_one?.text ||
      artistParam ||
      "Various Artists";
    const year =
      header?.year?.text ||
      header?.subtitle?.runs?.find((r: any) => /^\d{4}$/.test(r.text))?.text ||
      "2024";
    const coverUrl = getBestThumbnail(header?.thumbnail || header?.thumbnails);

    const tracks: Track[] = [];
    for (let idx = 0; idx < (details.contents || []).length; idx++) {
      const t = details.contents[idx];
      let videoId = (t as any).id || (t as any).video_id || "";
      const trackTitle = (t as any).title?.text || (t as any).title || `Track ${idx + 1}`;
      const trackDuration = parseDurationSec((t as any).duration);
      const trackArtist = (t as any).artists?.map((a: any) => a.name).join(", ") || artist;
      const rawTrackThumbs = extractThumbnails((t as any).thumbnail || (t as any).thumbnails);
      const trackCover = (rawTrackThumbs && rawTrackThumbs.length > 0)
        ? getBestThumbnail(rawTrackThumbs)
        : coverUrl;

      // If videoId is missing or blocked by web upsell, resolve playable video ID
      if (!videoId || videoId.length < 8) {
        try {
          const directSearch = await yt.search(`${trackTitle} ${trackArtist} audio`);
          const matched = directSearch.videos?.[0] as any;
          if (matched && matched.id) {
            videoId = matched.id;
          }
        } catch {}
      }

      tracks.push({
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
      });
    }

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

export async function getYouTubeArtistDetails(artistNameOrId: string): Promise<{
  artist: Artist;
  songs: Track[];
  albums: Album[];
} | null> {
  try {
    const yt = await getInnertube();
    const query = artistNameOrId.trim();
    const normalizedQ = normalizeSearchText(query);

    // 1. Search for artist channel and get discography albums in parallel
    const [artistSearch, searchedAlbums] = await Promise.all([
      yt.music.search(query, { type: "artist" }).catch(() => null),
      searchYouTubeMusicAlbums(query, 50).catch(() => []),
    ]);

    const artistCandidate = (artistSearch?.artists?.contents || [])[0];
    let artistName = artistCandidate?.name || query;
    let avatarUrl = "";
    let subscribers = "Verified Artist";
    const artistSongs: Track[] = [];
    const collectedAlbums: Album[] = [...searchedAlbums];

    // 2. If artist channel ID exists, fetch official artist page with true Top Songs and official albums/singles shelves
    if (artistCandidate?.id) {
      try {
        const artistPage = await yt.music.getArtist(artistCandidate.id);
        if (artistPage) {
          if (artistPage.header) {
            const h: any = artistPage.header;
            if (h.title?.text) artistName = h.title.text;
            const hThumbs = extractThumbnails(h.thumbnail?.contents || h.thumbnails || h.thumbnail);
            if (hThumbs && hThumbs.length > 0) {
              avatarUrl = getBestThumbnail(hThumbs);
            }
            if (h.subscription_button?.subscribe_accessibility_label) {
              const match = h.subscription_button.subscribe_accessibility_label.match(/([\d.]+\s+(?:million|thousand|subscribers))/i);
              if (match) subscribers = `${match[1]} subscribers`;
            }
          }

          // Extract all songs from artist page via getAllSongs or MusicShelf
          try {
            if (typeof (artistPage as any).getAllSongs === "function") {
              const allSongsResult = await (artistPage as any).getAllSongs();
              const songItems = allSongsResult?.contents || [];
              for (const rawItem of songItems) {
                const item = rawItem as any;
                const videoId = item.id || "";
                if (!videoId || artistSongs.some((t) => t.youtubeId === videoId)) continue;
                const title = item.title?.text || item.title || "Untitled";
                const artistsList = item.artists?.map((a: any) => a.name).filter(Boolean) || [];
                const artist = artistsList.join(", ") || artistName;
                const durationSec = parseDurationSec(item.duration);
                const itemCover = getBestThumbnail(item.thumbnails || item.thumbnail, videoId);
                artistSongs.push({
                  id: `yt-${videoId}`,
                  youtubeId: videoId,
                  title,
                  artist,
                  album: item.album?.name || item.album?.text || "Single",
                  duration: durationSec,
                  coverUrl: itemCover,
                  genre: "Music",
                  year: "2025",
                  bitrate: "256 kbps AAC",
                  notes: `${artist} — ${title}`,
                  source: "youtube",
                });
              }
            }
          } catch (e) {
            console.warn("getAllSongs error, using shelf fallback:", e);
          }

          // Also check MusicShelf if getAllSongs was empty
          if (artistSongs.length === 0) {
            const shelf = artistPage.sections?.find((sec: any) => sec.type === "MusicShelf");
            if (shelf && Array.isArray((shelf as any).contents)) {
              for (const rawItem of (shelf as any).contents) {
                const item = rawItem as any;
                const videoId = item.id || "";
                if (!videoId) continue;
                const title = item.title || "Untitled";
                const artistsList = item.artists?.map((a: any) => a.name).filter(Boolean) || [];
                const artist = artistsList.join(", ") || artistName;
                const durationSec = parseDurationSec(item.duration);
                const itemCover = getBestThumbnail(item.thumbnails || item.thumbnail, videoId);
                artistSongs.push({
                  id: `yt-${videoId}`,
                  youtubeId: videoId,
                  title,
                  artist,
                  album: item.album?.name || "Single",
                  duration: durationSec,
                  coverUrl: itemCover,
                  genre: "Music",
                  year: "2025",
                  bitrate: "256 kbps AAC",
                  notes: `${artist} — ${title}`,
                  source: "youtube",
                });
              }
            }
          }

          // Extract official Albums and Singles & EPs shelves from channel
          for (const sec of (artistPage.sections || [])) {
            const s = sec as any;
            const rawTitle = s.title?.toString?.() || s.header?.title?.toString?.() || s.header?.title?.text || s.title?.text || s.title || "";
            const secTitle = String(rawTitle).toLowerCase();
            const isAlbumSection = secTitle.includes("album") || secTitle.includes("single") || secTitle.includes("ep");
            if (isAlbumSection && Array.isArray((sec as any).contents)) {
              for (const a of (sec as any).contents) {
                const albId = a.id || "";
                if (!albId) continue;
                const albTitle = a.title?.text || a.title || "Album";
                const albYear = a.year?.text || a.subtitle?.text || a.year || "2024";
                const albCover = getBestThumbnail((a as any).thumbnail || (a as any).thumbnails);
                collectedAlbums.unshift({
                  id: albId,
                  title: albTitle,
                  artist: artistName,
                  year: albYear,
                  genre: secTitle.includes("single") ? "Single" : "Album",
                  tracksCount: 10,
                  totalDuration: 1800,
                  coverUrl: albCover,
                  notes: `${artistName} — ${albTitle} (${albYear})`,
                  trackIds: [],
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch official artist page, falling back:", err);
      }
    }

    // Deduplicate collected albums by normalized title
    const seenAlbumTitles = new Set<string>();
    const finalAlbums: Album[] = [];
    for (const alb of collectedAlbums) {
      const normT = normalizeSearchText(alb.title);
      if (!seenAlbumTitles.has(normT)) {
        seenAlbumTitles.add(normT);
        finalAlbums.push(alb);
      }
    }

    // Fallback thumbnail from candidate if header didn't provide one
    if (!avatarUrl && artistCandidate) {
      const cThumbs = extractThumbnails((artistCandidate as any).thumbnail || artistCandidate.thumbnails);
      if (cThumbs && cThumbs.length > 0) {
        avatarUrl = getBestThumbnail(cThumbs);
      }
    }

    // 3. Search additional songs by this artist (with continuation) and strictly filter so only THIS artist's tracks are included
    try {
      let searchRes: any = await yt.music.search(artistName, { type: "song" });
      const normArtist = normalizeSearchText(artistName);

      let songBatch = [...(searchRes.songs?.contents || [])];
      let continuationsCount = 0;
      while (songBatch.length < 80 && searchRes?.has_continuation && continuationsCount < 3) {
        try {
          const cont = await searchRes.getContinuation();
          const nextSongs = cont?.contents?.contents || cont?.contents || [];
          if (Array.isArray(nextSongs) && nextSongs.length > 0) {
            songBatch = [...songBatch, ...nextSongs];
            searchRes = cont;
            continuationsCount++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }

      for (const item of songBatch) {
        const videoId = (item as any).id || "";
        if (!videoId || artistSongs.some((t) => t.youtubeId === videoId)) continue;

        const artistsList = (item as any).artists?.map((a: any) => a.name).filter(Boolean) || [];
        const trackArtist = artistsList.join(", ") || "";
        const normTrackArtist = normalizeSearchText(trackArtist);

        // STRICT FILTER: Track must actually be by this artist (not random songs from playlists!)
        const isMatch =
          normTrackArtist.includes(normArtist) ||
          normArtist.includes(normTrackArtist) ||
          artistsList.some((a: string) => normalizeSearchText(a) === normArtist);

        if (!isMatch) continue;

        const durationSec = parseDurationSec((item as any).duration);
        const itemCover = getBestThumbnail((item as any).thumbnails, videoId);

        artistSongs.push({
          id: `yt-${videoId}`,
          youtubeId: videoId,
          title: (item as any).title || "Untitled",
          artist: trackArtist || artistName,
          album: (item as any).album?.name || "Single",
          duration: durationSec,
          coverUrl: itemCover,
          genre: "Music",
          year: "2025",
          bitrate: "256 kbps AAC",
          notes: `${trackArtist || artistName} — ${(item as any).title}`,
          source: "youtube",
        });

        if (artistSongs.length >= 60) break;
      }
    } catch {}

    const artistObj: Artist = {
      id: artistCandidate?.id || `artist-${normalizedQ}`,
      name: artistName,
      avatarUrl: avatarUrl || (artistSongs[0]?.coverUrl ? artistSongs[0].coverUrl : ""),
      subscribers,
      verified: true,
    };

    return {
      artist: artistObj,
      songs: artistSongs,
      albums: finalAlbums,
    };
  } catch (error) {
    console.error("Failed to get YouTube artist details:", error);
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
