export const getNumericColumns = (columns, inferredTypes) =>
  columns.filter((column) => inferredTypes[column] === 'number')

export const getCategoricalColumns = (columns, inferredTypes) =>
  columns.filter((column) => inferredTypes[column] === 'string' || inferredTypes[column] === 'boolean' || inferredTypes[column] === 'date')

const getNumericValues = (rows, column) =>
  rows
    .map((row) => Number(row[column]))
    .filter((value) => !Number.isNaN(value))

export const buildStatsLite = (rows, columns, inferredTypes) => {
  return getNumericColumns(columns, inferredTypes).reduce((accumulator, column) => {
    const values = getNumericValues(rows, column).sort((left, right) => left - right)

    if (!values.length) {
      return accumulator
    }

    const sum = values.reduce((total, value) => total + value, 0)
    const middle = Math.floor(values.length / 2)
    const median = values.length % 2 === 0 ? (values[middle - 1] + values[middle]) / 2 : values[middle]

    accumulator[column] = {
      mean: Number((sum / values.length).toFixed(2)),
      median: Number(median.toFixed(2)),
      min: Number(values[0].toFixed(2)),
      max: Number(values[values.length - 1].toFixed(2)),
    }

    return accumulator
  }, {})
}
