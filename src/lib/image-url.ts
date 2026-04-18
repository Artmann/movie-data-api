const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
  poster: "w500",
  backdrop: "w1280",
  still: "w300",
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

export function buildImageUrl(path: string | null | undefined, size: ImageSize): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${IMAGE_SIZES[size]}${path}`;
}
