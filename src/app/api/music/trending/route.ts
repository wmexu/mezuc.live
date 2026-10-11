import { NextResponse } from "next/server";
import { getTrendingYouTubeMusic } from "@/lib/youtubeService";

export async function GET() {
  try {
    const tracks = await getTrendingYouTubeMusic();
    return NextResponse.json({
      count: tracks.length,
      tracks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal trending error";
    return NextResponse.json({ error: message, tracks: [] }, { status: 500 });
  }
}
