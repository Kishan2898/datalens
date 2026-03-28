import { useMemo, useState } from 'react'
import {
  buildTransformPayload,
  changeColumnType,
  deleteColumn,
  extractNumbersFromColumn,
  fillMissingValues,
  removeDuplicateRows,
  removeRowsWithMissingValues,
  removeSpecialCharacters,
  renameColumn,
  trimWhitespaceFromText,
} from '../utils/cleaning'
import { exportRowsToCsv } from '../utils/exportUtils'

const DataCleaner = ({ state, dispatch }) => {
  const [renameFrom, setRenameFrom] = useState(state.columns[0] || '')
  const [renameTo, setRenameTo] = useState('')
  const [specialCharColumn, setSpecialCharColumn] = useState('all')
  const [extractNumberColumn, setExtractNumberColumn] = useState(state.columns[0] || '')
  const [typeColumn, setTypeColumn] = useState(state.columns[0] || '')
  const [targetType, setTargetType] = useState('string')
  const [fillColumn, setFillColumn] = useState(state.columns[0] || '')
  const [fillStrategy, setFillStrategy] = useState('mode')
  const [fillValue, setFillValue] = useState('')
  const [deleteColumnName, setDeleteColumnName] = useState(state.columns[0] || '')

  const actionSummary = useMemo(() => {
    const columnsWithMissing = Object.entries(state.summaryStats.missingByColumn || {}).filter(([, value]) => value.count > 0).length
    return `${columnsWithMissing} columns currently have missing values.`
  }, [state.summaryStats.missingByColumn])

  const fillColumnType = state.inferredTypes[fillColumn] || 'string'
  const fillStrategies = fillColumnType === 'number'
    ? [
        { value: 'mean', label: 'Mean' },
        { value: 'median', label: 'Median' },
        { value: 'mode', label: 'Mode' },
        { value: 'custom', label: 'Custom Value' },
      ]
    : [
        { value: 'mode', label: 'Mode' },
        { value: 'custom', label: 'Custom Value' },
      ]

  const applyRows = (rows, message) => {
    dispatch({
      type: 'APPLY_TRANSFORM',
      payload: {
        ...buildTransformPayload(rows, state.uploadState.source || 'cleaned', message, state.uploadState.fileName),
        nextTab: 'overview',
      },
    })
  }

  const handleRemoveMissing = () => {
    const nextRows = removeRowsWithMissingValues(state.workingData, state.columns)
    applyRows(nextRows, `Removed ${state.workingData.length - nextRows.length} rows with missing values.`)
  }

  const handleRemoveDuplicates = () => {
    const nextRows = removeDuplicateRows(state.workingData)
    applyRows(nextRows, `Removed ${state.workingData.length - nextRows.length} duplicate rows.`)
  }

  const handleTrimWhitespace = () => {
    const nextRows = trimWhitespaceFromText(state.workingData, state.columns, state.inferredTypes)
    applyRows(nextRows, 'Trimmed whitespace across text columns.')
  }

  const handleRemoveSpecialCharacters = () => {
    const nextRows = removeSpecialCharacters(state.workingData, state.columns, state.inferredTypes, specialCharColumn)
    applyRows(
      nextRows,
      specialCharColumn === 'all'
        ? 'Removed special characters across text-like columns.'
        : `Removed special characters from ${specialCharColumn}.`,
    )
  }

  const handleExtractNumbers = () => {
    const nextRows = extractNumbersFromColumn(state.workingData, state.columns, extractNumberColumn)

    if (!nextRows) {
      dispatch({ type: 'SET_ERROR', payload: 'Choose a valid column before extracting numbers.' })
      return
    }

    applyRows(nextRows, `Extracted numeric values from ${extractNumberColumn}.`)
  }

  const handleChangeColumnType = () => {
    const nextRows = changeColumnType(state.workingData, state.columns, typeColumn, targetType)

    if (!nextRows) {
      dispatch({ type: 'SET_ERROR', payload: 'Choose a valid column and datatype before converting.' })
      return
    }

    applyRows(nextRows, `Converted ${typeColumn} to ${targetType}.`)
  }

  const handleFillMissingValues = () => {
    if (!fillColumn) {
      dispatch({ type: 'SET_ERROR', payload: 'Choose a column before filling missing values.' })
      return
    }

    if (fillStrategy === 'custom' && !String(fillValue).trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Enter a custom fill value or choose another strategy.' })
      return
    }

    const nextRows = fillMissingValues(state.workingData, fillColumn, fillStrategy, fillValue)

    if (!nextRows) {
      dispatch({ type: 'SET_ERROR', payload: 'Unable to fill missing values for the selected column.' })
      return
    }

    applyRows(nextRows, `Filled missing values in ${fillColumn} using ${fillStrategy}.`)
  }

  const handleReset = () => {
    applyRows(state.originalData, 'Reset the working dataset back to the original upload.')
  }

  const handleRenameColumn = () => {
    const renamedRows = renameColumn(state.workingData, state.columns, renameFrom, renameTo)

    if (!renamedRows) {
      dispatch({ type: 'SET_ERROR', payload: 'Enter a unique new column name before renaming.' })
      return
    }

    applyRows(renamedRows, `Renamed column ${renameFrom} to ${renameTo.trim()}.`)
    setRenameFrom(renameTo.trim())
    setRenameTo('')
  }

  const handleDeleteColumn = () => {
    const nextRows = deleteColumn(state.workingData, state.columns, deleteColumnName)

    if (!nextRows) {
      dispatch({ type: 'SET_ERROR', payload: 'Choose a valid column before deleting.' })
      return
    }

    applyRows(nextRows, `Deleted column ${deleteColumnName}.`)
  }

  const handleDownloadCleanDataset = () => {
    const baseName = state.uploadState.fileName
      ? state.uploadState.fileName.replace(/\.(csv|xlsx|xls)$/i, '')
      : 'datalens-cleaned-data'

    exportRowsToCsv(state.workingData, `${baseName}-cleaned.csv`)
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Quick cleaning</p>
        <h3 className="mt-2 font-display text-2xl text-slate-900">One-click actions for the most common cleanup tasks</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{actionSummary}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button type="button" onClick={handleRemoveMissing} className="rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            Remove Missing Rows
          </button>
          <button type="button" onClick={handleRemoveDuplicates} className="rounded-2xl bg-slate-100 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-200">
            Remove Duplicate Rows
          </button>
          <button type="button" onClick={handleTrimWhitespace} className="rounded-2xl bg-sky-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-600">
            Trim Text Whitespace
          </button>
          <button type="button" onClick={handleRemoveSpecialCharacters} className="rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-emerald-600">
            Clean Special Characters
          </button>
          <button type="button" onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Reset to Original Dataset
          </button>
          <button type="button" onClick={handleDownloadCleanDataset} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            Download Clean Dataset
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Special character cleaning</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <select
              value={specialCharColumn}
              onChange={(event) => setSpecialCharColumn(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">All text columns</option>
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRemoveSpecialCharacters}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Extract numbers</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <select
              value={extractNumberColumn}
              onChange={(event) => setExtractNumberColumn(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExtractNumbers}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Extract
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Useful for values like `$1,250`, `score: 87`, or `weight 54.5 kg` when you want only the numeric part.
          </p>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Fill missing values</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[0.3fr_0.25fr_0.3fr_0.15fr]">
            <select
              value={fillColumn}
              onChange={(event) => {
                const nextColumn = event.target.value
                setFillColumn(nextColumn)
                const nextType = state.inferredTypes[nextColumn] || 'string'
                setFillStrategy(nextType === 'number' ? 'mean' : 'mode')
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <select
              value={fillStrategy}
              onChange={(event) => setFillStrategy(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
            >
              {fillStrategies.map((strategy) => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
            {fillStrategy === 'custom' ? (
              <input
                value={fillValue}
                onChange={(event) => setFillValue(event.target.value)}
                placeholder="Enter custom value"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                {fillColumnType === 'number'
                  ? `Numeric strategy: ${fillStrategy}`
                  : `Categorical strategy: ${fillStrategy}`}
              </div>
            )}
            <button
              type="button"
              onClick={handleFillMissingValues}
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Fill
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Numeric columns support mean, median, mode, and custom values. Categorical columns support mode or a custom value. KNN imputation is intentionally not added here to keep the browser workflow fast and reliable.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Column renaming</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Make headers cleaner before analysis</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This keeps the MVP believable for business users who often import messy exports with awkward column labels.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[0.45fr_0.55fr]">
            <select
              value={renameFrom}
              onChange={(event) => setRenameFrom(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
            >
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <input
              value={renameTo}
              onChange={(event) => setRenameTo(event.target.value)}
              placeholder="Enter a cleaner column name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleRenameColumn}
            className="mt-4 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Rename Column
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Delete column</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Remove an unwanted column</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Useful when you want to drop IDs, helper columns, or noisy fields before analysis.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <select
              value={deleteColumnName}
              onChange={(event) => setDeleteColumnName(event.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
            >
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDeleteColumn}
              className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Delete Column
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">Datatype conversion</p>
          <h3 className="mt-2 font-display text-2xl text-slate-900">Change how a column is interpreted</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Convert a selected column to string, number, boolean, or date using lightweight formatting rules.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <select
              value={typeColumn}
              onChange={(event) => setTypeColumn(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
            >
              {state.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <select
              value={targetType}
              onChange={(event) => setTargetType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleChangeColumnType}
            className="mt-4 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Convert Column Type
          </button>
        </div>
      </div>
    </section>
  )
}

export default DataCleaner
