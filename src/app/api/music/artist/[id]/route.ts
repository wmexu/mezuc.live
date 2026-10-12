import { NextRequest, NextResponse } from "next/server";
import { getYouTubeArtistDetails } from "@/lib/youtubeService";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing artist id or name" }, { status: 400 });
    }

    const decodedNameOrId = decodeURIComponent(id);
    const data = await getYouTubeArtistDetails(decodedNameOrId);
    if (!data) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch artist details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
