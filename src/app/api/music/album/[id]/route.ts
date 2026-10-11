import { NextRequest, NextResponse } from "next/server";
import { getYouTubeAlbumDetails } from "@/lib/youtubeService";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing album id" }, { status: 400 });
    }

    const data = await getYouTubeAlbumDetails(id);
    if (!data) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch album";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
