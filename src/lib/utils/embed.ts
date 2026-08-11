/**
 * Parses video URLs or raw TikTok HTML embed codes (<blockquote class="tiktok-embed" ...>)
 * and extracts a playable embed iframe URL.
 */
export function getEmbedIframeUrl(urlOrHtml?: string): string | null {
  if (!urlOrHtml || typeof urlOrHtml !== 'string') return null
  const str = urlOrHtml.trim()

  // 1. Extract from data-video-id="7613343166678322463" in HTML embed code
  const dataVidMatch = str.match(/data-video-id=["'](\d+)["']/)
  if (dataVidMatch && dataVidMatch[1]) {
    return `https://www.tiktok.com/embed/v2/${dataVidMatch[1]}`
  }

  // 2. Extract from cite="https://www.tiktok.com/@user/video/7613343166678322463" in HTML embed code or direct URL
  const citeMatch = str.match(/cite=["'](https?:\/\/[^"']+)["']/)
  const targetUrl = citeMatch ? citeMatch[1] : str

  // 3. TikTok direct URL or embed URL regex
  const tiktokMatch = targetUrl.match(/\/video\/(\d+)/) || targetUrl.match(/\/embed\/v2\/(\d+)/)
  if (tiktokMatch && tiktokMatch[1]) {
    return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`
  }

  // 4. YouTube URL regex
  const ytMatch = targetUrl.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // 5. Instagram Reels / Posts
  const igMatch = targetUrl.match(/\/p\/([a-zA-Z0-9_-]+)/) || targetUrl.match(/\/reel\/([a-zA-Z0-9_-]+)/)
  if (igMatch && igMatch[1]) {
    return `https://www.instagram.com/p/${igMatch[1]}/embed`
  }

  // 6. Direct iframe src fallback
  if (targetUrl.includes('/embed/') || targetUrl.includes('/embed')) {
    return targetUrl
  }

  return null
}
