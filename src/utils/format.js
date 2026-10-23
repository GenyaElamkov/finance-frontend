/**
 * Хелперы форматирования для отчетов и аналитики.
 */

/**
 * Форматирует сумму в валюте.
 * @param {number|string} value - сумма (бэкенд присылает Decimal строкой)
 * @param {string} currency - код валюты (RUB, USD, EUR)
 * @param {{ maximumFractionDigits?: number }} options
 */
export function formatMoney(value, currency = 'RUB', options = {}) {
  return Number(value || 0).toLocaleString('ru-RU', {
    style: 'currency',
    currency,
    ...options,
  })
}

/**
 * Форматирует процент. При signed=true добавляет знак "+" для положительных значений.
 * @param {number|null|undefined} value
 */
export function formatPercent(value, { signed = false, maximumFractionDigits = 1 } = {}) {
  if (value === null || value === undefined) return '—'
  const formatted = Math.abs(value).toLocaleString('ru-RU', { maximumFractionDigits })
  if (value < 0) return `−${formatted}%`
  return `${signed && value > 0 ? '+' : ''}${formatted}%`
}

/**
 * Дата в формате YYYY-MM-DD по ЛОКАЛЬНОМУ времени.
 * toISOString() использовать нельзя: он переводит в UTC и в часовых поясах
 * восточнее UTC около полуночи возвращает вчерашнюю дату.
 */
export function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 'YYYY-MM-DD' -> 'DD.MM.YYYY' */
export function formatDateRu(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}

/**
 * Валюта отчета по умолчанию: RUB, если у пользователя есть рублевый счет
 * (или счетов еще нет), иначе валюта первого счета.
 */
export function pickReportCurrency(accounts = []) {
  const currencies = accounts.map((a) => a.currency).filter(Boolean)
  if (currencies.length === 0 || currencies.includes('RUB')) return 'RUB'
  return currencies[0]
}
