import { useAsyncResource } from '../hooks/useAsyncResource'
import { fetchDatasets } from '../api/platformApi'

function DatasetsPage() {
  const { data, loading, error } = useAsyncResource(fetchDatasets)

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 shadow-soft">Loading datasets...</div>
  }

  if (error) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-soft">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Dataset catalog</p>
        <h3 className="mt-2 font-display text-2xl text-slate-900">Persistent assets for a real analytics platform</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This is where production DataLens turns uploads into managed datasets, quality status, ownership metadata, and AI-ready workspaces.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {data.datasets.map((dataset) => (
          <article key={dataset.id} className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{dataset.name}</p>
                <p className="text-sm text-slate-500">{dataset.owner}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                {dataset.status}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Rows</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{dataset.rows}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Columns</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{dataset.columns}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Storage</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{dataset.storage}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Last sync</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{dataset.lastSync}</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">{dataset.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default DatasetsPage
