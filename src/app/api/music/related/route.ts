import { NextRequest, NextResponse } from "next/server";
import { getRelatedTracks } from "@/lib/youtubeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    const title = searchParams.get("title") || "";
    const artist = searchParams.get("artist") || "";

    const tracks = await getRelatedTracks(id, title, artist);
    return NextResponse.json({ tracks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch related tracks";
    return NextResponse.json({ error: message, tracks: [] }, { status: 500 });
  }
}
