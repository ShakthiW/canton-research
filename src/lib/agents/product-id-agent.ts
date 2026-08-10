import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const ProductIdentificationOutputSchema = z.object({
  canonicalName: z.string().describe('Standardized canonical name of the product'),
  alternativeNames: z.array(z.string()).describe('Alternative search terms and names'),
  keywords: z.array(z.string()).describe('Search keywords for sourcing platforms like 1688 or Alibaba'),
  category: z.string().describe('Primary product category'),
  material: z.string().describe('Primary materials identified (e.g. Stainless Steel 304, ABS Plastic)'),
  useCase: z.string().describe('Intended consumer use case'),
  distinguishingAttributes: z.array(z.string()).describe('Key visual or physical distinguishing features'),
  confidence: z.number().min(0).max(1).describe('Identification confidence rating between 0 and 1'),
})

export type ProductIdentificationOutput = z.infer<typeof ProductIdentificationOutputSchema>

export async function runProductIdentificationAgent(input: {
  productName: string
  description?: string
  imageUrl?: string
  notes?: string
}): Promise<ProductIdentificationOutput> {
  const model = getGeminiModel()
  const structuredModel = model.withStructuredOutput(ProductIdentificationOutputSchema)

  const prompt = `
You are a senior product analyst for China product discovery and sourcing.
Analyze the following product input and identify the exact canonical product specifications.

PRODUCT NAME: ${input.productName}
DESCRIPTION: ${input.description || 'Not provided'}
IMAGE URL: ${input.imageUrl || 'Not provided'}
USER NOTES: ${input.notes || 'None'}

RULES:
1. Provide a concise, highly accurate canonical product name.
2. Generate 5-8 exact supplier search keywords (including materials or descriptors).
3. Identify the primary material and likely consumer use case.
4. Estimate your identification confidence level between 0 and 1. Do NOT hallucinate facts.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as ProductIdentificationOutput
  } catch (err) {
    console.error('ProductIdentificationAgent error:', err)
    // Fallback response if structured output fails
    return {
      canonicalName: input.productName,
      alternativeNames: [input.productName],
      keywords: [input.productName, 'China Wholesale', 'Supplier'],
      category: 'General Goods',
      material: 'Unspecified',
      useCase: 'Consumer product',
      distinguishingAttributes: ['Standard design'],
      confidence: 0.5,
    }
  }
}
