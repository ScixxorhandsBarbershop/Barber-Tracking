import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardMetrics, BarberStats, ReportPeriod } from '@/types'
import { getDateRange, toISO } from './dates'

export async function fetchMetrics(
  db: SupabaseClient,
  period: ReportPeriod,
  offset = 0
): Promise<{ metrics: DashboardMetrics; barberStats: BarberStats[]; label: string }> {
  const { start, end, label } = getDateRange(period, offset)

  const { data: txns, error } = await db
    .from('transactions')
    .select('*, barber:barbers(*), service:services(*)')
    .gte('created_at', toISO(start))
    .lte('created_at', toISO(end))

  if (error) throw error

  const rows = txns ?? []

  // ---- Dashboard Metrics ----
  const metrics: DashboardMetrics = {
    total_revenue: 0,
    cash_revenue: 0,
    tap_revenue: 0,
    total_tips: 0,
    total_clients: rows.length,
    total_services: rows.length,
    hst_collected: 0,
    net_revenue: 0,
  }

  const barberMap = new Map<string, BarberStats>()

  for (const t of rows) {
    metrics.total_revenue += t.base_price
    metrics.total_tips += t.tip_amount
    metrics.hst_collected += t.hst_amount
    metrics.net_revenue += t.net_revenue

    if (t.payment_method === 'cash') metrics.cash_revenue += t.base_price
    else metrics.tap_revenue += t.base_price

    if (!barberMap.has(t.barber_id)) {
      barberMap.set(t.barber_id, {
        barber: t.barber,
        total_revenue: 0,
        total_clients: 0,
        total_services: 0,
        total_tips: 0,
        avg_ticket: 0,
        commission_earned: 0,
      })
    }
    const bs = barberMap.get(t.barber_id)!
    bs.total_revenue += t.base_price
    bs.total_clients += 1
    bs.total_services += 1
    bs.total_tips += t.tip_amount
    bs.commission_earned += t.commission_payout
  }

  // Compute averages
  const barberStats = Array.from(barberMap.values()).map((bs, i) => ({
    ...bs,
    avg_ticket: bs.total_clients > 0 ? bs.total_revenue / bs.total_clients : 0,
    rank: i + 1,
  }))

  barberStats.sort((a, b) => b.total_revenue - a.total_revenue)
  barberStats.forEach((bs, i) => (bs.rank = i + 1))

  return { metrics, barberStats, label }
}
