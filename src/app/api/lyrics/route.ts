import { NextRequest, NextResponse } from "next/server";

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      const text = trimmed.replace(timeRegex, "").trim();
      for (const m of matches) {
        const min = parseInt(m[1], 10);
        const sec = parseInt(m[2], 10);
        const ms = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
        const totalSec = min * 60 + sec + ms / 1000;
        result.push({ time: totalSec, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track")?.trim();
    const artist = searchParams.get("artist")?.trim();
    const duration = searchParams.get("duration");

    if (!track) {
      return NextResponse.json({ error: "Missing track name", lines: [] }, { status: 400 });
    }

    // Clean track title: remove (feat. ...), [feat. ...], (Official Video), etc.
    const cleanTrack = track
      .replace(/\(feat\.[^)]*\)/gi, "")
      .replace(/\[feat\.[^\]]*\]/gi, "")
      .replace(/\(official[^)]*\)/gi, "")
      .replace(/\[official[^\]]*\]/gi, "")
      .trim();

    const cleanArtist = artist
      ? artist.split(",")[0].split("&")[0].split("feat.")[0].trim()
      : "";

    // 1. Try exact get
    let lrclibUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTrack)}`;
    if (cleanArtist) lrclibUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
    if (duration && !isNaN(Number(duration))) {
      lrclibUrl += `&duration=${Math.round(Number(duration))}`;
    }

    let response = await fetch(lrclibUrl, {
      headers: { "User-Agent": "mezuc.live/1.0.0 (contact@mezuc.live)" },
      signal: AbortSignal.timeout(5000),
    });

    let data = null;
    if (response.ok) {
      data = await response.json();
    } else {
      // 2. Fallback to search endpoint
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(
        `${cleanTrack} ${cleanArtist}`
      )}`;
      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": "mezuc.live/1.0.0 (contact@mezuc.live)" },
        signal: AbortSignal.timeout(5000),
      });
      if (searchRes.ok) {
        const searchList = await searchRes.json();
        if (Array.isArray(searchList) && searchList.length > 0) {
          // Prefer item with syncedLyrics
          data = searchList.find((item: any) => item.syncedLyrics) || searchList[0];
        }
      }
    }

    if (!data) {
      return NextResponse.json({
        synced: false,
        plainLyrics: null,
        lines: [],
      });
    }

    if (data.syncedLyrics) {
      const parsedLines = parseLrc(data.syncedLyrics);
      return NextResponse.json({
        synced: true,
        trackName: data.trackName,
        artistName: data.artistName,
        plainLyrics: data.plainLyrics,
        lines: parsedLines,
      });
    }

    if (data.plainLyrics) {
      const plainLines: LyricLine[] = data.plainLyrics
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean)
        .map((text: string, idx: number) => ({ time: idx * 5, text }));

      return NextResponse.json({
        synced: false,
        trackName: data.trackName,
        artistName: data.artistName,
        plainLyrics: data.plainLyrics,
        lines: plainLines,
      });
    }

    return NextResponse.json({
      synced: false,
      plainLyrics: null,
      lines: [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch lyrics";
    return NextResponse.json({ error: message, lines: [] }, { status: 500 });
  }
}
