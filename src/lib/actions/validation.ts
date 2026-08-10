'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { getDb } from '../mongodb/db'
import type { ValidationResult } from '@/types'

export async function createValidation(data: {
  productId: string
  testMethod: string
  marketingChannel: string
  adSpend: number
  views: number
  clicks: number
  inquiries: number
  orders: number
  revenue: number
  customerFeedback: string
  result: ValidationResult
  notes: string
}) {
  const db = await getDb()

  const conversionRate = data.clicks > 0 ? (data.orders / data.clicks) * 100 : 0
  const costPerAcquisition = data.orders > 0 ? data.adSpend / data.orders : 0

  const doc = {
    productId: data.productId,
    testDate: new Date().toISOString(),
    testMethod: data.testMethod || 'Pre-order Landing Page',
    marketingChannel: data.marketingChannel || 'Meta Ads',
    adSpend: data.adSpend || 0,
    views: data.views || 0,
    clicks: data.clicks || 0,
    inquiries: data.inquiries || 0,
    orders: data.orders || 0,
    revenue: data.revenue || 0,
    customerFeedback: data.customerFeedback || '',
    conversionRate,
    costPerAcquisition,
    result: data.result || 'Promising',
    notes: data.notes || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const res = await db.collection('validations').insertOne(doc)

  // Update product status to Validated if result is Validated
  if (data.result === 'Validated') {
    await db.collection('products').updateOne(
      { _id: new ObjectId(data.productId) },
      { $set: { status: 'Validated', updatedAt: new Date() } }
    )
  }

  await db.collection('activities').insertOne({
    type: 'validation_completed',
    entityId: res.insertedId.toString(),
    entityType: 'validation',
    entityName: 'Market Validation Test',
    description: `Recorded test result: ${data.result} with ${data.orders} orders`,
    metadata: { result: data.result, spend: data.adSpend },
    createdAt: new Date(),
  })

  revalidatePath('/validation')
  revalidatePath('/products')
  revalidatePath('/dashboard')

  return { id: res.insertedId.toString() }
}
