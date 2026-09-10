import type { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/import', label: 'Import' },
]

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation()
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-emerald-400">FinSight</h1>
        <nav className="flex gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                className={`rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
                to={link.to}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
