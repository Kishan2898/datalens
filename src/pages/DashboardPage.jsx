import { useAsyncResource } from '../hooks/useAsyncResource'
import { fetchDashboardOverview } from '../api/platformApi'

const formatValue = (metric) => {
  if (metric.prefix) {
    return `${metric.prefix}${metric.value}`
  }

  if (metric.suffix) {
    return `${metric.value}${metric.suffix}`
  }

  return metric.value
}

function DashboardPage() {
  const { data, loading, error } = useAsyncResource(fetchDashboardOverview)

  if (loading) {
    return <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 shadow-soft">Loading business overview...</div>
  }

  if (error) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-soft">{error}</div>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Home</p>
        <h2 className="mt-2 font-display text-3xl text-slate-900">Upload a dataset, clean it, chart it, and get AI insights.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          This version keeps the product focused on the core workflow instead of extra business screens. Start in Analysis, then move to AI Assistant when you want a summary.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="rounded-[20px] border border-slate-200/70 bg-white/90 p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{formatValue(metric)}</p>
            <p className="mt-2 text-sm text-slate-500">{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">What to do next</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>1. Go to Analysis and upload a CSV.</p>
            <p>2. Review column types, missing values, and quick cleanup actions.</p>
            <p>3. Build a chart and then open AI Assistant for a narrative summary.</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Current setup</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{data.story.headline}</p>
          <div className="mt-4 space-y-2">
            {data.story.highlights.map((highlight) => (
              <div key={highlight.title} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{highlight.title}:</span> {highlight.body}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
