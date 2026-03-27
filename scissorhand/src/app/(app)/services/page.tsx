'use client'

import { useEffect, useState } from 'react'
import type { Service } from '@/types'
import { formatCurrency } from '@/lib/calculations'
import { Plus, Check, X, Trash2, Pencil } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Service>>({})
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')

  async function load() {
    const res = await fetch('/api/services')
    setServices(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(id: string) {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    const updated = await res.json()
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)))
    setEditing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this service?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleAdd() {
    if (!newName.trim() || !newPrice) return
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), price: parseFloat(newPrice) }),
    })
    const s = await res.json()
    setServices((prev) => [...prev, s])
    setAdding(false)
    setNewName('')
    setNewPrice('')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-wide">Services</h1>
          <p className="text-surface-5 text-sm mt-1">{services.length} active services</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {adding && (
        <div className="bg-surface-1 border border-gold-500/30 rounded-xl p-5 mb-4 animate-slide-up">
          <h3 className="text-sm font-medium mb-4">New Service</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Service name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-base"
              autoFocus
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-5">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="input-base pl-7"
              />
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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3 text-surface-5 text-xs tracking-widest uppercase">
                <th className="text-left px-6 py-3">Service</th>
                <th className="text-right px-6 py-3">Price</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-surface-3/40 hover:bg-surface-2">
                  {editing === s.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editData.name ?? s.name}
                          onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                          className="input-base py-2 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editData.price ?? s.price}
                          onChange={(e) => setEditData((d) => ({ ...d, price: parseFloat(e.target.value) }))}
                          className="input-base py-2 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleSave(s.id)} className="text-gold-400 hover:text-gold-300">
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
                      <td className="px-6 py-4 font-medium">{s.name}</td>
                      <td className="px-6 py-4 text-right text-gold-400 font-semibold">
                        {formatCurrency(s.price)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => { setEditing(s.id); setEditData({}) }}
                            className="text-surface-5 hover:text-white transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
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
