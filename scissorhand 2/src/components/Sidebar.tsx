'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  PlusCircle,
  BarChart2,
  ClipboardList,
  Users,
  Scissors,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/new',          icon: PlusCircle,      label: 'New Transaction' },
  { href: '/analytics',    icon: BarChart2,        label: 'Analytics' },
  { href: '/transactions', icon: ClipboardList,    label: 'Transactions' },
  { href: '/barbers',      icon: Users,            label: 'Barbers' },
  { href: '/services',     icon: Scissors,         label: 'Services' },
  { href: '/settings',     icon: Settings,         label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-surface-1 border-r border-surface-3 h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-surface-3">
          <div className="flex items-center gap-3">
            <span className="text-gold-500 text-xl">✂</span>
            <span className="font-display text-lg tracking-[0.12em] text-white">SCISSORHAND</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                  active
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-surface-5 hover:text-white hover:bg-surface-2'
                )}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-surface-5 hover:text-red-400 hover:bg-surface-2 transition-all duration-150"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-1 border-t border-surface-3 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.slice(0, 5).map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[52px]',
                  active ? 'text-gold-400' : 'text-surface-5'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[9px] tracking-wider uppercase">{label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
