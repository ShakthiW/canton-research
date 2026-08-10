import { executeIntelligenceResearch } from '@/lib/agents/orchestrator'
import { getDb } from '@/lib/mongodb/db'
import { ResearchRun } from '@/types/intelligence'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, type = 'QUICK' } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const db = await getDb()
    const researchRunsCol = db.collection('researchRuns')

    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const now = new Date().toISOString()

    const newRun: ResearchRun = {
      id: runId,
      productId,
      type,
      status: 'QUEUED',
      requestedAt: now,
      agents: {},
      modules: {
        PRODUCT_ID: 'PENDING',
        SUPPLIER_DISCOVERY: 'PENDING',
        SPECIFICATIONS: 'PENDING',
        IMPORT_CUSTOMS: 'PENDING',
        DEMAND_RESEARCH: 'PENDING',
        COMPETITION: 'PENDING',
        OPPORTUNITY_SCORE: 'PENDING',
      },
      sourceCount: 0,
      evidenceCount: 0,
      confidence: 0,
      errors: [],
      warnings: [],
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      estimatedCostUsd: 0.002,
      version: 1,
      isPartial: false,
    }

    await researchRunsCol.insertOne(newRun)

    // Trigger background execution without awaiting completion
    executeIntelligenceResearch({
      runId,
      productId,
      type,
    }).catch((err) => console.error(`Background research execution error for run ${runId}:`, err))

    return NextResponse.json({
      success: true,
      runId,
      status: 'QUEUED',
      message: 'Product intelligence research initiated in background',
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const runId = searchParams.get('runId')
    const productId = searchParams.get('productId')

    const db = await getDb()
    const researchRunsCol = db.collection('researchRuns')

    if (runId) {
      const run = await researchRunsCol.findOne({ id: runId })
      if (!run) {
        return NextResponse.json({ error: 'Research run not found' }, { status: 404 })
      }
      return NextResponse.json(run)
    }

    if (productId) {
      const runs = await researchRunsCol
        .find({ productId })
        .sort({ requestedAt: -1 })
        .limit(5)
        .toArray()
      return NextResponse.json(runs)
    }

    return NextResponse.json({ error: 'runId or productId parameter required' }, { status: 400 })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
