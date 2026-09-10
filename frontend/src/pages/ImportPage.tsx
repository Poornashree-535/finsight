import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { importTransactions, type ImportSummary } from '../services/api'

export function ImportPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    setSummary(null)
    try {
      const result = await importTransactions(file)
      setSummary(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Import Transactions</h2>
      <p className="text-slate-400">
        Upload a CSV with columns: <code className="text-emerald-400">date, description, amount, type, category</code>.
        Dates should be in <code className="text-emerald-400">YYYY-MM-DD</code> format, and type must be{' '}
        <code className="text-emerald-400">income</code> or <code className="text-emerald-400">expense</code>.
      </p>

      <div className="rounded-xl bg-slate-900 p-6 space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload CSV'}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-red-950 p-4 text-red-400">{error}</p>
      )}

      {summary && (
        <div className="rounded-xl bg-slate-900 p-4 space-y-2">
          <p className="text-emerald-400">
            Imported {summary.imported} transaction{summary.imported === 1 ? '' : 's'}
            {summary.skipped_duplicates > 0 && ` (${summary.skipped_duplicates} duplicate${summary.skipped_duplicates === 1 ? '' : 's'} skipped)`}.
          </p>
          {summary.errors.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-amber-400">
              {summary.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {summary.imported > 0 && (
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-200"
            >
              View dashboard
            </button>
          )}
        </div>
      )}
    </section>
  )
}
