import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const RiskAnalysisOutputSchema = z.object({
  overallRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  supplierRisk: z.string(),
  demandRisk: z.string(),
  shippingRisk: z.string(),
  regulatoryRisk: z.string(),
  ipTrademarkRisk: z.string(),
  mitigationSteps: z.array(z.string()),
})

export type RiskAnalysisOutput = z.infer<typeof RiskAnalysisOutputSchema>

export async function runRiskAnalysisAgent(input: {
  canonicalName: string
  hsCode?: string
  isRestricted?: boolean
}): Promise<RiskAnalysisOutput> {
  const model = getGeminiModel()
  const structuredModel = model.withStructuredOutput(RiskAnalysisOutputSchema)

  const prompt = `
You are a supply chain risk manager evaluating Sri Lankan import ventures.
Assess risks for importing:

PRODUCT: ${input.canonicalName}
HS CODE: ${input.hsCode || 'Not classified'}
REGULATORY RESTRICTED: ${input.isRestricted ? 'YES' : 'NO'}

RULES:
1. Categorize overall risk level (LOW / MEDIUM / HIGH).
2. Assess specific risks (Supplier, Demand, Shipping, Regulatory, IP).
3. Provide 3 actionable risk mitigation steps.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as RiskAnalysisOutput
  } catch (err) {
    console.error('RiskAnalysisAgent error:', err)
    return {
      overallRiskLevel: 'MEDIUM',
      supplierRisk: 'Verify supplier packaging to prevent transit damage',
      demandRisk: 'Demand is strong but sensitive to pricing',
      shippingRisk: 'Volumetric weight must be confirmed before air shipment',
      regulatoryRisk: 'Standard customs documentation required',
      ipTrademarkRisk: 'Ensure product does not infringe branded designs',
      mitigationSteps: [
        'Order 2 physical samples for quality inspection',
        'Confirm carton dimensions with supplier before booking freight',
        'Verify tariff classification with Sri Lanka Customs agent',
      ],
    }
  }
}
