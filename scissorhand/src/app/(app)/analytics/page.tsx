'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import type { DashboardMetrics, BarberStats, ReportPeriod } from '@/types'
import { formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: 'Today', value: 'daily' },
  { label: 'This Week', value: 'weekly' },
  { label: 'This Month', value: 'monthly' },
  { label: 'This Year', value: 'yearly' },
]

const GOLD = '#C9A84C'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
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

  const revenueData = barberStats.map((bs) => ({
    name: bs.barber.name,
    revenue: bs.total_revenue,
    tips: bs.total_tips,
    commission: bs.commission_earned,
  }))

  const clientData = barberStats.map((bs) => ({
    name: bs.barber.name,
    clients: bs.total_clients,
    avg: bs.avg_ticket,
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-wide">Analytics</h1>
          <p className="text-surface-5 text-sm mt-1">{label}</p>
        </div>
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
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-64 bg-surface-2 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Revenue by Barber Chart */}
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
            <h2 className="text-xs tracking-widest uppercase text-surface-5 mb-6">
              Revenue by Barber
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#181818', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5' }}
                  formatter={(v: number) => [formatCurrency(v)]}
                  cursor={{ fill: 'rgba(201,168,76,0.05)' }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? GOLD : '#2a2a2a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Clients by Barber */}
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
            <h2 className="text-xs tracking-widest uppercase text-surface-5 mb-6">
              Clients Served
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clientData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#181818', border: '1px solid #333', borderRadius: 8, color: '#f5f5f5' }}
                  cursor={{ fill: 'rgba(201,168,76,0.05)' }}
                />
                <Bar dataKey="clients" fill="#333" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Full stats table */}
          {barberStats.length > 0 && (
            <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-3">
                <h2 className="text-xs tracking-widest uppercase text-surface-5">Full Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-3 text-surface-5 text-xs tracking-widest uppercase">
                      <th className="text-left px-6 py-3">Barber</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">Clients</th>
                      <th className="text-right px-4 py-3">Avg Ticket</th>
                      <th className="text-right px-4 py-3">Tips</th>
                      <th className="text-right px-4 py-3">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barberStats.map((bs, i) => (
                      <tr key={bs.barber.id} className="border-b border-surface-3/40 hover:bg-surface-2">
                        <td className="px-6 py-4 font-medium">
                          <span className={cn('mr-2', i === 0 ? 'text-gold-400' : 'text-surface-5')}>
                            #{i + 1}
                          </span>
                          {bs.barber.name}
                        </td>
                        <td className="px-4 py-4 text-right text-gold-400 font-semibold">
                          {formatCurrency(bs.total_revenue)}
                        </td>
                        <td className="px-4 py-4 text-right">{bs.total_clients}</td>
                        <td className="px-4 py-4 text-right text-surface-5">
                          {formatCurrency(bs.avg_ticket)}
                        </td>
                        <td className="px-4 py-4 text-right">{formatCurrency(bs.total_tips)}</td>
                        <td className="px-4 py-4 text-right text-surface-5">
                          {formatCurrency(bs.commission_earned)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {metrics && (
                    <tfoot>
                      <tr className="border-t border-surface-3 text-xs font-semibold bg-surface-2">
                        <td className="px-6 py-3 text-surface-5 uppercase tracking-wider">Totals</td>
                        <td className="px-4 py-3 text-right text-gold-400">
                          {formatCurrency(metrics.total_revenue)}
                        </td>
                        <td className="px-4 py-3 text-right">{metrics.total_clients}</td>
                        <td className="px-4 py-3 text-right text-surface-5">—</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(metrics.total_tips)}</td>
                        <td className="px-4 py-3 text-right text-surface-5">—</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
