const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">Upload issue</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
        <button type="button" onClick={onDismiss} className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default ErrorBanner
