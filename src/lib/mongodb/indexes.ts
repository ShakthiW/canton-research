import 'server-only'
import { getDb } from './db'

export async function ensureIndexes() {
  const db = await getDb()

  // Products
  const products = db.collection('products')
  await products.createIndexes([
    { key: { status: 1 }, background: true },
    { key: { category: 1 }, background: true },
    { key: { score: -1 }, background: true },
    { key: { createdAt: -1 }, background: true },
    { key: { updatedAt: -1 }, background: true },
    { key: { sourcePlatform: 1 }, background: true },
    { key: { competitionLevel: 1 }, background: true },
    { key: { status: 1, score: -1 }, background: true },
    { key: { name: 'text', description: 'text', tags: 'text' }, background: true },
  ])

  // Suppliers
  const suppliers = db.collection('suppliers')
  await suppliers.createIndexes([
    { key: { companyName: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
    { key: { score: -1 }, background: true },
    { key: { companyName: 'text', contactPerson: 'text' }, background: true },
  ])

  // Research items
  const research = db.collection('researchItems')
  await research.createIndexes([
    { key: { platform: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
    { key: { trendStatus: 1 }, background: true },
    { key: { convertedToProduct: 1 }, background: true },
  ])

  // Samples
  const samples = db.collection('samples')
  await samples.createIndexes([
    { key: { status: 1 }, background: true },
    { key: { productId: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
  ])

  // Validations
  const validations = db.collection('validations')
  await validations.createIndexes([
    { key: { result: 1 }, background: true },
    { key: { productId: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
  ])

  // Fair visits
  const fairVisits = db.collection('fairVisits')
  await fairVisits.createIndexes([
    { key: { fairId: 1 }, background: true },
    { key: { status: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
  ])

  // Activities
  const activities = db.collection('activities')
  await activities.createIndexes([
    { key: { entityId: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
    { key: { type: 1 }, background: true },
  ])

  // SupplierProducts
  const supplierProducts = db.collection('supplierProducts')
  await supplierProducts.createIndexes([
    { key: { supplierId: 1 }, background: true },
    { key: { productId: 1 }, background: true },
    { key: { supplierId: 1, productId: 1 }, unique: true, background: true },
  ])

  // Intelligence: Research Runs
  const researchRuns = db.collection('researchRuns')
  await researchRuns.createIndexes([
    { key: { productId: 1 }, background: true },
    { key: { status: 1 }, background: true },
    { key: { createdAt: -1 }, background: true },
  ])

  // Intelligence: Evidence
  const researchEvidence = db.collection('researchEvidence')
  await researchEvidence.createIndexes([
    { key: { productId: 1 }, background: true },
    { key: { researchRunId: 1 }, background: true },
    { key: { sourceType: 1 }, background: true },
  ])

  // Intelligence: Customs Tariffs
  const customsTariffs = db.collection('customsTariffs')
  await customsTariffs.createIndexes([
    { key: { hsCode: 1 }, background: true },
    { key: { version: 1 }, background: true },
    { key: { hsCode: 1, version: 1 }, background: true },
  ])

  // Intelligence: Freight Rates
  const freightRates = db.collection('freightRates')
  await freightRates.createIndexes([
    { key: { origin: 1, destination: 1, mode: 1 }, background: true },
    { key: { active: 1 }, background: true },
  ])

  // Intelligence: Competitors
  const competitors = db.collection('competitors')
  await competitors.createIndexes([
    { key: { productId: 1 }, background: true },
    { key: { lastChecked: -1 }, background: true },
  ])

  // Intelligence: Market Signals
  const marketSignals = db.collection('marketSignals')
  await marketSignals.createIndexes([
    { key: { productId: 1 }, background: true },
    { key: { type: 1 }, background: true },
    { key: { recordedAt: -1 }, background: true },
  ])
}

