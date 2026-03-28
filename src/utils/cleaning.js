import { buildDatasetSummary } from './inferTypes'

const MISSING_VALUES = new Set(['', 'null', 'undefined', 'n/a', 'na'])

const hasMissingValue = (row, columns) =>
  columns.some((column) => {
    const value = String(row[column] ?? '').trim().toLowerCase()
    return MISSING_VALUES.has(value)
  })

export const removeRowsWithMissingValues = (rows, columns) =>
  rows.filter((row) => !hasMissingValue(row, columns))

const isMissingValue = (value) => MISSING_VALUES.has(String(value ?? '').trim().toLowerCase())

const getNonMissingValues = (rows, targetColumn) =>
  rows
    .map((row) => row[targetColumn])
    .filter((value) => !isMissingValue(value))

const computeMode = (values) => {
  if (!values.length) {
    return ''
  }

  const frequencies = values.reduce((accumulator, value) => {
    const key = String(value)
    accumulator[key] = (accumulator[key] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(frequencies).sort((left, right) => right[1] - left[1])[0][0]
}

const computeMean = (values) => {
  const numbers = values
    .map((value) => Number(String(value).replace(/,/g, '').trim()))
    .filter((value) => !Number.isNaN(value))

  if (!numbers.length) {
    return ''
  }

  const sum = numbers.reduce((total, value) => total + value, 0)
  return Number((sum / numbers.length).toFixed(2))
}

const computeMedian = (values) => {
  const numbers = values
    .map((value) => Number(String(value).replace(/,/g, '').trim()))
    .filter((value) => !Number.isNaN(value))
    .sort((left, right) => left - right)

  if (!numbers.length) {
    return ''
  }

  const middle = Math.floor(numbers.length / 2)
  return numbers.length % 2 === 0
    ? Number((((numbers[middle - 1] + numbers[middle]) / 2)).toFixed(2))
    : numbers[middle]
}

export const fillMissingValues = (rows, targetColumn, strategy, customValue = '') => {
  if (!targetColumn || !strategy) {
    return null
  }

  const nonMissingValues = getNonMissingValues(rows, targetColumn)

  const fillValueMap = {
    mean: computeMean(nonMissingValues),
    median: computeMedian(nonMissingValues),
    mode: computeMode(nonMissingValues),
    custom: customValue,
  }

  const fillValue = fillValueMap[strategy]

  return rows.map((row) => {
    if (!isMissingValue(row[targetColumn])) {
      return row
    }

    return {
      ...row,
      [targetColumn]: fillValue,
    }
  })
}

export const removeDuplicateRows = (rows) => {
  const seen = new Set()

  return rows.filter((row) => {
    const fingerprint = JSON.stringify(row)
    if (seen.has(fingerprint)) {
      return false
    }

    seen.add(fingerprint)
    return true
  })
}

export const trimWhitespaceFromText = (rows, columns, inferredTypes) =>
  rows.map((row) =>
    columns.reduce((accumulator, column) => {
      const value = row[column]
      accumulator[column] = inferredTypes[column] === 'string' ? String(value ?? '').trim() : value
      return accumulator
    }, {}),
  )

export const renameColumn = (rows, columns, currentName, nextName) => {
  const safeName = String(nextName || '').trim()

  if (!currentName || !safeName || currentName === safeName || columns.includes(safeName)) {
    return null
  }

  return rows.map((row) => {
    const updatedRow = {}

    columns.forEach((column) => {
      const targetKey = column === currentName ? safeName : column
      updatedRow[targetKey] = row[column]
    })

    return updatedRow
  })
}

export const deleteColumn = (rows, columns, targetColumn) => {
  if (!targetColumn || !columns.includes(targetColumn)) {
    return null
  }

  return rows.map((row) =>
    columns.reduce((accumulator, column) => {
      if (column !== targetColumn) {
        accumulator[column] = row[column]
      }

      return accumulator
    }, {}),
  )
}

export const removeSpecialCharacters = (rows, columns, inferredTypes, targetColumn = 'all') =>
  rows.map((row) =>
    columns.reduce((accumulator, column) => {
      const shouldClean =
        (targetColumn === 'all' || targetColumn === column) &&
        (inferredTypes[column] === 'string' || inferredTypes[column] === 'date')

      if (!shouldClean) {
        accumulator[column] = row[column]
        return accumulator
      }

      accumulator[column] = String(row[column] ?? '')
        .replace(/[^\w\s.-/]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()

      return accumulator
    }, {}),
  )

export const extractNumbersFromColumn = (rows, columns, targetColumn) => {
  if (!targetColumn || !columns.includes(targetColumn)) {
    return null
  }

  return rows.map((row) => {
    const rawValue = String(row[targetColumn] ?? '').trim()

    if (!rawValue) {
      return row
    }

    const match = rawValue.match(/-?\d+(\.\d+)?/g)
    const extracted = match ? match.join(' ') : ''

    return {
      ...row,
      [targetColumn]: extracted,
    }
  })
}

const convertToNumber = (value) => {
  const cleaned = String(value ?? '').replace(/,/g, '').trim()

  if (!cleaned) {
    return ''
  }

  const converted = Number(cleaned)
  return Number.isNaN(converted) ? String(value ?? '') : converted
}

const convertToBoolean = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (!normalized) {
    return ''
  }

  if (['true', 'yes', '1'].includes(normalized)) {
    return 'true'
  }

  if (['false', 'no', '0'].includes(normalized)) {
    return 'false'
  }

  return String(value ?? '')
}

const convertToDate = (value) => {
  const normalized = String(value ?? '').trim()

  if (!normalized) {
    return ''
  }

  const parsed = new Date(normalized)

  if (Number.isNaN(parsed.getTime())) {
    return String(value ?? '')
  }

  return parsed.toISOString().slice(0, 10)
}

const convertToString = (value) => String(value ?? '').trim()

export const changeColumnType = (rows, columns, targetColumn, nextType) => {
  if (!targetColumn || !nextType || !columns.includes(targetColumn)) {
    return null
  }

  const converterMap = {
    string: convertToString,
    number: convertToNumber,
    boolean: convertToBoolean,
    date: convertToDate,
  }

  const convertValue = converterMap[nextType]

  if (!convertValue) {
    return null
  }

  return rows.map((row) => ({
    ...row,
    [targetColumn]: convertValue(row[targetColumn]),
  }))
}

export const buildTransformPayload = (rows, source, message, fileName = '') => ({
  ...buildDatasetSummary(rows, source),
  fileName,
  message,
})
