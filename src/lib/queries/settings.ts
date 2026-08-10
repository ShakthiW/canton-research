import 'server-only'
import { getDb } from '../mongodb/db'
import type { Settings } from '@/types'

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const doc = await db.collection('settings').findOne({})
  const defaultFreightRate = {
    provider: 'Colombo LCL Express',
    ratePerCbmUsd: 145,
    minimumChargeUsd: 145,
    mode: 'SEA_LCL' as const,
  }

  if (!doc) {
    return {
      _id: '',
      exchangeRates: { USD_TO_LKR: 305, CNY_TO_LKR: 42, USD_TO_CNY: 7.24 },
      defaultFreightRate,
      defaultCurrency: 'LKR',
      categories: [
        'Electronics', 'Home', 'Kitchen', 'Beauty', 'Automotive',
        'Travel', 'Fitness', 'Pets', 'Office', 'Lifestyle', 'Gifts', 'Other',
      ],
      scoreThresholds: { exceptional: 90, strong: 80, promising: 70, needsValidation: 60 },
      currentFairId: '',
      updatedAt: new Date().toISOString(),
    }
  }

  return {
    ...doc,
    _id: doc._id.toString(),
    defaultFreightRate: doc.defaultFreightRate || defaultFreightRate,
  } as Settings
}

