import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'
import { ensureIndexes } from '@/lib/mongodb/indexes'

export async function GET() {
  try {
    await ensureIndexes()
    const stats = await seedDatabase()
    return NextResponse.json({ success: true, message: 'Database seeded successfully', stats })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
