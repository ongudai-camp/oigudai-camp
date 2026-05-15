export function parseGalleryImages(
  galleryJson: string | null,
  featuredImage: string | null
): string[] {
  let gallery: string[] = [];
  try {
    if (galleryJson) {
      gallery = JSON.parse(galleryJson);
      if (!Array.isArray(gallery)) gallery = [];
    }
  } catch {
    gallery = [];
  }

  const images = featuredImage
    ? [featuredImage, ...gallery.filter((img) => img !== featuredImage)]
    : gallery;

  return images;
}
