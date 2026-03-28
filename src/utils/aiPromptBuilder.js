export const buildInsightContext = (state) => {
  const missingColumns = Object.entries(state.summaryStats.missingByColumn || {})
    .filter(([, details]) => details.count > 0)
    .map(([column, details]) => `${column} (${details.count} missing, ${details.percentage}%)`)

  const numericColumns = Object.entries(state.inferredTypes || {})
    .filter(([, type]) => type === 'number')
    .map(([column]) => column)

  const categoricalColumns = Object.entries(state.inferredTypes || {})
    .filter(([, type]) => type === 'string' || type === 'boolean' || type === 'date')
    .map(([column]) => column)

  return {
    rowCount: state.summaryStats.rowCount,
    columnCount: state.summaryStats.columnCount,
    missingColumns,
    numericColumns,
    categoricalColumns,
    chartConfig: state.selectedChartConfig,
    uploadSource: state.uploadState.source || 'upload',
  }
}

export const buildPromptPreview = (question, state) => {
  const context = buildInsightContext(state)

  return [
    `Dataset rows: ${context.rowCount}`,
    `Dataset columns: ${context.columnCount}`,
    `Numeric columns: ${context.numericColumns.join(', ') || 'None'}`,
    `Categorical columns: ${context.categoricalColumns.join(', ') || 'None'}`,
    `Missing data flags: ${context.missingColumns.join('; ') || 'No major missing value issues'}`,
    `Current chart config: ${context.chartConfig.chartType} using ${context.chartConfig.xKey || 'n/a'} and ${context.chartConfig.yKey || 'n/a'}`,
    `User ask: ${question}`,
  ].join('\n')
}
