'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'
import { seedDatabase } from '../seed'

export async function updateExchangeRates(rates: {
  USD_TO_LKR: number
  CNY_TO_LKR: number
  USD_TO_CNY: number
}) {
  const db = await getDb()
  await db.collection('settings').updateOne(
    {},
    { $set: { exchangeRates: rates, updatedAt: new Date() } },
    { upsert: true }
  )
  revalidatePath('/settings')
  revalidatePath('/calculator')
  revalidatePath('/dashboard')
  revalidatePath('/products')
  return { success: true }
}

export async function updateFreightSettings(freight: {
  provider: string
  ratePerCbmUsd: number
  minimumChargeUsd: number
  mode: 'SEA_LCL' | 'AIR_STANDARD'
}) {
  const db = await getDb()
  await db.collection('settings').updateOne(
    {},
    { $set: { defaultFreightRate: freight, updatedAt: new Date() } },
    { upsert: true }
  )
  revalidatePath('/settings')
  revalidatePath('/products')
  return { success: true }
}


export async function triggerReSeed() {
  const result = await seedDatabase()
  revalidatePath('/dashboard')
  revalidatePath('/products')
  revalidatePath('/suppliers')
  revalidatePath('/research')
  revalidatePath('/samples')
  revalidatePath('/canton-fair')
  revalidatePath('/validation')
  revalidatePath('/shortlist')
  return result
}
