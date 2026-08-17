import sharp from "sharp";

// Matches Claude's high-resolution long-edge ceiling, so we're not paying for
// pixels the model would downsample anyway.
const MAX_DIMENSION = 2600;

export type PreprocessedImage = {
  buffer: Buffer;
  mimeType: "image/jpeg";
};

/**
 * Auto-rotates from EXIF, stretches contrast (helps faded/shadowed scans), and
 * caps resolution. Full geometric deskew for tilted photos is intentionally out
 * of scope for v1 — Claude Vision reads moderately skewed text natively; see
 * README roadmap.
 */
export async function preprocessImage(buffer: Buffer): Promise<PreprocessedImage> {
  const output = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .normalize()
    .jpeg({ quality: 92 })
    .toBuffer();

  return { buffer: output, mimeType: "image/jpeg" };
}
