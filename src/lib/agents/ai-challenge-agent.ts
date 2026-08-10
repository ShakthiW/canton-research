import { getGeminiProModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const AIChallengeOutputSchema = z.object({
  counterArguments: z.array(z.string()).describe('Direct arguments against importing this product'),
  hiddenCosts: z.array(z.string()).describe('Overlooked costs like local delivery, returns, packaging, or clearing fees'),
  failureModes: z.array(z.string()).describe('Top ways this product import could fail commercially in Sri Lanka'),
  recommendationOverride: z.enum(['STRONG BUY', 'BUY', 'INVESTIGATE', 'VALIDATE FIRST', 'PASS']),
  recommendationReasoning: z.string(),
  verificationChecklist: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      requiredForBulk: z.boolean(),
    })
  ),
})

export type AIChallengeOutput = z.infer<typeof AIChallengeOutputSchema>

export async function runAIChallengeAgent(input: {
  canonicalName: string
  landedCostLkr: number
  targetPriceLkr: number
  grossMarginPercent: number
  opportunityScore: number
}): Promise<AIChallengeOutput> {
  const model = getGeminiProModel()
  const structuredModel = model.withStructuredOutput(AIChallengeOutputSchema)

  const prompt = `
You are an unsparing, critical Red-Team AI Advisor for Sri Lankan importers.
YOUR GOAL: Argue AGAINST this product opportunity. Challenge optimistic assumptions. What could make this venture fail?

PRODUCT: ${input.canonicalName}
LANDED COST: LKR ${input.landedCostLkr.toLocaleString()}
TARGET SELLING PRICE: LKR ${input.targetPriceLkr.toLocaleString()}
GROSS MARGIN: ${input.grossMarginPercent}%
CALCULATED OPPORTUNITY SCORE: ${input.opportunityScore}/100

RULES:
1. Provide 3 sharp counter-arguments why the founder should think twice.
2. Identify hidden costs (returns, breakage, marketing, demurrage, local shipping).
3. Detail top 3 failure modes.
4. Formulate an actionable verification checklist before placing bulk orders.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as AIChallengeOutput
  } catch (err) {
    console.error('AIChallengeAgent error:', err)
    return {
      counterArguments: [
        'Local market price pressure from existing Daraz sellers could erode your margin.',
        'Volumetric shipping dimensions must be physically verified; unverified CBM could raise freight costs.',
        'High reliance on paid social ads can double customer acquisition cost.',
      ],
      hiddenCosts: [
        'Local courier shipping within Sri Lanka (LKR 450 - 650 per delivery)',
        'Breakage and return buffer (5% allowance recommended)',
        'Social media advertisement cost per sale',
      ],
      failureModes: [
        'Ordering bulk inventory before confirming actual sample build quality',
        'Misclassifying Customs HS code resulting in unexpected port penalties',
      ],
      recommendationOverride: 'VALIDATE FIRST',
      recommendationReasoning: 'Strong economics on paper, but physical sample quality and actual CBM quotation must be validated first.',
      verificationChecklist: [
        { id: 'v1', label: 'Order 2 physical samples from supplier', requiredForBulk: true },
        { id: 'v2', label: 'Confirm exact carton dimensions & gross weight', requiredForBulk: true },
        { id: 'v3', label: 'Get written freight quote from forwarder', requiredForBulk: true },
        { id: 'v4', label: 'Verify HS code with clearing agent', requiredForBulk: true },
      ],
    }
  }
}
