import { CustomsCalculationResult, CustomsFixedCharge, CustomsTariff } from '@/types/intelligence'

export interface CalculateCustomsInput {
  tariffLine: CustomsTariff
  cifValueLkr: number
  quantity: number
  fixedCharges?: CustomsFixedCharge[]
  exemptions?: {
    palExempt?: boolean
    vatExempt?: boolean
    cessExempt?: boolean
  }
}

/**
 * Deterministic Sri Lanka Customs Tax Engine based on official 2026 Tariff rules.
 * NEVER perform LLM tax calculation. Use pure deterministic arithmetic.
 */
export function calculateSriLankaCustomsTaxes(
  input: CalculateCustomsInput
): CustomsCalculationResult {
  const { tariffLine, cifValueLkr, quantity, fixedCharges = [], exemptions = {} } = input

  const explanations: { levy: string; formula: string; amountLkr: number }[] = []

  // 1. Customs Duty
  let customsDutyLkr = 0
  if (tariffLine.generalDuty.type === 'AD_VALOREM') {
    const rate = tariffLine.generalDuty.ratePercent || 0
    customsDutyLkr = (cifValueLkr * rate) / 100
    explanations.push({
      levy: 'Customs Duty (General)',
      formula: `CIF (LKR ${cifValueLkr.toLocaleString()}) × ${rate}%`,
      amountLkr: Math.round(customsDutyLkr),
    })
  } else if (tariffLine.generalDuty.type === 'SPECIFIC') {
    const unitRate = tariffLine.generalDuty.specificAmountLkr || 0
    customsDutyLkr = quantity * unitRate
    explanations.push({
      levy: 'Customs Duty (Specific)',
      formula: `Quantity (${quantity}) × LKR ${unitRate}`,
      amountLkr: Math.round(customsDutyLkr),
    })
  } else if (tariffLine.generalDuty.type === 'COMPOUND') {
    const rate = tariffLine.generalDuty.ratePercent || 0
    const unitRate = tariffLine.generalDuty.specificAmountLkr || 0
    customsDutyLkr = Math.max((cifValueLkr * rate) / 100, quantity * unitRate)
    explanations.push({
      levy: 'Customs Duty (Compound - Max)',
      formula: `Max(${rate}% CIF, Qty × LKR ${unitRate})`,
      amountLkr: Math.round(customsDutyLkr),
    })
  }

  // 2. PAL (Ports and Airports Development Levy)
  let palLkr = 0
  if (!exemptions.palExempt && tariffLine.palRatePercent > 0) {
    palLkr = (cifValueLkr * tariffLine.palRatePercent) / 100
    explanations.push({
      levy: 'PAL Levy',
      formula: `CIF (LKR ${cifValueLkr.toLocaleString()}) × ${tariffLine.palRatePercent}%`,
      amountLkr: Math.round(palLkr),
    })
  }

  // 3. CESS Levy
  let cessLkr = 0
  if (!exemptions.cessExempt) {
    if (tariffLine.cess.type === 'AD_VALOREM' && tariffLine.cess.ratePercent) {
      cessLkr = (cifValueLkr * tariffLine.cess.ratePercent) / 100
      explanations.push({
        levy: 'CESS Levy (Ad-Valorem)',
        formula: `CIF (LKR ${cifValueLkr.toLocaleString()}) × ${tariffLine.cess.ratePercent}%`,
        amountLkr: Math.round(cessLkr),
      })
    } else if (tariffLine.cess.type === 'SPECIFIC' && tariffLine.cess.specificAmountLkr) {
      cessLkr = quantity * tariffLine.cess.specificAmountLkr
      explanations.push({
        levy: 'CESS Levy (Specific)',
        formula: `Quantity (${quantity}) × LKR ${tariffLine.cess.specificAmountLkr}`,
        amountLkr: Math.round(cessLkr),
      })
    } else if (tariffLine.cess.type === 'COMPOUND') {
      const adVal = (cifValueLkr * (tariffLine.cess.ratePercent || 0)) / 100
      const spec = quantity * (tariffLine.cess.specificAmountLkr || 0)
      cessLkr = Math.max(adVal, spec)
      explanations.push({
        levy: 'CESS Levy (Compound)',
        formula: `Max(${tariffLine.cess.ratePercent}% CIF, Qty × LKR ${tariffLine.cess.specificAmountLkr})`,
        amountLkr: Math.round(cessLkr),
      })
    }
  }

  // 4. Excise Duty
  let exciseLkr = 0
  if (tariffLine.excise) {
    if (tariffLine.excise.type === 'AD_VALOREM' && tariffLine.excise.ratePercent) {
      const exciseBase = cifValueLkr + customsDutyLkr + palLkr + cessLkr
      exciseLkr = (exciseBase * tariffLine.excise.ratePercent) / 100
      explanations.push({
        levy: 'Excise Duty',
        formula: `(CIF + Duty + PAL + CESS) × ${tariffLine.excise.ratePercent}%`,
        amountLkr: Math.round(exciseLkr),
      })
    } else if (tariffLine.excise.type === 'SPECIFIC' && tariffLine.excise.specificAmountLkr) {
      exciseLkr = quantity * tariffLine.excise.specificAmountLkr
      explanations.push({
        levy: 'Excise Duty (Specific)',
        formula: `Quantity (${quantity}) × LKR ${tariffLine.excise.specificAmountLkr}`,
        amountLkr: Math.round(exciseLkr),
      })
    }
  }

  // 5. Special Commodity Levy (SCL) - replaces other taxes if active on tariff line
  let sclLkr = 0
  if (tariffLine.sclAmountLkr && tariffLine.sclAmountLkr > 0) {
    sclLkr = quantity * tariffLine.sclAmountLkr
    explanations.push({
      levy: 'Special Commodity Levy (SCL)',
      formula: `Quantity (${quantity}) × LKR ${tariffLine.sclAmountLkr} (Replaces other taxes)`,
      amountLkr: Math.round(sclLkr),
    })
    // SCL replaces other levies per SL Customs rule
    customsDutyLkr = 0
    palLkr = 0
    cessLkr = 0
    exciseLkr = 0
  }

  // 6. SSCL (Social Security Contribution Levy)
  let ssclLkr = 0
  if (tariffLine.ssclRatePercent > 0) {
    const ssclBase = cifValueLkr + customsDutyLkr + palLkr + cessLkr + exciseLkr
    ssclLkr = (ssclBase * tariffLine.ssclRatePercent) / 100
    explanations.push({
      levy: 'SSCL Levy',
      formula: `(Tax Base: LKR ${Math.round(ssclBase).toLocaleString()}) × ${tariffLine.ssclRatePercent}%`,
      amountLkr: Math.round(ssclLkr),
    })
  }

  // 7. VAT (Value Added Tax)
  let vatLkr = 0
  if (!exemptions.vatExempt && tariffLine.vatRatePercent > 0) {
    const vatBase = cifValueLkr + customsDutyLkr + palLkr + cessLkr + exciseLkr + ssclLkr
    vatLkr = (vatBase * tariffLine.vatRatePercent) / 100
    explanations.push({
      levy: 'VAT',
      formula: `(Tax Base: LKR ${Math.round(vatBase).toLocaleString()}) × ${tariffLine.vatRatePercent}%`,
      amountLkr: Math.round(vatLkr),
    })
  }

  // 8. Surcharge
  let surchargeLkr = 0
  if (tariffLine.surchargePercent && tariffLine.surchargePercent > 0) {
    surchargeLkr = (customsDutyLkr * tariffLine.surchargePercent) / 100
    explanations.push({
      levy: 'Customs Duty Surcharge',
      formula: `Customs Duty × ${tariffLine.surchargePercent}%`,
      amountLkr: Math.round(surchargeLkr),
    })
  }

  // 9. Fixed Charges
  const fixedCustomsChargesLkr = fixedCharges
    .filter((c) => c.active)
    .reduce((sum, c) => sum + c.chargeLkr, 0)

  if (fixedCustomsChargesLkr > 0) {
    explanations.push({
      levy: 'Fixed Port/Customs Fees',
      formula: fixedCharges
        .filter((c) => c.active)
        .map((c) => `${c.name}: LKR ${c.chargeLkr}`)
        .join(', '),
      amountLkr: fixedCustomsChargesLkr,
    })
  }

  // Total Taxes
  const totalTaxesLkr = Math.round(
    customsDutyLkr +
      palLkr +
      cessLkr +
      exciseLkr +
      ssclLkr +
      vatLkr +
      sclLkr +
      surchargeLkr +
      fixedCustomsChargesLkr
  )

  const effectiveTaxRatePercent =
    cifValueLkr > 0 ? Number(((totalTaxesLkr / cifValueLkr) * 100).toFixed(2)) : 0

  return {
    hsCode: tariffLine.hsCode,
    cifValueLkr: Math.round(cifValueLkr),
    customsDutyLkr: Math.round(customsDutyLkr),
    palLkr: Math.round(palLkr),
    cessLkr: Math.round(cessLkr),
    ssclLkr: Math.round(ssclLkr),
    vatLkr: Math.round(vatLkr),
    exciseLkr: Math.round(exciseLkr),
    sclLkr: Math.round(sclLkr),
    surchargeLkr: Math.round(surchargeLkr),
    fixedCustomsChargesLkr,
    totalTaxesLkr,
    effectiveTaxRatePercent,
    tariffVersion: tariffLine.version,
    explanations,
  }
}
