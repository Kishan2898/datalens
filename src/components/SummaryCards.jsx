const SummaryCards = ({ summaryStats, inferredTypes }) => {
  const missingColumns = Object.values(summaryStats.missingByColumn || {}).filter((item) => item.count > 0).length
  const totalMissing = Object.values(summaryStats.missingByColumn || {}).reduce((total, item) => total + item.count, 0)
  const completeness = summaryStats.rowCount * Math.max(summaryStats.columnCount, 1) === 0
    ? 100
    : Number((100 - (totalMissing / (summaryStats.rowCount * summaryStats.columnCount || 1)) * 100).toFixed(1))
  const detectedTypes = [...new Set(Object.values(inferredTypes || {}))]

  const cards = [
    {
      label: 'Rows detected',
      value: summaryStats.rowCount,
      note: 'Instant confidence in dataset scale',
    },
    {
      label: 'Columns detected',
      value: summaryStats.columnCount,
      note: 'Headers parsed successfully',
    },
    {
      label: 'Columns with missing data',
      value: missingColumns,
      note: 'Useful setup for cleaning in Phase 2',
    },
    {
      label: 'Dataset completeness',
      value: `${completeness}%`,
      note: detectedTypes.length ? `Detected types: ${detectedTypes.join(', ')}` : 'No data yet',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-[24px] border border-slate-200/70 bg-white/85 p-5 shadow-soft backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{card.note}</p>
        </article>
      ))}
    </section>
  )
}

export default SummaryCards
