import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { fetchMetrics } from '@/lib/reports'
import { sendDailyReport, sendWeeklyReport, sendMonthlyReport } from '@/lib/email'

// Vercel cron calls this with Authorization header
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'daily' | 'weekly' | 'monthly'

  try {
    const db = createAdminClient()

    if (type === 'daily') {
      const { metrics, barberStats, label } = await fetchMetrics(db, 'daily', 0)
      await sendDailyReport(metrics, barberStats, label)
      return NextResponse.json({ sent: 'daily', label })
    }

    if (type === 'weekly') {
      const { metrics, barberStats, label } = await fetchMetrics(db, 'weekly', 0)
      await sendWeeklyReport(metrics, barberStats, label)
      return NextResponse.json({ sent: 'weekly', label })
    }

    if (type === 'monthly') {
      const { metrics, barberStats, label } = await fetchMetrics(db, 'monthly', 0)
      await sendMonthlyReport(metrics, barberStats, label)
      return NextResponse.json({ sent: 'monthly', label })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (e: any) {
    console.error('Cron error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
