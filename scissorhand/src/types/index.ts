// ============================================================
// SCISSORHAND — Shared Types
// ============================================================

export type PaymentMethod = 'cash' | 'tap'

export interface Barber {
  id: string
  name: string
  active: boolean
  cash_commission_pct: number
  tap_commission_pct: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  barber_id: string
  service_id: string
  payment_method: PaymentMethod
  base_price: number
  hst_amount: number
  total_charged: number
  tip_amount: number
  commission_pct: number
  commission_payout: number
  net_revenue: number
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  barber?: Barber
  service?: Service
}

export interface TransactionInput {
  barber_id: string
  service_id: string
  payment_method: PaymentMethod
  tip_amount: number
  notes?: string
}

export interface BarberStats {
  barber: Barber
  total_revenue: number
  total_clients: number
  total_services: number
  total_tips: number
  avg_ticket: number
  commission_earned: number
  rank?: number
}

export interface DashboardMetrics {
  total_revenue: number
  cash_revenue: number
  tap_revenue: number
  total_tips: number
  total_clients: number
  total_services: number
  hst_collected: number
  net_revenue: number
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'
