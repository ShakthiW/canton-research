import 'server-only'
import { getDb } from '../mongodb/db'
import type { Fair, FairVisit } from '@/types'

export async function getFairs(): Promise<Fair[]> {
  const db = await getDb()
  const fairs = await db.collection('fairs').find({}).sort({ createdAt: -1 }).toArray()
  return fairs.map(f => ({ ...f, _id: f._id.toString() })) as Fair[]
}

export async function getFairVisits(fairId?: string): Promise<FairVisit[]> {
  const db = await getDb()
  const filter: Record<string, unknown> = {}
  if (fairId) filter.fairId = fairId

  const visits = await db.collection('fairVisits').find(filter).sort({ createdAt: -1 }).toArray()
  return visits.map(v => ({ ...v, _id: v._id.toString() })) as FairVisit[]
}
