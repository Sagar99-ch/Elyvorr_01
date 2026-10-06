export function getImageUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  const imageUrl = url.trim();

  if (!imageUrl) {
    return "";
  }

  // Only apply this transformation to ImageKit URLs.
  if (!imageUrl.includes("ik.imagekit.io")) {
    return imageUrl;
  }

  // Already has f-auto
  if (/[?&]tr=[^&]*f-auto/i.test(imageUrl)) {
    return imageUrl;
  }

  // Existing query parameters
  return imageUrl.includes("?")
    ? `${imageUrl}&tr=f-auto`
    : `${imageUrl}?tr=f-auto`;
}
