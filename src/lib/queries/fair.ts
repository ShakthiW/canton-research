import 'server-only'
import { getDb } from '../mongodb/db'
import type { Fair, FairVisit, FairZone } from '@/types'

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

export async function getFairZones(): Promise<FairZone[]> {
  const db = await getDb()
  const zones = await db.collection('fairZones').find({}).sort({ createdAt: 1 }).toArray()
  return zones.map(z => ({ ...z, _id: z._id.toString() })) as FairZone[]
}


