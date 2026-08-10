import 'server-only'
import { ObjectId } from 'mongodb'
import { getDb } from '../mongodb/db'
import type { Validation } from '@/types'

export async function getValidations(productId?: string): Promise<Validation[]> {
  const db = await getDb()
  const filter: Record<string, unknown> = {}
  if (productId) filter.productId = productId

  const validations = await db.collection('validations').find(filter).sort({ createdAt: -1 }).toArray()
  return validations.map(v => ({ ...v, _id: v._id.toString() })) as Validation[]
}
