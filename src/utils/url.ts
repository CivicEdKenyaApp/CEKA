
export function normalizeDownloadUrl(input?: string | null): string {
  if (!input) return '';
  let url = String(input).trim().replace(/\s+/g, ' ');

  // Remove accidental newlines and weird "download?=1" artifacts
  url = url.replace(/\n/g, '').replace(/\r/g, '');
  url = url.replace('?download?=1', '').replace('&download?=1', '').replace('??', '?');

  // If it's a Supabase signed URL, prefer public path for in-app viewing
  // Example: .../storage/v1/object/sign/... -> .../storage/v1/object/public/...
  if (url.includes('/storage/v1/object/sign/')) {
    url = url.replace('/storage/v1/object/sign/', '/storage/v1/object/public/');
    // Strip any leftover tokens
    const tokenIndex = url.indexOf('?token=');
    if (tokenIndex !== -1) {
      url = url.slice(0, tokenIndex);
    }
  }

  // If it's a resources bucket path without /public, convert to public form
  if (url.includes('/storage/v1/object/') && !url.includes('/storage/v1/object/public/')) {
    url = url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }

  return url;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const u = url.trim();
  // Support youtu.be and youtube.com/watch?v=...
  const shortId = u.match(/youtu\.be\/([A-Za-z0-9_-]+)/)?.[1];
  const watchId = u.match(/[?&]v=([A-Za-z0-9_-]+)/)?.[1];
  const id = shortId || watchId;
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
