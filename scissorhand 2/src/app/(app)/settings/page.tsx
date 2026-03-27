'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const [sending, setSending] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function sendTestReport(type: 'daily' | 'weekly' | 'monthly') {
    setSending(type)
    setResult(null)
    try {
      const res = await fetch(`/api/cron?type=${type}`, {
        headers: { Authorization: `Bearer test` }
      })
      // Note: in production this endpoint requires the CRON_SECRET
      setResult({ type: 'success', msg: `${type} report triggered` })
    } catch {
      setResult({ type: 'error', msg: 'Failed to send report' })
    }
    setSending(null)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light tracking-wide">Settings</h1>
        <p className="text-surface-5 text-sm mt-1">App configuration and admin tools</p>
      </div>

      <div className="space-y-6">

        {/* Email Reports */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
          <h2 className="text-sm font-medium tracking-widest uppercase text-surface-5 mb-4">
            Email Reports
          </h2>
          <p className="text-sm text-surface-5 mb-4">
            Reports are automatically sent to{' '}
            <span className="text-gold-400">Scixxorhand.tm@gmail.com</span>
          </p>

          <div className="space-y-3 text-sm">
            {[
              { type: 'daily' as const, label: 'Daily Report', schedule: 'Sent daily at 8:00 PM' },
              { type: 'weekly' as const, label: 'Weekly Report', schedule: 'Sent Sundays at 6:00 PM' },
              { type: 'monthly' as const, label: 'Monthly Report', schedule: 'Sent 1st of each month' },
            ].map(({ type, label, schedule }) => (
              <div key={type} className="flex items-center justify-between py-3 border-b border-surface-3">
                <div>
                  <div className="text-white font-medium">{label}</div>
                  <div className="text-surface-5 text-xs mt-0.5">{schedule}</div>
                </div>
                <button
                  onClick={() => sendTestReport(type)}
                  disabled={sending === type}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-4 text-surface-5 hover:text-white hover:border-surface-5 transition-all text-xs disabled:opacity-40"
                >
                  <Send size={12} />
                  {sending === type ? 'Sending…' : 'Send Now'}
                </button>
              </div>
            ))}
          </div>

          {result && (
            <div className={cn(
              'flex items-center gap-2 mt-4 text-sm',
              result.type === 'success' ? 'text-green-400' : 'text-red-400'
            )}>
              {result.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {result.msg}
            </div>
          )}
        </div>

        {/* Tax Info */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
          <h2 className="text-sm font-medium tracking-widest uppercase text-surface-5 mb-4">
            Tax Configuration
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-surface-3">
              <span className="text-surface-5">Cash Transactions</span>
              <span className="text-white">No HST applied</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-3">
              <span className="text-surface-5">Tap / Card Transactions</span>
              <span className="text-gold-400">13% HST applied</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-surface-5">Province</span>
              <span className="text-white">Ontario, Canada</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
          <h2 className="text-sm font-medium tracking-widest uppercase text-surface-5 mb-4">
            Application Info
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ['App', 'Scissorhand v1.0'],
              ['Stack', 'Next.js 14 + Supabase'],
              ['Hosting', 'Vercel (Free Tier)'],
              ['Database', 'Supabase PostgreSQL'],
              ['Email', 'Resend'],
              ['PWA', 'Installable on iPad / iPhone / Mac'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5">
                <span className="text-surface-5">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
