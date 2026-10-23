import { toIsoDate } from './format'

export const PERIOD_PRESETS = [
  { key: 'this_month', label: 'Этот месяц' },
  { key: 'last_month', label: 'Прошлый месяц' },
  { key: 'three_months', label: '3 месяца' },
  { key: 'year', label: 'С начала года' },
]

/**
 * Границы периода для пресета. Все границы включительные.
 * "Этот месяц" - с 1-го числа по сегодня (а не весь месяц): так бэкенд сравнивает
 * его с теми же днями прошлого месяца, и сравнение остается честным.
 * @param {string} key - ключ из PERIOD_PRESETS
 * @param {Date} today - текущая дата (параметр для проверки в тестах)
 */
export function getPresetRange(key, today = new Date()) {
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (key) {
    case 'last_month':
      // день 0 следующего месяца = последний день текущего
      return {
        date_from: toIsoDate(new Date(year, month - 1, 1)),
        date_to: toIsoDate(new Date(year, month, 0)),
      }
    case 'three_months':
      return {
        date_from: toIsoDate(new Date(year, month - 2, 1)),
        date_to: toIsoDate(today),
      }
    case 'year':
      return {
        date_from: toIsoDate(new Date(year, 0, 1)),
        date_to: toIsoDate(today),
      }
    case 'this_month':
    default:
      return {
        date_from: toIsoDate(new Date(year, month, 1)),
        date_to: toIsoDate(today),
      }
  }
}

/** Корректен ли период: обе даты заданы и начало не позже конца. */
export function isValidRange(dateFrom, dateTo) {
  return Boolean(dateFrom) && Boolean(dateTo) && dateFrom <= dateTo
}

/**
 * Подпись «к чему сравниваем» по типу предыдущего периода из ответа бэкенда.
 * @param {string} type - calendar_month | same_days_previous_month | same_length
 * @param {number} days - длина текущего периода (нужна для same_length)
 */
export function previousPeriodLabel(type, days) {
  switch (type) {
    case 'calendar_month':
      return 'к прошлому месяцу'
    case 'same_days_previous_month':
      return 'к тем же дням прошлого месяца'
    default:
      return `к предыдущим ${days} дн.`
  }
}
