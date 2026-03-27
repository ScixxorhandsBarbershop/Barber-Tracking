'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service, Barber, PaymentMethod } from '@/types'
import { calculateTransaction, formatCurrency, TIP_PRESETS } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import { CheckCircle, ChevronDown } from 'lucide-react'

type Step = 'service' | 'barber' | 'payment' | 'tip' | 'review'

export default function NewTransactionPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [tipAmount, setTipAmount] = useState(0)
  const [tipInput, setTipInput] = useState('')
  const [tipMode, setTipMode] = useState<'preset' | 'manual'>('preset')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetch('/api/services'), fetch('/api/barbers')])
      .then(async ([s, b]) => [await s.json(), await b.json()])
      .then(([s, b]) => { setServices(s); setBarbers(b); setLoading(false) })
  }, [])

  const calc = selectedService && selectedBarber && paymentMethod
    ? calculateTransaction(selectedService, selectedBarber, paymentMethod, tipAmount)
    : null

  function handleTipPreset(pct: number) {
    if (!selectedService) return
    const amount = parseFloat(((selectedService.price * pct) / 100).toFixed(2))
    setTipAmount(amount)
    setTipInput(amount.toString())
    setTipMode('preset')
  }

  function handleTipManual(val: string) {
    setTipInput(val)
    setTipMode('manual')
    const n = parseFloat(val)
    setTipAmount(isNaN(n) ? 0 : n)
  }

  async function handleSubmit() {
    if (!selectedService || !selectedBarber || !paymentMethod) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        payment_method: paymentMethod,
        tip_amount: tipAmount,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedService(null)
      setSelectedBarber(null)
      setPaymentMethod(null)
      setTipAmount(0)
      setTipInput('')
      setSubmitting(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-surface-5 text-sm tracking-widest uppercase animate-pulse">Loading…</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 animate-fade-in">
        <CheckCircle size={64} className="text-gold-400" />
        <h2 className="font-display text-2xl text-white">Transaction Saved</h2>
        {calc && (
          <p className="text-surface-5">{formatCurrency(calc.total_charged + tipAmount)} total</p>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-wide text-white">
          New Transaction
        </h1>
        <p className="text-surface-5 text-sm mt-1">Enter client details below</p>
      </div>

      <div className="space-y-6">

        {/* ── Step 1: Service ── */}
        <Section num={1} title="Service">
          <div className="grid grid-cols-1 gap-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={cn(
                  'flex items-center justify-between px-4 py-3.5 rounded-lg border text-sm transition-all duration-150',
                  selectedService?.id === s.id
                    ? 'border-gold-500 bg-gold-500/10 text-white'
                    : 'border-surface-3 bg-surface-2 text-surface-5 hover:border-surface-5 hover:text-white'
                )}
              >
                <span>{s.name}</span>
                <span className={cn('font-semibold', selectedService?.id === s.id ? 'text-gold-400' : '')}>
                  {formatCurrency(s.price)}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Step 2: Barber ── */}
        <Section num={2} title="Barber">
          <div className="grid grid-cols-2 gap-2">
            {barbers.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBarber(b)}
                className={cn(
                  'px-4 py-3.5 rounded-lg border text-sm font-medium transition-all duration-150',
                  selectedBarber?.id === b.id
                    ? 'border-gold-500 bg-gold-500/10 text-white'
                    : 'border-surface-3 bg-surface-2 text-surface-5 hover:border-surface-5 hover:text-white'
                )}
              >
                {b.name}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Step 3: Payment Method ── */}
        <Section num={3} title="Payment Method">
          <div className="grid grid-cols-2 gap-3">
            {(['cash', 'tap'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={cn(
                  'py-5 rounded-xl border text-sm font-semibold tracking-wide uppercase transition-all duration-150',
                  paymentMethod === m
                    ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                    : 'border-surface-3 bg-surface-2 text-surface-5 hover:border-surface-5 hover:text-white'
                )}
              >
                {m === 'cash' ? '💵  Cash' : '💳  Tap'}
                {m === 'tap' && <div className="text-xs font-normal text-surface-5 mt-0.5 normal-case">+13% HST</div>}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Step 4: Tip ── */}
        <Section num={4} title="Tip (Optional)">
          <div className="space-y-3">
            {/* Preset buttons */}
            <div className="grid grid-cols-4 gap-2">
              {TIP_PRESETS.map((pct) => {
                const amt = selectedService
                  ? parseFloat(((selectedService.price * pct) / 100).toFixed(2))
                  : 0
                const active = tipMode === 'preset' && tipAmount === amt && amt > 0
                return (
                  <button
                    key={pct}
                    onClick={() => handleTipPreset(pct)}
                    disabled={!selectedService}
                    className={cn(
                      'py-3 rounded-lg border text-sm transition-all duration-150 disabled:opacity-30',
                      active
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-surface-3 bg-surface-2 text-surface-5 hover:border-surface-5 hover:text-white'
                    )}
                  >
                    <div className="font-semibold">{pct}%</div>
                    {selectedService && <div className="text-xs mt-0.5">{formatCurrency(amt)}</div>}
                  </button>
                )
              })}
            </div>

            {/* No tip + manual */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setTipAmount(0); setTipInput(''); setTipMode('preset') }}
                className={cn(
                  'py-3 rounded-lg border text-sm transition-all duration-150',
                  tipAmount === 0
                    ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                    : 'border-surface-3 bg-surface-2 text-surface-5 hover:text-white'
                )}
              >
                No Tip
              </button>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Custom tip $"
                value={tipInput}
                onChange={(e) => handleTipManual(e.target.value)}
                className="input-base text-center"
              />
            </div>
          </div>
        </Section>

        {/* ── Review & Submit ── */}
        {calc && (
          <div className="bg-surface-1 border border-gold-500/30 rounded-xl p-5 space-y-2 animate-slide-up">
            <h3 className="text-xs tracking-widest uppercase text-surface-5 mb-3">Summary</h3>
            <Row label="Service" value={selectedService!.name} />
            <Row label="Barber" value={selectedBarber!.name} />
            <Row label="Base Price" value={formatCurrency(calc.base_price)} />
            {calc.hst_amount > 0 && <Row label="HST (13%)" value={formatCurrency(calc.hst_amount)} />}
            <Row label="Subtotal" value={formatCurrency(calc.total_charged)} />
            {tipAmount > 0 && <Row label="Tip" value={formatCurrency(tipAmount)} />}
            <div className="border-t border-surface-3 pt-2 mt-2">
              <Row
                label="Total Charged"
                value={formatCurrency(calc.total_charged + tipAmount)}
                bold
              />
              <Row
                label={`Commission (${calc.commission_pct}%)`}
                value={formatCurrency(calc.commission_payout)}
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!selectedService || !selectedBarber || !paymentMethod || submitting}
          className="btn-gold w-full text-base py-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </div>
  )
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold flex items-center justify-center">
          {num}
        </span>
        <h2 className="text-sm font-medium tracking-wider uppercase text-surface-5">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-surface-5">{label}</span>
      <span className={cn('', bold ? 'text-gold-400 font-semibold text-base' : 'text-white')}>
        {value}
      </span>
    </div>
  )
}
