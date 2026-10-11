import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeMusic, searchYouTubeMusicAlbums } from "@/lib/youtubeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ tracks: [], albums: [] });
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const [tracks, albums] = await Promise.all([
      searchYouTubeMusic(query, limit),
      searchYouTubeMusicAlbums(query, 8),
    ]);

    return NextResponse.json({
      query,
      count: tracks.length,
      tracks,
      albums,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal search error";
    return NextResponse.json({ error: message, tracks: [], albums: [] }, { status: 500 });
  }
}
