// ─── Research Run & Agent Workflow Types ─────────────────────────────────────

export type ResearchRunType = 'QUICK' | 'DEEP' | 'MODULE' | 'MANUAL_REFRESH' | 'SCHEDULED'

export type ResearchRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'PARTIALLY_COMPLETE'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type AgentExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'

export interface AgentRunState {
  agentName: string
  status: AgentExecutionStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export interface ResearchRun {
  id: string
  productId: string
  type: ResearchRunType
  status: ResearchRunStatus
  requestedAt: string
  startedAt?: string
  completedAt?: string
  triggeredBy?: string
  agents: Record<string, AgentRunState>
  modules: Record<string, 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'>
  sourceCount: number
  evidenceCount: number
  confidence: number // 0 – 1
  errors: string[]
  warnings: string[]
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  estimatedCostUsd: number
  version: number
  isPartial: boolean
  logs?: { timestamp: string; message: string; module?: string }[]
  moduleSummaries?: Record<string, string>
}


// ─── Data Provenance & Evidence Types ───────────────────────────────────────

export type SourceType =
  | 'OFFICIAL'
  | 'SUPPLIER'
  | 'MARKETPLACE'
  | 'SEARCH'
  | 'SOCIAL'
  | 'USER_ENTERED'
  | 'AI_INFERENCE'
  | 'HISTORICAL'

export interface ResearchEvidence {
  id: string
  researchRunId: string
  productId: string
  claim: string
  value: string | number | boolean | object
  sourceUrl?: string
  sourceName: string
  sourceType: SourceType
  sourceTier: 1 | 2 | 3 | 4 | 5 | 6 // 1 = Official Govt, 6 = AI Inference
  retrievedAt: string
  confidence: number // 0 – 1
  excerpt?: string
  agent: string
  hash: string
}

export interface DataFieldProvenance<T> {
  aiValue?: T
  manualValue?: T
  effectiveValue: T
  sourceType: SourceType
  sourceName?: string
  confidence: number
  lastUpdated: string
  updatedBy?: string
}

// ─── Supplier & Candidate Types ─────────────────────────────────────────────

export interface SupplierCandidate {
  id: string
  productId: string
  supplierName: string
  companyType?: 'Manufacturer' | 'Trading Company' | 'Wholesaler' | 'Unknown'
  productName: string
  url: string
  imageUrl?: string
  fobPriceMin: number
  fobPriceMax: number
  currency: 'USD' | 'CNY'
  moq: number
  material?: string
  dimensions?: {
    lengthCm: number
    widthCm: number
    heightCm: number
  }
  unitWeightKg?: number
  matchConfidence: number
  matchScoreBreakdown: {
    visualSimilarity: number // 0 - 30
    specificationMatch: number // 0 - 25
    descriptionMatch: number // 0 - 15
    dimensionMatch: number // 0 - 10
    materialMatch: number // 0 - 10
    pricePlausibility: number // 0 - 5
    sourceConfidence: number // 0 - 5
  }
  evidenceIds: string[]
  retrievedAt: string
}

// ─── Sri Lanka Competitor & Market Types ─────────────────────────────────────

export interface CompetitorInfo {
  id: string
  productId: string
  name: string
  url?: string
  platform: string // e.g. 'Daraz', 'Instagram', 'Ikman', 'Standalone Web'
  productName: string
  priceLkr: number
  sellerType: 'Local Retailer' | 'Importer' | 'Marketplace Seller' | 'Unknown'
  socialProfiles?: {
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  followersCount?: number
  reviewCount?: number
  rating?: number
  positioning: 'Budget' | 'Value' | 'Mid-market' | 'Premium' | 'Luxury'
  evidenceIds: string[]
  confidence: number
  lastChecked: string
}

// ─── Sri Lanka Customs & Tariff Types ────────────────────────────────────────

export type TariffDutyType = 'AD_VALOREM' | 'SPECIFIC' | 'COMPOUND' | 'EXEMPT'

export interface CustomsTariff {
  _id?: string
  hsCode: string // e.g. '3926.90.90'
  description: string
  unit: string // e.g. 'kg', 'u', 'm'
  generalDuty: {
    type: TariffDutyType
    ratePercent?: number
    specificAmountLkr?: number
    unitBasis?: string
  }
  vatRatePercent: number // e.g. 18
  palRatePercent: number // e.g. 10
  cess: {
    type: TariffDutyType
    ratePercent?: number
    specificAmountLkr?: number
  }
  excise?: {
    type: TariffDutyType
    ratePercent?: number
    specificAmountLkr?: number
  }
  ssclRatePercent: number // e.g. 2.5
  sclAmountLkr?: number // Special Commodity Levy if applicable
  surchargePercent?: number
  importControlStatus?: 'Restricted' | 'Licensed' | 'Free' | 'Prohibited'
  slsiStatus?: 'Mandatory' | 'Exempt' | 'Not Specified'
  effectiveFrom: string
  effectiveTo?: string
  version: string // e.g. '2026.01'
  sourceDocument: string
}

export interface CustomsFixedCharge {
  id: string
  name: string // e.g. 'Computer Charge', 'Container Seal', 'FCL Overtime'
  chargeLkr: number
  basis: 'PER_DECLARATION' | 'PER_CONTAINER' | 'PER_SHIPMENT'
  effectiveFrom: string
  active: boolean
}

export interface CustomsCalculationResult {
  hsCode: string
  cifValueLkr: number
  customsDutyLkr: number
  palLkr: number
  cessLkr: number
  ssclLkr: number
  vatLkr: number
  exciseLkr: number
  sclLkr: number
  surchargeLkr: number
  fixedCustomsChargesLkr: number
  totalTaxesLkr: number
  effectiveTaxRatePercent: number
  tariffVersion: string
  explanations: {
    levy: string
    formula: string
    amountLkr: number
  }[]
}

// ─── Shipping & Freight Types ────────────────────────────────────────────────

export type FreightMode = 'AIR' | 'SEA_LCL' | 'SEA_FCL' | 'EXPRESS' | 'COURIER'
export type PricingBasis = 'KG' | 'CHARGEABLE_KG' | 'CBM' | 'CONTAINER' | 'SHIPMENT'

export interface FreightRateProfile {
  _id?: string
  name: string
  provider: string
  origin: string // e.g. 'Shenzhen', 'Guangzhou', 'Ningbo'
  destination: string // e.g. 'Colombo'
  mode: FreightMode
  serviceType: string // e.g. 'Standard LCL', 'Priority Air'
  pricingBasis: PricingBasis
  currency: 'USD' | 'LKR'
  ratePerUnit: number
  minimumCharge: number
  volumetricDivisor?: number // Default 5000 for Courier/Air, 6000 for Cargo Air
  effectiveFrom: string
  effectiveTo?: string
  sourceType: SourceType
  confidence: number
  active: boolean
  notes?: string
}

export interface FreightCalculationResult {
  mode: FreightMode
  actualWeightKg: number
  totalCbm: number
  chargeableWeightKg: number
  pricingBasis: PricingBasis
  ratePerUnitUsd: number
  totalFreightUsd: number
  totalFreightLkr: number
  rangeUsd: {
    optimistic: number
    expected: number
    conservative: number
  }
  providerName: string
  confidence: number
}

// ─── Exchange Rates & Landed Cost ────────────────────────────────────────────

export interface ExchangeRate {
  _id?: string
  baseCurrency: 'USD' | 'CNY'
  quoteCurrency: 'LKR'
  customsRate: number // Official Sri Lanka Customs Valuation Rate
  planningRate: number // User or Market FX rate for cost modeling
  effectiveFrom: string
  effectiveTo?: string
  retrievedAt: string
  source: string
}

export interface LandedCostScenario {
  scenarioName: 'Optimistic' | 'Expected' | 'Conservative'
  fobPriceUsd: number
  freightCostUsd: number
  insuranceCostUsd: number
  cifLkr: number
  customsTaxesLkr: number
  clearingChargesLkr: number
  localTransportLkr: number
  totalLandedCostLkr: number
  landedCostPerUnitLkr: number
}

export interface LandedCostResult {
  quantity: number
  unitWeightKg: number
  unitCbm: number
  exchangeRateUsed: number
  fxMode: 'CUSTOMS_FX' | 'PLANNING_FX'
  goodsCostLkr: number
  freightCostLkr: number
  insuranceCostLkr: number
  cifValueLkr: number
  customsTaxesLkr: number
  portClearingLkr: number
  localTransportLkr: number
  totalLandedCostLkr: number
  landedCostPerUnitLkr: number
  scenarios: {
    optimistic: LandedCostScenario
    expected: LandedCostScenario
    conservative: LandedCostScenario
  }
}

// ─── Financial Margin & ROI Types ───────────────────────────────────────────

export interface MarginRoiResult {
  sellingPriceLkr: number
  landedCostPerUnitLkr: number
  grossProfitPerUnitLkr: number
  grossMarginPercent: number
  roiPercent: number
  totalInvestmentLkr: number
  capitalAtRiskLkr: number
  breakEvenUnits: number
  inventoryRecoveryMonths: number
}

// ─── Opportunity Score & AI Challenge Types ─────────────────────────────────

export interface ScoreConfiguration {
  id: string
  name: string
  weights: {
    demand: number // default 20
    margin: number // default 20
    competition: number // default 10
    shipping: number // default 10
    supplier: number // default 10
    content: number // default 10
    marketGap: number // default 10
    regulatory: number // default 5
    capital: number // default 5
  }
  isDefault: boolean
}

export interface OpportunityScoreResult {
  aiScore: number // 0 – 100
  manualAdjustment: number
  finalScore: number // 0 – 100
  components: {
    demand: number
    margin: number
    competition: number
    shipping: number
    supplier: number
    content: number
    marketGap: number
    regulatory: number
    capital: number
  }
  explanation: string
  positiveFactors: string[]
  topRisks: string[]
  calculatedAt: string
}

export type RecommendationType =
  | 'STRONG BUY'
  | 'BUY'
  | 'INVESTIGATE'
  | 'VALIDATE FIRST'
  | 'PASS'

export interface AIRecommendation {
  recommendation: RecommendationType
  reasoning: string
  confidence: number
  actions: string[]
}

export interface VerificationCheckitem {
  id: string
  label: string
  completed: boolean
  requiredForBulk: boolean
}

// ─── Complete Aggregated Product Intelligence State ─────────────────────────

export interface ProductIntelligenceState {
  productId: string
  lastResearchedAt?: string
  freshness: 'Fresh' | 'Aging' | 'Stale'
  canonicalName?: DataFieldProvenance<string>
  keywords?: DataFieldProvenance<string[]>
  category?: DataFieldProvenance<string>
  material?: DataFieldProvenance<string>
  dimensions?: DataFieldProvenance<{
    lengthCm: number
    widthCm: number
    heightCm: number
  }>
  unitWeightKg?: DataFieldProvenance<number>
  cartonDetails?: DataFieldProvenance<{
    unitsPerCarton: number
    lengthCm: number
    widthCm: number
    heightCm: number
    grossWeightKg: number
  }>
  moq?: DataFieldProvenance<number>
  fobPriceUsd?: DataFieldProvenance<{ min: number; max: number }>
  hsCode?: DataFieldProvenance<string>
  suppliers: SupplierCandidate[]
  competitors: CompetitorInfo[]
  customs?: CustomsCalculationResult
  freight?: FreightCalculationResult
  landedCost?: LandedCostResult
  marginRoi?: MarginRoiResult
  opportunityScore?: OpportunityScoreResult
  recommendation?: AIRecommendation
  aiChallenge?: {
    counterArguments: string[]
    hiddenCosts: string[]
    failureModes: string[]
  }
  socialVirality?: {
    contentPotentialScore: number
    demonstrationPotential: string
    visualNovelty: string
    ugcPotential: string
    recommendedAngles: string[]
    hookIdeas: string[]
    socialEvidenceLinks?: { title: string; link: string }[]
  }
  competition?: {
    competitorCount: number
    competitionLevel: string
    priceDistributionLkr: {
      lowestPrice: number
      medianPrice: number
      highestPrice: number
      recommendedTargetPrice: number
    }
    topLocalSellers: {
      name: string
      platform: string
      productName: string
      estimatedPriceLkr: number
      positioning: string
    }[]
    marketSaturationSummary: string
    confidence: number
  }
  demandResearch?: {
    demandScore: number
    trendStatus: string
    searchInterestScore: number
    searchGrowthTrendPercent: number
    targetCustomerSegment: string
    demandKeyDrivers: string[]
    seasonalityNotes: string
    researchConfidence: number
  }
  marketGap?: {
    marketGapScore: number
    gapType: string
    opportunityDescription: string
    uniquePositioningAngle: string
    suggestedBundling: string[]
  }
  verificationChecklist: VerificationCheckitem[]
}


