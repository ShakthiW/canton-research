import { getDb } from '@/lib/mongodb/db'
import { CustomsFixedCharge, CustomsTariff, ExchangeRate, FreightRateProfile } from '@/types/intelligence'

export const SAMPLE_2026_TARIFFS: CustomsTariff[] = [
  {
    hsCode: '3926.90.90',
    description: 'Other articles of plastics and articles of other materials of headings 39.01 to 39.14',
    unit: 'u',
    generalDuty: { type: 'AD_VALOREM', ratePercent: 15 },
    vatRatePercent: 18,
    palRatePercent: 10,
    cess: { type: 'AD_VALOREM', ratePercent: 5 },
    ssclRatePercent: 2.5,
    version: '2026.01',
    effectiveFrom: '2026-01-01',
    sourceDocument: 'Sri Lanka Customs National Imports Tariff Guide 2026',
  },
  {
    hsCode: '8504.40.90',
    description: 'Static converters; direct current power supplies and chargers',
    unit: 'u',
    generalDuty: { type: 'AD_VALOREM', ratePercent: 10 },
    vatRatePercent: 18,
    palRatePercent: 10,
    cess: { type: 'AD_VALOREM', ratePercent: 0 },
    ssclRatePercent: 2.5,
    version: '2026.01',
    effectiveFrom: '2026-01-01',
    sourceDocument: 'Sri Lanka Customs National Imports Tariff Guide 2026',
  },
  {
    hsCode: '9403.60.00',
    description: 'Other wooden furniture',
    unit: 'u',
    generalDuty: { type: 'AD_VALOREM', ratePercent: 30 },
    vatRatePercent: 18,
    palRatePercent: 10,
    cess: { type: 'AD_VALOREM', ratePercent: 15 },
    ssclRatePercent: 2.5,
    version: '2026.01',
    effectiveFrom: '2026-01-01',
    sourceDocument: 'Sri Lanka Customs National Imports Tariff Guide 2026',
  },
]

export const SAMPLE_FIXED_CHARGES: CustomsFixedCharge[] = [
  { id: 'fc_1', name: 'Customs Declaration Computer Charge', chargeLkr: 250, basis: 'PER_DECLARATION', effectiveFrom: '2026-01-01', active: true },
  { id: 'fc_2', name: 'Container Seal Charge', chargeLkr: 100, basis: 'PER_CONTAINER', effectiveFrom: '2026-01-01', active: true },
  { id: 'fc_3', name: 'FCL Cargo Overtime Charge', chargeLkr: 1600, basis: 'PER_SHIPMENT', effectiveFrom: '2026-01-01', active: true },
]

export const SAMPLE_EXCHANGE_RATES: ExchangeRate[] = [
  {
    baseCurrency: 'USD',
    quoteCurrency: 'LKR',
    customsRate: 325.0,
    planningRate: 330.0,
    effectiveFrom: '2026-01-01',
    retrievedAt: new Date().toISOString(),
    source: 'Sri Lanka Customs Weekly Published Exchange Rates 2026',
  },
]

export const SAMPLE_FREIGHT_PROFILES: FreightRateProfile[] = [
  {
    name: 'Shenzhen to Colombo Sea LCL Standard',
    provider: 'Lanka Logistics Forwarders',
    origin: 'Shenzhen',
    destination: 'Colombo',
    mode: 'SEA_LCL',
    serviceType: 'Standard LCL',
    pricingBasis: 'CBM',
    currency: 'USD',
    ratePerUnit: 145,
    minimumCharge: 145,
    effectiveFrom: '2026-01-01',
    sourceType: 'OFFICIAL',
    confidence: 0.9,
    active: true,
  },
]

export async function seedImportTariffData() {
  const db = await getDb()

  const customsCol = db.collection('customsTariffs')
  const chargesCol = db.collection('importCharges')
  const fxCol = db.collection('exchangeRates')
  const freightCol = db.collection('freightRates')

  for (const tariff of SAMPLE_2026_TARIFFS) {
    await customsCol.updateOne({ hsCode: tariff.hsCode }, { $set: tariff }, { upsert: true })
  }

  for (const charge of SAMPLE_FIXED_CHARGES) {
    await chargesCol.updateOne({ id: charge.id }, { $set: charge }, { upsert: true })
  }

  for (const fx of SAMPLE_EXCHANGE_RATES) {
    await fxCol.updateOne({ baseCurrency: fx.baseCurrency, quoteCurrency: fx.quoteCurrency }, { $set: fx }, { upsert: true })
  }

  for (const freight of SAMPLE_FREIGHT_PROFILES) {
    await freightCol.updateOne({ name: freight.name }, { $set: freight }, { upsert: true })
  }

  console.log('Import Intelligence seed data successfully applied.')
}
