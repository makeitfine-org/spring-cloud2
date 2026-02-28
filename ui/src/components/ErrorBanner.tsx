interface ErrorBannerProps {
  error?: unknown
  title?: string
}

export default function ErrorBanner({ error, title = 'Error' }: ErrorBannerProps) {
  if (!error) return null

  const err = error as { data?: { message?: string }; error?: string }
  const message =
    err?.data?.message ??
    err?.error ??
    (typeof error === 'string' ? error : 'An unexpected error occurred.')

  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-4">
      <div className="flex">
        <div className="shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  )
}
