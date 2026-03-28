const Topbar = ({ uploadState, rowCount, columnCount }) => {
  const badgeTone =
    uploadState.status === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : uploadState.status === 'error'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-slate-100 text-slate-600'

  return (
    <header className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Hackathon MVP</p>
          <h2 className="mt-2 font-display text-3xl text-slate-900">AI-Powered No-Code Data Analysis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload, inspect, clean, visualize, and explain a dataset in one browser-based workflow built for a strong hackathon demo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Rows</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{rowCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Columns</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{columnCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Upload status</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeTone}`}>
              {uploadState.status}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
