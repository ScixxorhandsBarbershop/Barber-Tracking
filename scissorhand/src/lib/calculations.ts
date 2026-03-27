import type { PaymentMethod, TransactionInput, Service, Barber } from '@/types'

export const HST_RATE = 0.13

/**
 * Calculate all financial fields for a transaction.
 * Cash → no HST. Tap → 13% HST on base price.
 */
export function calculateTransaction(
  service: Service,
  barber: Barber,
  method: PaymentMethod,
  tipAmount: number
) {
  const base = service.price
  const hst = method === 'tap' ? parseFloat((base * HST_RATE).toFixed(2)) : 0
  const total = parseFloat((base + hst).toFixed(2))

  const commissionPct =
    method === 'cash' ? barber.cash_commission_pct : barber.tap_commission_pct

  // Commission is calculated on base price (before HST, after shop cut)
  const commissionPayout = parseFloat(
    ((base * commissionPct) / 100).toFixed(2)
  )

  // Net revenue = shop keeps (base - commission) + HST collected
  const netRevenue = parseFloat(
    (base - commissionPayout + hst).toFixed(2)
  )

  return {
    base_price: base,
    hst_amount: hst,
    total_charged: total,
    tip_amount: tipAmount,
    commission_pct: commissionPct,
    commission_payout: commissionPayout,
    net_revenue: netRevenue,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`
}

export const TIP_PRESETS = [5, 10, 15, 20] as const
