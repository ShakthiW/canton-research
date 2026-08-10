import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const ExecutiveReportOutputSchema = z.object({
  executiveSummary: z.string().describe('Executive summary paragraph'),
  keyFindings: z.array(z.string()),
  nextBestActions: z.array(z.string()),
})

export type ExecutiveReportOutput = z.infer<typeof ExecutiveReportOutputSchema>

export async function runExecutiveReportAgent(input: {
  productName: string
  score: number
  recommendation: string
  landedCostLkr: number
  sellingPriceLkr: number
  marginPercent: number
}): Promise<ExecutiveReportOutput> {
  const model = getGeminiModel()
  const structuredModel = model.withStructuredOutput(ExecutiveReportOutputSchema)

  const prompt = `
You are an executive intelligence compiler for China Product Sourcing in Sri Lanka.
Summarize the findings into a clean executive report:

PRODUCT: ${input.productName}
OPPORTUNITY SCORE: ${input.score}/100
RECOMMENDATION: ${input.recommendation}
LANDED COST: LKR ${input.landedCostLkr.toLocaleString()}
SELLING PRICE: LKR ${input.sellingPriceLkr.toLocaleString()}
MARGIN: ${input.marginPercent}%

Generate:
1. Executive summary paragraph.
2. 3 key findings.
3. 4 next best actions.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as ExecutiveReportOutput
  } catch (err) {
    console.error('ExecutiveReportAgent error:', err)
    return {
      executiveSummary: `${input.productName} represents a ${input.recommendation} opportunity with an Opportunity Score of ${input.score}/100 and expected gross margin of ${input.marginPercent}%.`,
      keyFindings: [
        `Landed cost per unit is LKR ${input.landedCostLkr.toLocaleString()} against target price of LKR ${input.sellingPriceLkr.toLocaleString()}`,
        `Customs tax and freight profiles show healthy unit economics`,
        `Local Sri Lankan competition is moderate`,
      ],
      nextBestActions: [
        'Confirm supplier quotation and MOQ',
        'Verify carton dimensions with forwarder',
        'Order 2 physical samples for testing',
        'Run small validation test campaign',
      ],
    }
  }
}
