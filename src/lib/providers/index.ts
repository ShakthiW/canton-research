export interface VisualSearchResultItem {
  source: string
  title: string
  url: string
  imageUrl?: string
  priceUsd?: number
  currency?: string
  retailer?: string
  country?: string
  similarityScore?: number
  matchType?: 'EXACT' | 'PRODUCT' | 'VISUAL'
  timestamp: string
}

export interface VisualSearchInput {
  imageUrl: string
  productName?: string
  maxResults?: number
  type?: 'all' | 'visual_matches' | 'exact_matches' | 'products'
}

export interface VisualSearchProvider {
  searchByImage(input: VisualSearchInput): Promise<VisualSearchResultItem[]>
}

/**
 * SerpApi Google Lens Visual Search Provider Implementation
 * Grounded in official SerpApi Google Lens API documentation:
 * - Supports image URL input (`url`)
 * - Supports text query refinement (`q`)
 * - Parses `exact_matches`, `products`, and `visual_matches` arrays
 */
export class SerpApiVisualSearchProvider implements VisualSearchProvider {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_API_KEY || ''
  }

  async searchByImage(input: VisualSearchInput): Promise<VisualSearchResultItem[]> {
    if (!this.apiKey) {
      console.warn('SerpApi API key missing, falling back to mock visual search')
      return new MockVisualSearchProvider().searchByImage(input)
    }

    try {
      let url = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(
        input.imageUrl
      )}&api_key=${this.apiKey}`

      if (input.productName) {
        url += `&q=${encodeURIComponent(input.productName)}`
      }

      if (input.type) {
        url += `&type=${input.type}`
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) {
        throw new Error(`SerpApi error: ${res.statusText}`)
      }
      const data = await res.json()

      const results: VisualSearchResultItem[] = []

      // 1. Exact Matches (Highest priority)
      const exactMatches = data.exact_matches || []
      for (const match of exactMatches) {
        results.push({
          source: 'SerpApi Google Lens (Exact Match)',
          title: match.title || 'Exact Product Match',
          url: match.link || match.source,
          imageUrl: match.thumbnail,
          priceUsd: match.price?.extracted_value || undefined,
          currency: match.price?.currency || 'USD',
          retailer: match.source || 'Direct Source',
          country: 'Global',
          similarityScore: 0.98,
          matchType: 'EXACT',
          timestamp: new Date().toISOString(),
        })
      }

      // 2. Product Matches
      const productMatches = data.products || []
      for (const match of productMatches) {
        results.push({
          source: 'SerpApi Google Lens (Product Match)',
          title: match.title || 'Product Shopping Match',
          url: match.link || match.source,
          imageUrl: match.thumbnail,
          priceUsd: match.price?.extracted_value || undefined,
          currency: match.price?.currency || 'USD',
          retailer: match.source || 'Supplier Store',
          country: 'Global',
          similarityScore: 0.92,
          matchType: 'PRODUCT',
          timestamp: new Date().toISOString(),
        })
      }

      // 3. Visual Matches
      const visualMatches = data.visual_matches || []
      for (const match of visualMatches) {
        results.push({
          source: 'SerpApi Google Lens (Visual Match)',
          title: match.title || 'Visually Similar Item',
          url: match.link || match.source,
          imageUrl: match.thumbnail,
          priceUsd: match.price?.extracted_value || undefined,
          currency: match.price?.currency || 'USD',
          retailer: match.source || 'Online Store',
          country: 'Global',
          similarityScore: 0.85,
          matchType: 'VISUAL',
          timestamp: new Date().toISOString(),
        })
      }

      const limit = input.maxResults || 10
      return results.slice(0, limit)
    } catch (err) {
      console.error('Visual search request failed:', err)
      return new MockVisualSearchProvider().searchByImage(input)
    }
  }
}

/**
 * Mock Visual Search Provider for local development without API keys
 */
export class MockVisualSearchProvider implements VisualSearchProvider {
  async searchByImage(input: VisualSearchInput): Promise<VisualSearchResultItem[]> {
    const name = input.productName || 'Sample Product'
    return [
      {
        source: 'Mock Provider (1688 / Alibaba)',
        title: `${name} - Wholesale Direct Factory`,
        url: 'https://www.alibaba.com/product-detail/sample_1.html',
        imageUrl: input.imageUrl,
        priceUsd: 3.5,
        currency: 'USD',
        retailer: 'Guangdong Electronics Co.',
        country: 'China',
        similarityScore: 0.92,
        matchType: 'EXACT',
        timestamp: new Date().toISOString(),
      },
      {
        source: 'Mock Provider (Global Sourcing)',
        title: `Premium ${name} OEM Supplier`,
        url: 'https://www.1688.com/offer/sample_2.html',
        imageUrl: input.imageUrl,
        priceUsd: 2.8,
        currency: 'USD',
        retailer: 'Zhejiang Manufacturing Hub',
        country: 'China',
        similarityScore: 0.88,
        matchType: 'PRODUCT',
        timestamp: new Date().toISOString(),
      },
    ]
  }
}

export function getVisualSearchProvider(): VisualSearchProvider {
  if (process.env.SERPAPI_API_KEY) {
    return new SerpApiVisualSearchProvider()
  }
  return new MockVisualSearchProvider()
}
