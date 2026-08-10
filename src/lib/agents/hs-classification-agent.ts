import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const HSCandidateSchema = z.object({
  hsCode: z.string().describe('8-digit HS Code (e.g. 3304.99.90)'),
  headingDescription: z.string().describe('Customs tariff heading description (keep under 25 words)'),
  reasoning: z.string().describe('Why this HS code matches the product specifications (keep under 30 words)'),
  confidence: z.number().min(0).max(1).describe('Classification confidence for this candidate'),
})

export const HSClassificationOutputSchema = z.object({
  primaryCandidate: HSCandidateSchema,
  alternativeCandidates: z.array(HSCandidateSchema),
  requiresManualVerification: z.boolean().describe('True if top candidate confidence is under 0.8'),
  verificationGuidance: z.string().describe('Guidance on Sri Lanka Commodity Classification Branch ruling'),
})

export type HSClassificationOutput = z.infer<typeof HSClassificationOutputSchema>

export async function runHSClassificationAgent(input: {
  canonicalName: string
  category: string
  material?: string
  useCase?: string
}): Promise<HSClassificationOutput> {
  const model = getGeminiModel({ maxTokens: 4096 })
  const structuredModel = model.withStructuredOutput(HSClassificationOutputSchema)

  const prompt = `
You are a Sri Lanka Customs tariff classification expert specializing in the Sri Lanka National Imports Tariff.
Classify the following product into top candidate 8-digit HS codes:

PRODUCT: ${input.canonicalName}
CATEGORY: ${input.category}
MATERIAL: ${input.material || 'Plastic / Mixed'}
USE CASE: ${input.useCase || 'General consumer product'}

RULES:
1. Suggest top 2 candidate 8-digit HS codes.
2. Keep headingDescription concise (under 25 words per candidate).
3. Keep reasoning concise (under 30 words per candidate).
4. If uncertainty exists, set requiresManualVerification = true.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as HSClassificationOutput
  } catch (err) {
    console.error('HSClassificationAgent error:', err)
    return {
      primaryCandidate: {
        hsCode: 'PENDING_VERIFICATION',
        headingDescription: 'Unclassified Heading - Tariff Verification Needed',
        reasoning: 'HS Classification Agent hit an API error. Manual tariff verification required.',
        confidence: 0.0,
      },
      alternativeCandidates: [],
      requiresManualVerification: true,
      verificationGuidance: 'HS classification agent failed to auto-classify. Please select an 8-digit HS Code manually in Product Settings.',
    }
  }

}
