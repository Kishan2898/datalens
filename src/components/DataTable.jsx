const DataTable = ({ rows, columns, inferredTypes }) => {
  if (!rows.length || !columns.length) {
    return null
  }

  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Preview</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Dataset table snapshot</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Showing the first {Math.min(rows.length, 8)} rows so users can immediately verify their upload.
          </p>
        </div>
        <p className="text-sm text-slate-400">Scrollable horizontally for wide datasets</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-4 text-sm font-semibold">
                    <div>{column}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-300">
                      {inferredTypes[column]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rows.slice(0, 8).map((row, index) => (
                <tr key={`preview-row-${index}`} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={`${index}-${column}`} className="px-4 py-3 text-sm text-slate-600">
                      {row[column] || <span className="text-slate-300">Missing</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default DataTable
