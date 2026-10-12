import { NextRequest, NextResponse } from "next/server";
import {
  searchYouTubeMusic,
  searchYouTubeMusicAlbums,
  searchYouTubeMusicArtists,
} from "@/lib/youtubeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ tracks: [], albums: [], artists: [] });
    }

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset = (page - 1) * limit;

    const [tracks, albums, artists] = await Promise.all([
      searchYouTubeMusic(query, limit, offset),
      searchYouTubeMusicAlbums(query, 24),
      searchYouTubeMusicArtists(query, 24),
    ]);

    return NextResponse.json({
      query,
      count: tracks.length,
      tracks,
      albums,
      artists,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal search error";
    return NextResponse.json({ error: message, tracks: [], albums: [] }, { status: 500 });
  }
}
