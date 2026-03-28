const EMPTY_VALUES = new Set(['', 'null', 'undefined', 'n/a', 'na', '-', '--'])

const isMissing = (value) => {
  if (value === null || value === undefined) {
    return true
  }

  const normalized = String(value).trim().toLowerCase()
  return EMPTY_VALUES.has(normalized)
}

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  const trimmed = String(value).trim()
  return isMissing(trimmed) ? '' : trimmed
}

export const inferValueType = (value) => {
  if (isMissing(value)) {
    return 'empty'
  }

  const trimmed = String(value).trim()

  if (/^(true|false)$/i.test(trimmed)) {
    return 'boolean'
  }

  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
    return 'number'
  }

  const parsedDate = Date.parse(trimmed)
  if (!Number.isNaN(parsedDate) && /[-/]/.test(trimmed)) {
    return 'date'
  }

  return 'string'
}

export const inferColumnTypes = (rows, columns) => {
  const typePriority = ['string', 'date', 'number', 'boolean']

  return columns.reduce((accumulator, column) => {
    const seenTypes = rows
      .map((row) => inferValueType(row[column]))
      .filter((type) => type !== 'empty')

    if (seenTypes.length === 0) {
      accumulator[column] = 'string'
      return accumulator
    }

    const uniqueTypes = [...new Set(seenTypes)]
    accumulator[column] = typePriority.find((type) => uniqueTypes.includes(type)) || 'string'
    return accumulator
  }, {})
}

export const buildDatasetSummary = (rows, source = 'upload') => {
  const safeRows = Array.isArray(rows) ? rows : []
  const columns = safeRows.length > 0 ? Object.keys(safeRows[0]) : []
  const inferredTypes = inferColumnTypes(safeRows, columns)

  const missingByColumn = columns.reduce((accumulator, column) => {
    const missingCount = safeRows.filter((row) => isMissing(row[column])).length

    accumulator[column] = {
      count: missingCount,
      percentage: safeRows.length === 0 ? 0 : Number(((missingCount / safeRows.length) * 100).toFixed(1)),
    }

    return accumulator
  }, {})

  return {
    rows: safeRows.map((row) =>
      columns.reduce((accumulator, column) => {
        accumulator[column] = normalizeValue(row[column])
        return accumulator
      }, {}),
    ),
    columns,
    inferredTypes,
    missingByColumn,
    source,
  }
}
