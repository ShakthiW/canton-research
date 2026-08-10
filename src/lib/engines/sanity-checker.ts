export interface SanityCheckIssue {
  field: string
  issue: string
  severity: 'WARNING' | 'ERROR'
  value: unknown
}

export interface SanityCheckResult {
  isValid: boolean
  hasWarnings: boolean
  issues: SanityCheckIssue[]
}

/**
 * Intelligence Data Sanity Checker Engine.
 * Catches hallucinated values, negative dimensions, impossible margins, and malformed tariffs.
 */
export function sanitizeAndCheckIntelligenceData(data: {
  weightKg?: number
  dimensionsCm?: { lengthCm: number; widthCm: number; heightCm: number }
  fobPriceUsd?: number
  sellingPriceLkr?: number
  moq?: number
  grossMarginPercent?: number
  opportunityScore?: number
  hsCode?: string
}): SanityCheckResult {
  const issues: SanityCheckIssue[] = []

  // 1. Weight Validation
  if (data.weightKg !== undefined) {
    if (data.weightKg <= 0) {
      issues.push({
        field: 'weightKg',
        issue: 'Product weight must be greater than 0 kg',
        severity: 'ERROR',
        value: data.weightKg,
      })
    } else if (data.weightKg > 500) {
      issues.push({
        field: 'weightKg',
        issue: 'Product weight exceeds 500 kg (unusually heavy for standard commercial items)',
        severity: 'WARNING',
        value: data.weightKg,
      })
    }
  }

  // 2. Dimensions Validation
  if (data.dimensionsCm) {
    const { lengthCm, widthCm, heightCm } = data.dimensionsCm
    if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) {
      issues.push({
        field: 'dimensionsCm',
        issue: 'Product dimensions must be positive non-zero numbers',
        severity: 'ERROR',
        value: data.dimensionsCm,
      })
    }
  }

  // 3. FOB Price
  if (data.fobPriceUsd !== undefined) {
    if (data.fobPriceUsd <= 0) {
      issues.push({
        field: 'fobPriceUsd',
        issue: 'FOB price must be positive',
        severity: 'ERROR',
        value: data.fobPriceUsd,
      })
    }
  }

  // 4. MOQ
  if (data.moq !== undefined) {
    if (data.moq < 1) {
      issues.push({
        field: 'moq',
        issue: 'MOQ must be at least 1 unit',
        severity: 'ERROR',
        value: data.moq,
      })
    }
  }

  // 5. Margin Sanity
  if (data.grossMarginPercent !== undefined) {
    if (data.grossMarginPercent >= 100) {
      issues.push({
        field: 'grossMarginPercent',
        issue: 'Gross margin cannot equal or exceed 100%',
        severity: 'ERROR',
        value: data.grossMarginPercent,
      })
    } else if (data.grossMarginPercent < -200) {
      issues.push({
        field: 'grossMarginPercent',
        issue: 'Gross margin is extremely negative (< -200%)',
        severity: 'WARNING',
        value: data.grossMarginPercent,
      })
    }
  }

  // 6. Score Sanity
  if (data.opportunityScore !== undefined) {
    if (data.opportunityScore < 0 || data.opportunityScore > 100) {
      issues.push({
        field: 'opportunityScore',
        issue: 'Opportunity score must be strictly between 0 and 100',
        severity: 'ERROR',
        value: data.opportunityScore,
      })
    }
  }

  // 7. HS Code Format
  if (data.hsCode) {
    const cleanedHs = data.hsCode.replace(/\./g, '').trim()
    if (!/^\d{4,10}$/.test(cleanedHs)) {
      issues.push({
        field: 'hsCode',
        issue: 'HS Code should consist of 4 to 10 digits',
        severity: 'WARNING',
        value: data.hsCode,
      })
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'ERROR')
  const hasWarnings = issues.some((i) => i.severity === 'WARNING')

  return {
    isValid: !hasErrors,
    hasWarnings,
    issues,
  }
}
