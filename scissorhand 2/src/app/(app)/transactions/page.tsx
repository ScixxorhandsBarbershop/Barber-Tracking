'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { Transaction } from '@/types'
import { formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import { Trash2, Pencil, Search } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/transactions?limit=200')
    const data = await res.json()
    setTransactions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    setDeleting(null)
  }

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.barber?.name.toLowerCase().includes(q) ||
      t.service?.name.toLowerCase().includes(q) ||
      t.payment_method.includes(q)
    )
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-wide">Transaction Log</h1>
          <p className="text-surface-5 text-sm mt-1">{transactions.length} total records</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-5" />
          <input
            type="text"
            placeholder="Search barber, service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3 text-surface-5 text-xs tracking-widest uppercase">
                  <th className="text-left px-5 py-3">Date & Time</th>
                  <th className="text-left px-4 py-3">Barber</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Service</th>
                  <th className="text-left px-4 py-3">Method</th>
                  <th className="text-right px-4 py-3">Base</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">HST</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Tip</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Commission</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-surface-3/40 hover:bg-surface-2 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-surface-5 whitespace-nowrap">
                      {format(new Date(t.created_at), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{t.barber?.name}</td>
                    <td className="px-4 py-3.5 text-surface-5 hidden sm:table-cell">{t.service?.name}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide',
                        t.payment_method === 'cash'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-blue-500/10 text-blue-400'
                      )}>
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">{formatCurrency(t.base_price)}</td>
                    <td className="px-4 py-3.5 text-right text-surface-5 hidden md:table-cell">
                      {t.hst_amount > 0 ? formatCurrency(t.hst_amount) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gold-400">
                      {formatCurrency(t.total_charged)}
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      {t.tip_amount > 0 ? formatCurrency(t.tip_amount) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell text-surface-5">
                      {formatCurrency(t.commission_payout)}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="text-surface-5 hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-surface-5">
                No transactions found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
