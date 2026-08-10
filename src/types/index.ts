import type { ObjectId } from 'mongodb'

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus =
  | 'Researching'
  | 'Shortlisted'
  | 'Supplier Contacted'
  | 'Sample Ordered'
  | 'Sample Received'
  | 'Testing'
  | 'Validated'
  | 'Ready to Order'
  | 'Ordered'
  | 'Rejected'
  | 'Archived'

export type DemandStatus = 'Emerging' | 'Growing' | 'Viral' | 'Stable' | 'Declining' | 'Unknown'
export type CompetitionLevel = 'Low' | 'Medium' | 'High' | 'Saturated' | 'Unknown'
export type SourcePlatform =
  | 'TikTok'
  | 'Instagram'
  | 'YouTube'
  | 'Alibaba'
  | 'Canton Fair'
  | 'Supplier'
  | 'Local market'
  | 'Other'

export type Currency = 'USD' | 'CNY' | 'LKR'

export type RejectionReason =
  | 'Too expensive'
  | 'Too competitive'
  | 'Bad margin'
  | 'MOQ too high'
  | 'Poor quality'
  | 'Shipping difficult'
  | 'Regulatory concern'
  | 'Supplier unreliable'
  | 'Low demand'
  | 'Other'

export type ProductType = 'CANTON_FAIR' | 'DESK_RESEARCH'

export interface OverseasProviderOffer {
  id: string
  platform: '1688' | 'Alibaba' | 'Taobao' | 'Made-in-China' | 'Other'
  storeName: string
  storeUrl?: string
  fobPriceUsd: number
  fobPriceCny?: number
  moq: number
  customizationDetails?: string
  isPreferred?: boolean
  notes?: string
}

export interface SocialProofEntry {
  id: string
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook' | 'Douyin' | 'Other'
  postUrl: string
  viewsCount?: number
  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  commentFeedbackSummary: string
  recordedAt: string
}

export interface LocalCompetitorListing {
  id: string
  platform: 'Daraz' | 'Instagram Shop' | 'Facebook Page' | 'Direct Website' | 'Retail Shop'
  storeName: string
  productUrl?: string
  sellingPriceLkr: number
  stockStatus?: 'In Stock' | 'Out of Stock' | 'Pre-Order'
  observations?: string
}

export interface Product {
  _id: string
  productType?: ProductType
  name: string
  description: string
  category: string
  subcategory: string
  imageUrl: string
  productUrl: string
  sourceUrl: string
  sourcePlatform: SourcePlatform
  tags: string[]
  notes: string
  researchHighlights?: string
  overseasProviders?: OverseasProviderOffer[]
  socialProofs?: SocialProofEntry[]
  localCompetitors?: LocalCompetitorListing[]
  status: ProductStatus


  // Demand
  tiktokViews: number
  instagramEngagement: number
  googleTrendsScore: number
  searchInterest: number
  growthTrend: DemandStatus
  viralStatus: boolean
  demandConfidence: number

  // Competition
  sriLankanCompetitors: string
  competitorCount: number
  localSellingPrice: number
  localAvailability: boolean
  marketplacePresence: string
  competitionLevel: CompetitionLevel

  // Economics
  chinaCost: number
  moq: number
  sampleCost: number
  packagingCost: number
  shippingPerUnit: number
  customsPerUnit: number
  otherCosts: number
  landedCost: number
  sellingPrice: number
  currency: Currency

  // Opportunity Score (0–100)
  score: number
  scoreDemand: number      // 0–20
  scoreMargin: number      // 0–20
  scoreCompetition: number // 0–15
  scoreShipping: number    // 0–10
  scoreBrandability: number // 0–10
  scoreContent: number     // 0–10
  scoreRepeatPurchase: number // 0–5
  scoreRegulatory: number  // 0–5
  scoreSupplier: number    // 0–5

  // Rejection
  rejectionReason: string

  // References
  supplierIds: string[]
  researchItemId: string
  // AI Intelligence Flags
  isAiAnalyzed?: boolean
  lastResearchedAt?: string

  createdAt: string
  updatedAt: string
}


export type ProductListItem = Pick<
  Product,
  | '_id'
  | 'productType'
  | 'name'
  | 'category'
  | 'status'
  | 'chinaCost'
  | 'landedCost'
  | 'sellingPrice'
  | 'moq'
  | 'score'
  | 'competitionLevel'
  | 'currency'
  | 'imageUrl'
  | 'tags'
  | 'updatedAt'
  | 'sourcePlatform'
  | 'growthTrend'
  | 'researchHighlights'
> & { supplierName?: string }


// ─── Supplier ────────────────────────────────────────────────────────────────

export type SupplierType = 'Manufacturer' | 'Trading Company' | 'Unknown'

export interface Supplier {
  _id: string
  companyName: string
  contactPerson: string
  country: string
  city: string
  boothNumber: string
  hall: string
  email: string
  phone: string
  wechat: string
  alibabaUrl: string
  website: string
  supplierType: SupplierType
  categories: string[]
  moq: number
  leadTime: string
  paymentTerms: string
  customization: boolean
  privateLabeling: boolean
  packagingCustomization: boolean
  sampleAvailability: boolean
  sampleCost: number
  notes: string

  // Score
  scoreQuality: number       // 0–20
  scorePricing: number       // 0–20
  scoreCommunication: number // 0–20
  scoreMoq: number           // 0–15
  scoreCustomization: number // 0–10
  scoreLeadTime: number      // 0–10
  scoreReliability: number   // 0–5
  score: number              // 0–100

  createdAt: string
  updatedAt: string
}

// ─── Supplier ↔ Product relationship ────────────────────────────────────────

export interface SupplierProduct {
  _id: string
  supplierId: string
  productId: string
  quotedPrice: number
  moq: number
  quotationDate: string
  customizationAvailable: boolean
  packagingAvailable: boolean
  leadTime: string
  paymentTerms: string
  notes: string
  status: 'Active' | 'Pending' | 'Rejected'
}

// ─── Research ────────────────────────────────────────────────────────────────

export type ResearchPlatform = 'TikTok' | 'Instagram' | 'YouTube' | 'Google' | 'Reddit' | 'Other'
export type TrendStatus = 'Emerging' | 'Growing' | 'Viral' | 'Stable' | 'Declining' | 'Unknown'

export interface ResearchItem {
  _id: string
  title: string
  productId: string
  source: string
  url: string
  platform: ResearchPlatform
  dateDiscovered: string
  views: number
  likes: number
  comments: number
  shares: number
  trendStatus: TrendStatus
  notes: string
  competitionNotes: string
  potential: 'Low' | 'Medium' | 'High' | 'Unknown'
  researchScore: number
  convertedToProduct: boolean
  createdAt: string
  updatedAt: string
}

// ─── Canton Fair ─────────────────────────────────────────────────────────────

export interface Fair {
  _id: string
  name: string
  year: number
  location: string
  phase: string
  startDate: string
  endDate: string
  notes: string
  createdAt: string
}

export type BoothInterestLevel = 'Not Reviewed' | 'Interesting' | 'Shortlisted' | 'Follow Up' | 'Rejected'

export interface FairVisit {
  _id: string
  fairId: string
  boothNumber: string
  hall: string
  phase: string
  supplierId: string
  productId: string
  visitDate: string
  notes: string
  priceQuoted: number
  moq: number
  photoUrl: string
  contactInfo: string
  interestLevel: BoothInterestLevel
  followUpRequired: boolean
  followUpDate: string
  status: BoothInterestLevel
  createdAt: string
  updatedAt: string
}

// ─── Sample ──────────────────────────────────────────────────────────────────

export type SampleDecision = 'Reject' | 'Modify' | 'Retest' | 'Approve' | 'Pending'

export interface Sample {
  _id: string
  productId: string
  supplierId: string
  orderDate: string
  sampleCost: number
  shippingCost: number
  expectedArrival: string
  receivedDate: string
  qualityScore: number
  packagingScore: number
  productUsefulness: number
  customerAppeal: number
  notes: string
  photos: string[]
  finalDecision: SampleDecision
  status: 'Ordered' | 'Shipped' | 'Received' | 'Under Review' | 'Decided'
  createdAt: string
  updatedAt: string
}

// ─── Validation ──────────────────────────────────────────────────────────────

export type ValidationResult = 'Failed' | 'Interesting' | 'Promising' | 'Validated'

export interface Validation {
  _id: string
  productId: string
  testDate: string
  testMethod: string
  marketingChannel: string
  adSpend: number
  views: number
  clicks: number
  inquiries: number
  orders: number
  revenue: number
  customerFeedback: string
  conversionRate: number
  costPerAcquisition: number
  result: ValidationResult
  notes: string
  createdAt: string
  updatedAt: string
}

// ─── Activity ────────────────────────────────────────────────────────────────

export type ActivityType =
  | 'product_created'
  | 'product_updated'
  | 'product_status_changed'
  | 'product_shortlisted'
  | 'supplier_added'
  | 'supplier_linked'
  | 'price_changed'
  | 'sample_ordered'
  | 'sample_received'
  | 'validation_completed'
  | 'fair_visit_added'
  | 'research_converted'

export interface Activity {
  _id: string
  type: ActivityType
  entityId: string
  entityType: 'product' | 'supplier' | 'sample' | 'validation' | 'research' | 'fair'
  entityName: string
  description: string
  metadata: Record<string, unknown>
  createdAt: string
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  _id: string
  exchangeRates: {
    USD_TO_LKR: number
    CNY_TO_LKR: number
    USD_TO_CNY: number
  }
  defaultFreightRate?: {
    provider: string
    ratePerCbmUsd: number
    minimumChargeUsd: number
    mode: 'SEA_LCL' | 'AIR_STANDARD'
  }
  defaultCurrency: Currency
  categories: string[]
  scoreThresholds: {
    exceptional: number   // 90
    strong: number        // 80
    promising: number     // 70
    needsValidation: number // 60
  }
  currentFairId: string
  updatedAt: string
}


// ─── SavedFilter ─────────────────────────────────────────────────────────────

export interface SavedFilter {
  _id: string
  name: string
  filters: Record<string, unknown>
  entityType: 'products' | 'suppliers'
  createdAt: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number
  shortlisted: number
  avgScore: number
  bestMargin: number
  totalSuppliers: number
  samplesOrdered: number
  samplesPending: number
  validated: number
}

export interface PipelineCounts {
  Researching: number
  Shortlisted: number
  'Supplier Contacted': number
  'Sample Ordered': number
  'Sample Received': number
  Testing: number
  Validated: number
  'Ready to Order': number
  Ordered: number
}

// ─── Calculator ──────────────────────────────────────────────────────────────

export interface CalculatorInputs {
  productCost: number
  quantity: number
  currency: Currency
  packagingCost: number
  domesticShipping: number
  internationalShipping: number
  insurance: number
  customsDuty: number
  taxes: number
  clearingFees: number
  localTransport: number
  otherCosts: number
  sellingPrice: number
}

export interface CalculatorResults {
  totalProductCost: number
  totalLandedCost: number
  landedCostPerUnit: number
  grossRevenue: number
  grossProfit: number
  grossMarginPct: number
  roi: number
  breakEvenUnits: number
}
