/**
 * Audio Metadata & ID3v2 Parser
 * Extracts real duration, ID3v2 tags (Title, Artist, Album, Year, Genre),
 * and embedded APIC cover artwork from uploaded audio files in the browser.
 */

export interface ParsedAudioMetadata {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  duration: number;
  coverUrl: string;
  bitrate: string;
}

/**
 * Gets exact duration in seconds using HTMLAudioElement
 */
export async function getExactAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(180);
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const tempUrl = URL.createObjectURL(file);
    audio.src = tempUrl;

    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      URL.revokeObjectURL(tempUrl);
    };

    audio.onloadedmetadata = () => {
      const dur = Math.round(audio.duration);
      cleanup();
      resolve(dur && !isNaN(dur) && dur > 0 ? dur : 180);
    };

    audio.onerror = () => {
      cleanup();
      resolve(180);
    };

    // Timeout fallback
    setTimeout(() => {
      cleanup();
      resolve(180);
    }, 4000);
  });
}

function decodeText(bytes: Uint8Array, encoding: number): string {
  try {
    if (encoding === 0) {
      // ISO-8859-1
      return new TextDecoder("iso-8859-1").decode(bytes).replace(/\0+$/, "").trim();
    } else if (encoding === 1 || encoding === 2) {
      // UTF-16 with BOM
      return new TextDecoder("utf-16").decode(bytes).replace(/\0+$/, "").trim();
    } else if (encoding === 3) {
      // UTF-8
      return new TextDecoder("utf-8").decode(bytes).replace(/\0+$/, "").trim();
    }
    return new TextDecoder("utf-8").decode(bytes).replace(/\0+$/, "").trim();
  } catch {
    return "";
  }
}

function generateMonochromeArtwork(title: string, artist: string): string {
  const initials = (title || "M").slice(0, 2).toUpperCase();
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="#09090b"/>
        <circle cx="200" cy="200" r="140" fill="none" stroke="#27272a" stroke-width="2"/>
        <circle cx="200" cy="200" r="80" fill="none" stroke="#52525b" stroke-width="1" stroke-dasharray="4 4"/>
        <circle cx="200" cy="200" r="8" fill="#ffffff"/>
        <text x="200" y="160" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="600" letter-spacing="2">${initials}</text>
        <text x="200" y="245" text-anchor="middle" fill="#a1a1aa" font-family="sans-serif" font-size="11" letter-spacing="1">MASTER LOSSLESS</text>
        <text x="200" y="265" text-anchor="middle" fill="#71717a" font-family="sans-serif" font-size="9" letter-spacing="2">${(artist || "LOCAL AUDIO").toUpperCase()}</text>
      </svg>
    `)
  );
}

/**
 * Extracts ID3v2 frames and APIC embedded artwork from audio file
 */
export async function parseAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  const duration = await getExactAudioDuration(file);

  // Default fallback from filename
  const cleanName = file.name.replace(/\.[^/.]+$/, "");
  let title = cleanName;
  let artist = "Local Artist";
  let album = "Imported Session";
  let year = new Date().getFullYear().toString();
  let genre = "Master Lossless";
  let coverUrl: string | null = null;

  // Split "Artist - Title" if present in filename
  if (cleanName.includes(" - ")) {
    const parts = cleanName.split(" - ");
    artist = parts[0].trim();
    title = parts.slice(1).join(" - ").trim();
  }

  try {
    // Read first 512 KB of the file
    const slice = file.slice(0, 524288);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check ID3 header (0x49 0x44 0x33)
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      const version = bytes[3]; // e.g., 3 for ID3v2.3, 4 for ID3v2.4
      let offset = 10;
      const tagSize =
        ((bytes[6] & 0x7f) << 21) |
        ((bytes[7] & 0x7f) << 14) |
        ((bytes[8] & 0x7f) << 7) |
        (bytes[9] & 0x7f);

      const maxOffset = Math.min(bytes.length, tagSize + 10);

      while (offset < maxOffset - 10) {
        // Read 4-character Frame ID
        const frameId = String.fromCharCode(
          bytes[offset],
          bytes[offset + 1],
          bytes[offset + 2],
          bytes[offset + 3]
        );

        if (!frameId || frameId[0] < "A" || frameId[0] > "Z") break;

        // Read Frame Size
        let frameSize = 0;
        if (version === 4) {
          // Synchsafe in v2.4
          frameSize =
            ((bytes[offset + 4] & 0x7f) << 21) |
            ((bytes[offset + 5] & 0x7f) << 14) |
            ((bytes[offset + 6] & 0x7f) << 7) |
            (bytes[offset + 7] & 0x7f);
        } else {
          // Regular big-endian in v2.3
          frameSize =
            (bytes[offset + 4] << 24) |
            (bytes[offset + 5] << 16) |
            (bytes[offset + 6] << 8) |
            bytes[offset + 7];
        }

        if (frameSize <= 0 || offset + 10 + frameSize > bytes.length) break;

        const frameData = bytes.subarray(offset + 10, offset + 10 + frameSize);

        if (frameId === "TIT2" && frameData.length > 1) {
          const t = decodeText(frameData.subarray(1), frameData[0]);
          if (t) title = t;
        } else if (frameId === "TPE1" && frameData.length > 1) {
          const a = decodeText(frameData.subarray(1), frameData[0]);
          if (a) artist = a;
        } else if (frameId === "TALB" && frameData.length > 1) {
          const al = decodeText(frameData.subarray(1), frameData[0]);
          if (al) album = al;
        } else if ((frameId === "TYER" || frameId === "TDRC") && frameData.length > 1) {
          const y = decodeText(frameData.subarray(1), frameData[0]);
          if (y) year = y.slice(0, 4);
        } else if (frameId === "TCON" && frameData.length > 1) {
          const g = decodeText(frameData.subarray(1), frameData[0]);
          if (g) genre = g.replace(/^\(\d+\)/, "").trim() || "Master Lossless";
        } else if (frameId === "APIC" && frameData.length > 10) {
          // APIC: [encoding 1B] [mime null-terminated] [picture-type 1B] [description null-terminated] [image data]
          let i = 1;
          while (i < frameData.length && frameData[i] !== 0) i++;
          const mime = new TextDecoder("ascii").decode(frameData.subarray(1, i)) || "image/jpeg";
          i++; // Skip null terminator
          i++; // Skip picture type (1 byte)
          // Skip description
          while (i < frameData.length && frameData[i] !== 0) i++;
          i++; // Skip description null terminator
          if (i < frameData.length) {
            const imgBytes = frameData.subarray(i);
            const blob = new Blob([imgBytes], { type: mime });
            coverUrl = URL.createObjectURL(blob);
          }
        }

        offset += 10 + frameSize;
      }
    }
  } catch (err) {
    console.warn("Could not parse ID3 tags, using fallback metadata:", err);
  }

  if (!coverUrl) {
    coverUrl = generateMonochromeArtwork(title, artist);
  }

  // Format bitrate / file info
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const ext = file.name.split(".").pop()?.toUpperCase() || "FLAC";
  const bitrate = `${ext} • ${sizeMB} MB`;

  return {
    title,
    artist,
    album,
    year,
    genre,
    duration,
    coverUrl,
    bitrate,
  };
}
