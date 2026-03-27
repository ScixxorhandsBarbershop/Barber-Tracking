import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { fetchMetrics } from '@/lib/reports'
import type { ReportPeriod } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'daily') as ReportPeriod
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const db = createAdminClient()
    const result = await fetchMetrics(db, period, offset)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
