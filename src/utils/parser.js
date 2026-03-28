import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { buildDatasetSummary } from './inferTypes'

const normalizeParsedRows = (rows) =>
  rows
    .filter((row) => Object.values(row || {}).some((value) => String(value ?? '').trim() !== ''))
    .map((row) =>
      Object.entries(row).reduce((accumulator, [key, value]) => {
        accumulator[String(key).trim()] = String(value ?? '').trim()
        return accumulator
      }, {}),
    )

const validateRows = (rows) => {
  if (!rows.length) {
    return 'Your file parsed successfully, but it does not contain any usable data rows.'
  }

  if (Object.keys(rows[0]).length === 0) {
    return 'We could not detect any column headers. Please upload a CSV with a header row.'
  }

  return null
}

export const parseCsvFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors?.length) {
          reject(new Error(results.errors[0].message || 'Unable to parse this CSV file.'))
          return
        }

        const normalizedRows = normalizeParsedRows(results.data)
        const validationError = validateRows(normalizedRows)

        if (validationError) {
          reject(new Error(validationError))
          return
        }

        resolve(buildDatasetSummary(normalizedRows, 'file'))
      },
      error: (error) => reject(error),
    })
  })

export const parseCsvText = (text) =>
  new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors?.length) {
          reject(new Error(results.errors[0].message || 'Unable to parse pasted CSV content.'))
          return
        }

        const normalizedRows = normalizeParsedRows(results.data)
        const validationError = validateRows(normalizedRows)

        if (validationError) {
          reject(new Error(validationError))
          return
        }

        resolve(buildDatasetSummary(normalizedRows, 'paste'))
      },
      error: (error) => reject(error),
    })
  })

export const parseSpreadsheetFile = async (file) => {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    return parseCsvFile(file)
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    throw new Error('This spreadsheet does not contain any sheets.')
  }

  const worksheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  })

  const normalizedRows = normalizeParsedRows(rows)
  const validationError = validateRows(normalizedRows)

  if (validationError) {
    throw new Error(validationError)
  }

  return buildDatasetSummary(normalizedRows, 'file')
}
