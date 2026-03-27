import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subYears,
  format
} from 'date-fns'
import type { ReportPeriod } from '@/types'

export function getDateRange(period: ReportPeriod, offset = 0) {
  const now = new Date()

  switch (period) {
    case 'daily': {
      const d = subDays(now, offset)
      return { start: startOfDay(d), end: endOfDay(d), label: format(d, 'MMMM d, yyyy') }
    }
    case 'weekly': {
      const d = subWeeks(now, offset)
      const s = startOfWeek(d, { weekStartsOn: 1 })
      const e = endOfWeek(d, { weekStartsOn: 1 })
      return { start: s, end: e, label: `Week of ${format(s, 'MMM d')}` }
    }
    case 'monthly': {
      const d = subMonths(now, offset)
      return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMMM yyyy') }
    }
    case 'yearly': {
      const d = subYears(now, offset)
      return { start: startOfYear(d), end: endOfYear(d), label: format(d, 'yyyy') }
    }
  }
}

export function toISO(d: Date) { return d.toISOString() }
