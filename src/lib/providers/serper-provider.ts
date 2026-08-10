export interface SerperSearchResult {
  title: string
  link: string
  snippet: string
  date?: string
  price?: string
  source?: string
}

export interface SerperResponse {
  organic: SerperSearchResult[]
  shopping?: SerperSearchResult[]
}

/**
 * Serper.dev Google & Social Search Provider
 * API Docs: https://serper.dev
 */
export class SerperSearchProvider {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPER_API_KEY || ''
  }

  async search(query: string, numResults: number = 8): Promise<SerperSearchResult[]> {
    if (!this.apiKey) {
      console.warn('Serper API key missing (SERPER_API_KEY). Returning empty results.')
      return []
    }

    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: numResults,
        }),
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) {
        console.error(`Serper API error: ${res.status} ${res.statusText}`)
        return []
      }

      const data: SerperResponse = await res.json()
      const organic = (data.organic || []).map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        date: item.date,
      }))

      const shopping = (data.shopping || []).map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || item.price || '',
        price: item.price,
        source: item.source,
      }))

      return [...shopping, ...organic].slice(0, numResults)
    } catch (err) {
      console.error('Serper search failed:', err)
      return []
    }
  }

  /**
   * Search for local Sri Lankan competition (Daraz, Facebook, Ikman, Instagram)
   */
  async searchSriLankaCompetition(productName: string): Promise<SerperSearchResult[]> {
    const query = `"${productName}" (site:daraz.lk OR site:ikman.lk OR site:facebook.com OR "Sri Lanka")`
    return this.search(query, 6)
  }

  /**
   * Search for social media virality & videos (TikTok, Instagram Reels, YouTube Shorts)
   */
  async searchSocialVirality(productName: string): Promise<SerperSearchResult[]> {
    const query = `"${productName}" (site:tiktok.com OR site:instagram.com OR site:youtube.com/shorts)`
    return this.search(query, 6)
  }
}
