const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE = configuredApiBase ? configuredApiBase.replace(/\/$/, '') : ''

type ErrorBody = {
  detail?: string | { msg?: string }[]
}

function parseErrorDetail(body: ErrorBody): string {
  if (typeof body.detail === 'string' && body.detail.trim().length > 0) {
    return body.detail
  }

  if (Array.isArray(body.detail) && body.detail.length > 0) {
    const first = body.detail[0]
    if (typeof first?.msg === 'string' && first.msg.trim().length > 0) {
      return first.msg
    }
  }

  return 'Request failed.'
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      ...init,
    })
  } catch {
    throw new Error('Unable to reach the API. Make sure the backend is running on port 8000.')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody
    throw new Error(parseErrorDetail(body))
  }

  return (await response.json()) as T
}
export type Transaction = {
  id: number
  amount: string
  category_id: number
  category_name: string
  description: string
  date: string
  type: 'income' | 'expense'
}

export function getTransactions(): Promise<Transaction[]> {
  return request<Transaction[]>('/api/v1/transactions', { method: 'GET' })
}

export type ImportSummary = {
  imported: number
  skipped_duplicates: number
  errors: string[]
}

export async function importTransactions(file: File): Promise<ImportSummary> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/v1/transactions/import`, {
      method: 'POST',
      body: formData,
      // Note: no Content-Type header here — the browser sets the correct
      // multipart boundary automatically when the body is a FormData object.
    })
  } catch {
    throw new Error('Unable to reach the API. Make sure the backend is running on port 8000.')
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ErrorBody
    throw new Error(parseErrorDetail(body))
  }
  return (await response.json()) as ImportSummary
}