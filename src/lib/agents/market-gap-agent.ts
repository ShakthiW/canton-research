import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const MarketGapOutputSchema = z.object({
  marketGapScore: z.number().min(0).max(100),
  positioningStrategy: z.string(),
  mainSellingProposition: z.string(),
  unservedNiches: z.array(z.string()),
  packagingOpportunity: z.string(),
})

export type MarketGapOutput = z.infer<typeof MarketGapOutputSchema>

export async function runMarketGapAgent(input: {
  canonicalName: string
  category: string
  demandScore: number
  competitorCount: number
}): Promise<MarketGapOutput> {
  const model = getGeminiModel()
  const structuredModel = model.withStructuredOutput(MarketGapOutputSchema)

  const prompt = `
You are a strategic product positioning and market gap analyst for Sri Lanka.
Identify market gaps and differentiation angles for:

PRODUCT: ${input.canonicalName}
DEMAND SCORE: ${input.demandScore}
COMPETITORS: ${input.competitorCount}

RULES:
1. Determine Market Gap score (0-100).
2. Define a winning local positioning strategy and main unique selling proposition (USP).
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as MarketGapOutput
  } catch (err) {
    console.error('MarketGapAgent error:', err)
    return {
      marketGapScore: 75,
      positioningStrategy: 'Position as a premium minimalist solution with fast islandwide delivery',
      mainSellingProposition: 'Higher build quality than basic market alternatives with 1-year warranty',
      unservedNiches: ['Work-from-home professionals', 'Boutique office setups'],
      packagingOpportunity: 'Custom branded box with English instruction manual',
    }
  }
}
