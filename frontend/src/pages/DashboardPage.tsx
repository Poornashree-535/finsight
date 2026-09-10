import { useEffect, useState } from 'react'
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getTransactions, type Transaction } from '../services/api'

export function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-slate-400">Loading dashboard…</p>
  }

  if (error) {
    return <p className="text-red-400">Couldn't load transactions: {error}</p>
  }

  if (transactions.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Financial Dashboard</h2>
        <p className="text-slate-400">
          No transactions yet. Import a CSV or run the seed script to see your dashboard come to life.
        </p>
      </section>
    )
  }

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = income - expenses

  // Simple placeholder score: 100 minus how much of income was spent, clamped 0-100
  const healthScore =
    income > 0 ? Math.max(0, Math.min(100, Math.round(100 - (expenses / income) * 100))) : 0

  const categoryTotals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      categoryTotals.set(t.category_name, (categoryTotals.get(t.category_name) ?? 0) + Number(t.amount))
    }
  }
  const categoryData = Array.from(categoryTotals.entries()).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Balance', value: `$${balance.toFixed(2)}` },
          { label: 'Income', value: `$${income.toFixed(2)}` },
          { label: 'Expenses', value: `$${expenses.toFixed(2)}` },
          { label: 'Health Score', value: `${healthScore} / 100` },
        ].map((card) => (
          <article key={card.label} className="rounded-xl bg-slate-900 p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>
      <article className="h-80 rounded-xl bg-slate-900 p-4">
        <p className="mb-3 text-sm text-slate-400">Category Breakdown</p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} fill="#10b981" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </article>
    </section>
  )
}