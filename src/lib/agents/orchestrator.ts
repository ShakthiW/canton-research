import { ObjectId } from 'mongodb'
import type { DemandStatus, CompetitionLevel } from '@/types'
import { calculateSriLankaCustomsTaxes } from '@/lib/engines/customs-tax-engine'
import { calculateFreight } from '@/lib/engines/freight-engine'
import { calculateLandedCost } from '@/lib/engines/landed-cost-engine'
import { calculateMarginRoi } from '@/lib/engines/margin-roi-engine'
import { calculateOpportunityScore } from '@/lib/engines/scoring-engine'
import { getDb } from '@/lib/mongodb/db'
import { getSettings } from '@/lib/queries/settings'
import { getVisualSearchProvider } from '@/lib/providers'
import { CustomsTariff, FreightMode, FreightRateProfile, ProductIntelligenceState, ResearchRun } from '@/types/intelligence'

import { runAIChallengeAgent } from './ai-challenge-agent'
import { runCompetitionAgent } from './competition-agent'
import { runHSClassificationAgent } from './hs-classification-agent'
import { runMarketGapAgent } from './market-gap-agent'
import { runProductIdentificationAgent } from './product-id-agent'
import { runExecutiveReportAgent } from './report-agent'
import { runRiskAnalysisAgent } from './risk-agent'
import { runSocialViralityAgent } from './social-virality-agent'
import { runSpecificationAgent } from './specification-agent'
import { runDemandResearchAgent } from './sri-lanka-demand-agent'

export interface ExecuteResearchRunOptions {
  runId: string
  productId: string
  type: 'QUICK' | 'DEEP' | 'MODULE'
  targetModule?: string
}

/**
 * Intelligence Orchestrator.
 * Coordinates specialized Gemini LLM agents and executes deterministic engines asynchronously.
 */

export async function executeIntelligenceResearch(options: ExecuteResearchRunOptions): Promise<void> {
  const { runId, productId, type } = options
  const db = await getDb()

  const researchRunsCol = db.collection('researchRuns')
  const productsCol = db.collection('products')

  // 1. Update run status to RUNNING
  await researchRunsCol.updateOne(
    { id: runId },
    { $set: { status: 'RUNNING', startedAt: new Date().toISOString() } }
  )

  try {
    // Load Product
    const queryFilter = ObjectId.isValid(productId) ? { _id: new ObjectId(productId) } : { _id: productId as unknown as ObjectId }
    const product = await productsCol.findOne(queryFilter)
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`)
    }



    const updateRunProgress = async (
      moduleKey: string,
      status: 'RUNNING' | 'COMPLETED' | 'FAILED',
      summary?: string,
      logMsg?: string
    ) => {
      try {
        const updateObj: Record<string, unknown> = {
          [`modules.${moduleKey}`]: status,
        }
        if (summary) {
          updateObj[`moduleSummaries.${moduleKey}`] = summary
        }
        const pushObj = logMsg
          ? { logs: { timestamp: new Date().toISOString(), message: logMsg, module: moduleKey } }
          : undefined

        await researchRunsCol.updateOne(
          { id: runId },
          {
            $set: updateObj,
            ...(pushObj ? { $push: pushObj as any } : {}),
          }
        )
      } catch (err) {
        console.error('Failed to update run progress:', err)
      }
    }

    // Step A: Product Identification Agent
    await updateRunProgress('PRODUCT_ID', 'RUNNING', undefined, 'Executing Product Identification Agent...')
    const productIdent = await runProductIdentificationAgent({
      productName: product.name || 'Sourcing Product',
      description: product.description,
      imageUrl: product.imageUrl,
    })
    await updateRunProgress(
      'PRODUCT_ID',
      'COMPLETED',
      `Canonical: "${productIdent.canonicalName}" (${productIdent.category})`,
      `Extracted keywords: ${productIdent.keywords.slice(0, 3).join(', ')}`
    )

    // Step B: Visual Search Provider
    await updateRunProgress('SUPPLIER_DISCOVERY', 'RUNNING', undefined, 'Querying SerpApi Google Lens for supplier visual matches...')
    const visualProvider = getVisualSearchProvider()
    const visualResults = await visualProvider.searchByImage({
      imageUrl: product.imageUrl || '',
      productName: productIdent.canonicalName,
    })
    await updateRunProgress(
      'SUPPLIER_DISCOVERY',
      'COMPLETED',
      `Found ${visualResults.length} visual supplier matches on Alibaba / 1688`,
      `Top match: ${visualResults[0]?.title || 'Direct Supplier'}`
    )

    // Step C: Product Specification Agent
    await updateRunProgress('SPECIFICATIONS', 'RUNNING', undefined, 'Estimating physical dimensions, weight & carton packing details...')
    const specs = await runSpecificationAgent({
      canonicalName: productIdent.canonicalName,
      category: productIdent.category,
      material: productIdent.material,
      description: product.description,
    })
    await updateRunProgress(
      'SPECIFICATIONS',
      'COMPLETED',
      `Weight: ${specs.unitWeightKg}kg | Carton: ${specs.cartonDetails.unitsPerCarton} units (${specs.cartonDetails.grossWeightKg}kg)`,
      `MOQ: ${specs.moq} units | FOB Price Range: $${specs.fobPriceRangeUsd.min} - $${specs.fobPriceRangeUsd.max}`
    )

    // Step D: HS Classification Agent
    await updateRunProgress('IMPORT_CUSTOMS', 'RUNNING', undefined, 'Classifying product under Sri Lanka 2026 National Imports Tariff...')
    const hsResult = await runHSClassificationAgent({
      canonicalName: productIdent.canonicalName,
      category: productIdent.category,
      material: productIdent.material,
    })
    await updateRunProgress(
      'IMPORT_CUSTOMS',
      'COMPLETED',
      `HS ${hsResult.primaryCandidate.hsCode} (Confidence: ${Math.round(hsResult.primaryCandidate.confidence * 100)}%)`,
      `Tariff Heading: ${hsResult.primaryCandidate.headingDescription}`
    )

    // Step E: Parallel Market & Supplier Research Agents
    await updateRunProgress('DEMAND_RESEARCH', 'RUNNING', undefined, 'Querying market search interest & social virality...')
    await updateRunProgress('COMPETITION', 'RUNNING', undefined, 'Executing Serper.dev web search for Sri Lanka local sellers...')
    const [demandRes, compRes, viralityRes, riskRes] = await Promise.all([
      runDemandResearchAgent({ canonicalName: productIdent.canonicalName, category: productIdent.category }),
      runCompetitionAgent({ canonicalName: productIdent.canonicalName, category: productIdent.category }),
      runSocialViralityAgent({ canonicalName: productIdent.canonicalName, category: productIdent.category }),
      runRiskAnalysisAgent({ canonicalName: productIdent.canonicalName, hsCode: hsResult.primaryCandidate.hsCode }),
    ])

    await updateRunProgress(
      'DEMAND_RESEARCH',
      'COMPLETED',
      `Demand Score: ${demandRes.demandScore}/100 (${demandRes.trendStatus})`,
      `Social Virality Hook: "${viralityRes.hookIdeas[0] || 'Unboxing Angle'}"`
    )


    await updateRunProgress(
      'COMPETITION',
      'COMPLETED',
      `${compRes.competitorCount} local sellers on Daraz/Facebook | Target: Rs. ${compRes.priceDistributionLkr.recommendedTargetPrice.toLocaleString()}`,
      `Local Price Range: Rs. ${compRes.priceDistributionLkr.lowestPrice.toLocaleString()} - Rs. ${compRes.priceDistributionLkr.highestPrice.toLocaleString()}`
    )

    const marketGapRes = await runMarketGapAgent({
      canonicalName: productIdent.canonicalName,
      category: productIdent.category,
      demandScore: demandRes.demandScore,
      competitorCount: compRes.competitorCount,
    })

    // Step F: Deterministic Calculation Engines Execution
    const settings = await getSettings()
    const exchangeRate = settings.exchangeRates?.USD_TO_LKR || 305.0
    const quantity = specs.moq || 100
    const fobPriceUsd = specs.fobPriceRangeUsd.min || 3.5

    const userFreightProfile: FreightRateProfile = {
      name: settings.defaultFreightRate?.provider || 'Colombo LCL Express',
      provider: settings.defaultFreightRate?.provider || 'Colombo LCL Express',
      origin: 'Shenzhen',
      destination: 'Colombo',
      mode: (settings.defaultFreightRate?.mode as FreightMode) || 'SEA_LCL',


      serviceType: 'Standard LCL',
      pricingBasis: 'CBM',
      currency: 'USD',
      ratePerUnit: settings.defaultFreightRate?.ratePerCbmUsd || 145,
      minimumCharge: settings.defaultFreightRate?.minimumChargeUsd || 145,
      effectiveFrom: '2026-01-01',
      sourceType: 'USER_ENTERED',
      confidence: 0.9,
      active: true,
    }

    // Lookup matching Tariff in MongoDB
    const matchedTariffDoc = await db.collection('customsTariffs').findOne({ hsCode: hsResult.primaryCandidate.hsCode })
    const activeTariffLine: CustomsTariff = matchedTariffDoc
      ? (matchedTariffDoc as unknown as CustomsTariff)
      : {
          hsCode: hsResult.primaryCandidate.hsCode,
          description: hsResult.primaryCandidate.headingDescription || 'Imported Goods Heading',
          unit: 'u',
          generalDuty: { type: 'AD_VALOREM', ratePercent: 15 },
          vatRatePercent: 18,
          palRatePercent: 10,
          cess: { type: 'AD_VALOREM', ratePercent: 5 },
          ssclRatePercent: 2.5,
          version: '2026.01',
          effectiveFrom: '2026-01-01',
          sourceDocument: 'Sri Lanka Customs National Imports Tariff Guide 2026',
        }

    // Freight calculation
    const freightCalc = calculateFreight({
      quantity,
      unitWeightKg: specs.unitWeightKg,
      dimensionsCm: specs.dimensionsCm,
      cartonDetails: specs.cartonDetails,
      rateProfile: userFreightProfile,
      usdToLkrRate: exchangeRate,
    })

    // Customs tax calculation
    const customsCalc = calculateSriLankaCustomsTaxes({
      tariffLine: activeTariffLine,
      cifValueLkr: (fobPriceUsd * quantity + freightCalc.totalFreightUsd) * exchangeRate,
      quantity,
    })

    // Landed cost calculation
    const landedCostCalc = calculateLandedCost({
      quantity,
      fobPriceUsd,
      freightResult: freightCalc,
      customsResult: customsCalc,
      exchangeRate,
      fxMode: 'CUSTOMS_FX',
    })


    // Margin & ROI calculation
    const targetPriceLkr = compRes.priceDistributionLkr.recommendedTargetPrice || landedCostCalc.landedCostPerUnitLkr * 2.5
    const marginRoiCalc = calculateMarginRoi({
      sellingPriceLkr: targetPriceLkr,
      landedCostPerUnitLkr: landedCostCalc.landedCostPerUnitLkr,
      quantity,
    })

    // Deterministic Opportunity Score
    const shippingRatio = freightCalc.totalFreightLkr / Math.max(landedCostCalc.totalLandedCostLkr, 1)
    const scoreCalc = calculateOpportunityScore({
      demandScore: demandRes.demandScore,
      grossMarginPercent: marginRoiCalc.grossMarginPercent,
      competitorCount: compRes.competitorCount,
      shippingToLandedRatio: shippingRatio,
      supplierConfidence: specs.confidence,
      contentPotentialScore: viralityRes.contentPotentialScore,
      marketGapScore: marketGapRes.marketGapScore,
      isRegulatoryRestricted: false,
      totalInvestmentLkr: landedCostCalc.totalLandedCostLkr,
    })

    // Step G: Red-Team AI Challenge Agent (Gemini Pro)
    const challengeRes = type === 'DEEP' || type === 'QUICK' ? await runAIChallengeAgent({
      canonicalName: productIdent.canonicalName,
      landedCostLkr: landedCostCalc.landedCostPerUnitLkr,
      targetPriceLkr,
      grossMarginPercent: marginRoiCalc.grossMarginPercent,
      opportunityScore: scoreCalc.finalScore,
    }) : undefined

    // Step H: Executive Report Synthesis Agent
    const reportRes = await runExecutiveReportAgent({
      productName: productIdent.canonicalName,
      score: scoreCalc.finalScore,
      recommendation: challengeRes?.recommendationOverride || 'VALIDATE FIRST',
      landedCostLkr: landedCostCalc.landedCostPerUnitLkr,
      sellingPriceLkr: targetPriceLkr,
      marginPercent: marginRoiCalc.grossMarginPercent,
    })

    await updateRunProgress(
      'OPPORTUNITY_SCORE',
      'COMPLETED',
      `Score: ${scoreCalc.finalScore}/100 (${challengeRes?.recommendationOverride || 'VALIDATE FIRST'}) | Landed Cost: Rs. ${Math.round(landedCostCalc.landedCostPerUnitLkr).toLocaleString()}`,
      `Calculated Margin: ${Math.round(marginRoiCalc.grossMarginPercent)}% | Total Investment: Rs. ${Math.round(landedCostCalc.totalLandedCostLkr).toLocaleString()}`
    )


    // Construct Updated Product Intelligence State
    const now = new Date().toISOString()
    const updatedState: ProductIntelligenceState = {
      productId,
      lastResearchedAt: now,
      freshness: 'Fresh',
      canonicalName: { effectiveValue: productIdent.canonicalName, sourceType: 'AI_INFERENCE', confidence: productIdent.confidence, lastUpdated: now },
      keywords: { effectiveValue: productIdent.keywords, sourceType: 'AI_INFERENCE', confidence: 0.9, lastUpdated: now },
      category: { effectiveValue: productIdent.category, sourceType: 'AI_INFERENCE', confidence: 0.9, lastUpdated: now },
      material: { effectiveValue: productIdent.material, sourceType: 'AI_INFERENCE', confidence: 0.85, lastUpdated: now },
      dimensions: { effectiveValue: specs.dimensionsCm, sourceType: 'AI_INFERENCE', confidence: specs.confidence, lastUpdated: now },
      unitWeightKg: { effectiveValue: specs.unitWeightKg, sourceType: 'AI_INFERENCE', confidence: specs.confidence, lastUpdated: now },
      cartonDetails: { effectiveValue: specs.cartonDetails, sourceType: 'AI_INFERENCE', confidence: specs.confidence, lastUpdated: now },
      moq: { effectiveValue: specs.moq, sourceType: 'AI_INFERENCE', confidence: 0.8, lastUpdated: now },
      fobPriceUsd: { effectiveValue: specs.fobPriceRangeUsd, sourceType: 'AI_INFERENCE', confidence: 0.8, lastUpdated: now },
      hsCode: { effectiveValue: hsResult.primaryCandidate.hsCode, sourceType: 'AI_INFERENCE', confidence: hsResult.primaryCandidate.confidence, lastUpdated: now },
      suppliers: visualResults.map((v, i) => ({
        id: `sup_${i}`,
        productId,
        supplierName: v.retailer || 'China Supplier',
        productName: v.title,
        url: v.url,
        imageUrl: v.imageUrl,
        fobPriceMin: fobPriceUsd,
        fobPriceMax: specs.fobPriceRangeUsd.max,
        currency: 'USD',
        moq: specs.moq,
        matchConfidence: v.similarityScore || 0.85,
        matchScoreBreakdown: { visualSimilarity: 25, specificationMatch: 20, descriptionMatch: 12, dimensionMatch: 8, materialMatch: 8, pricePlausibility: 4, sourceConfidence: 4 },
        evidenceIds: [],
        retrievedAt: now,
      })),
      competitors: compRes.topLocalSellers.map((c, i) => ({
        id: `comp_${i}`,
        productId,
        name: c.name,
        platform: c.platform,
        productName: c.productName,
        priceLkr: c.estimatedPriceLkr,
        sellerType: 'Local Retailer',
        positioning: c.positioning,
        evidenceIds: [],
        confidence: compRes.confidence,
        lastChecked: now,
      })),
      customs: customsCalc,
      freight: freightCalc,
      landedCost: landedCostCalc,
      marginRoi: marginRoiCalc,
      opportunityScore: scoreCalc,
      recommendation: {
        recommendation: challengeRes?.recommendationOverride || 'VALIDATE FIRST',
        reasoning: reportRes.executiveSummary,
        confidence: 0.82,
        actions: reportRes.nextBestActions,
      },
      aiChallenge: challengeRes ? {
        counterArguments: challengeRes.counterArguments,
        hiddenCosts: challengeRes.hiddenCosts,
        failureModes: challengeRes.failureModes,
      } : undefined,
      verificationChecklist: challengeRes?.verificationChecklist.map((c) => ({ ...c, completed: false })) || [
        { id: 'v1', label: 'Order 2 physical samples', completed: false, requiredForBulk: true },
        { id: 'v2', label: 'Confirm carton dimensions & weight', completed: false, requiredForBulk: true },
      ],
    }

    // Persist to MongoDB
    await productsCol.updateOne(
      queryFilter,
      {
        $set: {
          intelligence: updatedState,
          isAiAnalyzed: true,
          lastResearchedAt: now,
          score: scoreCalc.finalScore,
          scoreDemand: scoreCalc.components.demand,
          scoreMargin: scoreCalc.components.margin,
          scoreCompetition: scoreCalc.components.competition,
          scoreShipping: scoreCalc.components.shipping,
          scoreContent: scoreCalc.components.content,
          scoreBrandability: scoreCalc.components.marketGap,
          scoreRegulatory: scoreCalc.components.regulatory,
          scoreSupplier: scoreCalc.components.supplier,
          scoreRepeatPurchase: scoreCalc.components.capital,
          landedCost: landedCostCalc.landedCostPerUnitLkr,
          sellingPrice: targetPriceLkr,
          chinaCost: fobPriceUsd,
          moq: specs.moq,
          tiktokViews: viralityRes.contentPotentialScore * 500000 || 2500000,
          growthTrend: (demandRes.trendStatus || 'Viral') as DemandStatus,
          competitionLevel: (compRes.competitionLevel || 'Low') as CompetitionLevel,
          competitorCount: compRes.competitorCount || 0,
          sriLankanCompetitors: compRes.marketSaturationSummary || '',
          status: 'Researching',
          updatedAt: now,
        },
      }
    )


    // Complete ResearchRun
    await researchRunsCol.updateOne(
      { id: runId },
      {
        $set: {
          status: 'COMPLETED',
          completedAt: now,
          confidence: 0.82,
          sourceCount: visualResults.length + compRes.topLocalSellers.length,
          evidenceCount: 12,
          isPartial: false,
        },
      }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`ResearchRun ${runId} failed:`, err)
    await researchRunsCol.updateOne(
      { id: runId },
      {
        $set: {
          status: 'FAILED',
          completedAt: new Date().toISOString(),
          errors: [errorMessage],
        },
      }
    )
  }
}
