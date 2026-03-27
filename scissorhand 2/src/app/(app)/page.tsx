'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardMetrics, BarberStats, ReportPeriod } from '@/types'
import { TrendingUp, Users, Scissors, Banknote, CreditCard, DollarSign, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: 'Today', value: 'daily' },
  { label: 'This Week', value: 'weekly' },
  { label: 'This Month', value: 'monthly' },
  { label: 'This Year', value: 'yearly' },
]

function StatCard({
  label, value, icon: Icon, sub, gold
}: { label: string; value: string; icon: React.ElementType; sub?: string; gold?: boolean }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <span className="text-surface-5 text-xs tracking-widest uppercase">{label}</span>
        <div className={cn('p-1.5 rounded-md', gold ? 'bg-gold-500/10' : 'bg-surface-3')}>
          <Icon size={14} className={gold ? 'text-gold-400' : 'text-surface-5'} />
        </div>
      </div>
      <div className={cn('text-2xl font-semibold', gold ? 'text-gold-400' : 'text-white')}>
        {value}
      </div>
      {sub && <div className="text-surface-5 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<ReportPeriod>('daily')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [barberStats, setBarberStats] = useState<BarberStats[]>([])
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?period=${period}`)
    const data = await res.json()
    setMetrics(data.metrics)
    setBarberStats(data.barberStats)
    setLabel(data.label)
    setLoading(false)
  }, [period])

  useEffect(() => { load() }, [load])

  const m = metrics

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-wide text-white">
            Dashboard
          </h1>
          <p className="text-surface-5 text-sm mt-1">{label}</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-surface-2 rounded-lg p-1 border border-surface-3">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all duration-150 whitespace-nowrap',
                period === p.value
                  ? 'bg-gold-500 text-black font-medium'
                  : 'text-surface-5 hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="stat-card h-24 animate-pulse bg-surface-2" />
          ))}
        </div>
      ) : m ? (
        <>
          {/* Main metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Revenue" value={formatCurrency(m.total_revenue)} icon={TrendingUp} gold />
            <StatCard label="Net Revenue" value={formatCurrency(m.net_revenue)} icon={DollarSign} sub="After commission" />
            <StatCard label="Clients Served" value={m.total_clients.toString()} icon={Users} />
            <StatCard label="Services Done" value={m.total_services.toString()} icon={Scissors} />
            <StatCard label="Cash" value={formatCurrency(m.cash_revenue)} icon={Banknote} sub="No HST" />
            <StatCard label="Tap / Card" value={formatCurrency(m.tap_revenue)} icon={CreditCard} sub="Incl. HST" />
            <StatCard label="Total Tips" value={formatCurrency(m.total_tips)} icon={DollarSign} />
            <StatCard label="HST Collected" value={formatCurrency(m.hst_collected)} icon={BarChart2} />
          </div>

          {/* Barber Rankings */}
          {barberStats.length > 0 && (
            <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-light tracking-wide">Leaderboard</h2>
                <span className="text-xs text-surface-5 tracking-widest uppercase">{label}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-3 text-surface-5 text-xs tracking-widest uppercase">
                      <th className="text-left px-6 py-3">#</th>
                      <th className="text-left px-4 py-3">Barber</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">Clients</th>
                      <th className="text-right px-4 py-3 hidden md:table-cell">Tips</th>
                      <th className="text-right px-4 py-3 hidden lg:table-cell">Avg Ticket</th>
                      <th className="text-right px-4 py-3 hidden lg:table-cell">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barberStats.map((bs, i) => (
                      <tr key={bs.barber.id} className={cn(
                        'border-b border-surface-3/50 transition-colors hover:bg-surface-2',
                        i === 0 && 'bg-gold-500/5'
                      )}>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'font-semibold text-base',
                            i === 0 ? 'text-gold-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-surface-5'
                          )}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium">{bs.barber.name}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gold-400">
                          {formatCurrency(bs.total_revenue)}
                        </td>
                        <td className="px-4 py-4 text-right text-surface-5 hidden sm:table-cell">
                          {bs.total_clients}
                        </td>
                        <td className="px-4 py-4 text-right hidden md:table-cell">
                          {formatCurrency(bs.total_tips)}
                        </td>
                        <td className="px-4 py-4 text-right text-surface-5 hidden lg:table-cell">
                          {formatCurrency(bs.avg_ticket)}
                        </td>
                        <td className="px-4 py-4 text-right hidden lg:table-cell">
                          {formatCurrency(bs.commission_earned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {barberStats.length === 0 && (
            <div className="text-center py-20 text-surface-5">
              <Scissors size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No transactions for this period</p>
              <p className="text-sm mt-1">Add your first transaction to get started</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
