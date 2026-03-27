'use client'

import { useEffect, useState } from 'react'
import type { Barber } from '@/types'
import { cn } from '@/lib/utils'
import { Plus, Check, X, Trash2, Pencil } from 'lucide-react'

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Barber>>({})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCash, setNewCash] = useState('60')
  const [newTap, setNewTap] = useState('55')

  async function load() {
    const res = await fetch('/api/barbers')
    setBarbers(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(id: string) {
    const res = await fetch(`/api/barbers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    const updated = await res.json()
    setBarbers((prev) => prev.map((b) => (b.id === id ? updated : b)))
    setEditing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deactivate this barber?')) return
    await fetch(`/api/barbers/${id}`, { method: 'DELETE' })
    setBarbers((prev) => prev.filter((b) => b.id !== id))
  }

  async function handleAdd() {
    if (!newName.trim()) return
    const res = await fetch('/api/barbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        cash_commission_pct: parseFloat(newCash),
        tap_commission_pct: parseFloat(newTap),
      }),
    })
    const b = await res.json()
    setBarbers((prev) => [...prev, b])
    setAdding(false)
    setNewName('')
    setNewCash('60')
    setNewTap('55')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-wide">Barbers</h1>
          <p className="text-surface-5 text-sm mt-1">{barbers.length} active barbers</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Barber
        </button>
      </div>

      {/* Add barber form */}
      {adding && (
        <div className="bg-surface-1 border border-gold-500/30 rounded-xl p-5 mb-4 animate-slide-up">
          <h3 className="text-sm font-medium mb-4">New Barber</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-base"
              autoFocus
            />
            <div className="relative">
              <input
                type="number"
                placeholder="Cash %"
                value={newCash}
                onChange={(e) => setNewCash(e.target.value)}
                className="input-base pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-5 text-sm">%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Tap %"
                value={newTap}
                onChange={(e) => setNewTap(e.target.value)}
                className="input-base pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-5 text-sm">%</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="btn-gold text-sm">Save</button>
            <button onClick={() => setAdding(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3 text-surface-5 text-xs tracking-widest uppercase">
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-right px-4 py-3">Cash %</th>
                <th className="text-right px-4 py-3">Tap %</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {barbers.map((b) => (
                <tr key={b.id} className="border-b border-surface-3/40 hover:bg-surface-2">
                  {editing === b.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editData.name ?? b.name}
                          onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                          className="input-base py-2 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.cash_commission_pct ?? b.cash_commission_pct}
                          onChange={(e) => setEditData((d) => ({ ...d, cash_commission_pct: parseFloat(e.target.value) }))}
                          className="input-base py-2 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editData.tap_commission_pct ?? b.tap_commission_pct}
                          onChange={(e) => setEditData((d) => ({ ...d, tap_commission_pct: parseFloat(e.target.value) }))}
                          className="input-base py-2 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleSave(b.id)} className="text-gold-400 hover:text-gold-300">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditing(null)} className="text-surface-5 hover:text-white">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium">{b.name}</td>
                      <td className="px-4 py-4 text-right text-surface-5">{b.cash_commission_pct}%</td>
                      <td className="px-4 py-4 text-right text-surface-5">{b.tap_commission_pct}%</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => { setEditing(b.id); setEditData({}) }}
                            className="text-surface-5 hover:text-white transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="text-surface-5 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
