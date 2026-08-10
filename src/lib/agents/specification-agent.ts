import { getGeminiModel } from '@/lib/ai/gemini-client'
import { z } from 'zod'

export const SpecificationOutputSchema = z.object({
  unitWeightKg: z.number().min(0.01).max(500).describe('Estimated or extracted unit weight in kg'),
  dimensionsCm: z.object({
    lengthCm: z.number().min(0.1),
    widthCm: z.number().min(0.1),
    heightCm: z.number().min(0.1),
  }).describe('Estimated or extracted unit dimensions in cm'),
  cartonDetails: z.object({
    unitsPerCarton: z.number().min(1),
    lengthCm: z.number().min(1),
    widthCm: z.number().min(1),
    heightCm: z.number().min(1),
    grossWeightKg: z.number().min(0.1),
  }).describe('Packaging carton details for freight calculation'),
  moq: z.number().min(1).describe('Minimum Order Quantity'),
  fobPriceRangeUsd: z.object({
    min: z.number().min(0.01),
    max: z.number().min(0.01),
  }).describe('FOB price range per unit in USD'),
  confidence: z.number().min(0).max(1).describe('Specification extraction confidence'),
})

export type SpecificationOutput = z.infer<typeof SpecificationOutputSchema>

export async function runSpecificationAgent(input: {
  canonicalName: string
  category: string
  material?: string
  description?: string
}): Promise<SpecificationOutput> {
  const model = getGeminiModel()
  const structuredModel = model.withStructuredOutput(SpecificationOutputSchema)

  const prompt = `
You are a supply chain product specification engineer specializing in China factory sourcing data.
Estimate realistic physical specifications, weight, carton packaging dimensions, MOQ, and FOB price range for the following product:

PRODUCT NAME: ${input.canonicalName}
CATEGORY: ${input.category}
MATERIAL: ${input.material || 'Standard'}
DETAILS: ${input.description || 'Standard commercial item'}

RULES:
1. Provide realistic dimensions (L x W x H in cm) and unit weight in kg.
2. Estimate carton packaging (units per carton, carton L x W x H in cm, gross weight).
3. Estimate realistic MOQ (e.g. 50, 100, 500) and wholesale FOB price range in USD.
4. Assign a realistic confidence level.
`

  try {
    const result = await structuredModel.invoke(prompt)
    return result as SpecificationOutput
  } catch (err) {
    console.error('SpecificationAgent error:', err)
    return {
      unitWeightKg: 0.45,
      dimensionsCm: { lengthCm: 15, widthCm: 10, heightCm: 8 },
      cartonDetails: {
        unitsPerCarton: 40,
        lengthCm: 45,
        widthCm: 35,
        heightCm: 30,
        grossWeightKg: 19.5,
      },
      moq: 100,
      fobPriceRangeUsd: { min: 2.5, max: 4.2 },
      confidence: 0.7,
    }
  }
}

