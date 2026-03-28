const DataOverview = ({ columns, inferredTypes, summaryStats }) => {
  const numericStats = summaryStats.numericStats || {}

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Dataset overview</p>
        <h3 className="mt-2 font-display text-2xl text-slate-900">Understand the shape and quality of the uploaded data</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This is the confidence-building moment for judges: types, missing values, and key numeric ranges are all surfaced without code.
        </p>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold">Column</th>
                  <th className="px-4 py-4 text-sm font-semibold">Type</th>
                  <th className="px-4 py-4 text-sm font-semibold">Missing</th>
                  <th className="px-4 py-4 text-sm font-semibold">Missing %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {columns.map((column) => (
                  <tr key={column} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{column}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{inferredTypes[column]}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{summaryStats.missingByColumn[column]?.count || 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{summaryStats.missingByColumn[column]?.percentage || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Quality scan</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Instant data health readout</h3>
          <div className="mt-4 space-y-3">
            {columns.map((column) => {
              const missing = summaryStats.missingByColumn[column]
              const tone = (missing?.percentage || 0) >= 25 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'

              return (
                <div key={column} className={`rounded-2xl border px-4 py-4 ${tone}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{column}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]">{missing?.percentage || 0}% missing</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">
                    {missing?.count
                      ? `${missing.count} rows need attention in this column.`
                      : 'No missing values detected here.'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Numeric stats</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Fast descriptive metrics</h3>
          <div className="mt-4 space-y-3">
            {Object.keys(numericStats).length ? (
              Object.entries(numericStats).map(([column, stats]) => (
                <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{column}</p>
                  <p className="mt-2 text-sm text-slate-600">Mean: {stats.mean} | Median: {stats.median}</p>
                  <p className="mt-1 text-sm text-slate-600">Min: {stats.min} | Max: {stats.max}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                No numeric columns yet. Upload a dataset with numbers to unlock quick statistical summaries.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DataOverview
