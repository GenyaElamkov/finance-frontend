// Палитра для топ-категорий. Всё, что не вошло в топ, отображается серым как «Прочее».
export const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9']
export const OTHER_COLOR = '#9ca3af'
export const TOP_LIMIT = CHART_COLORS.length

/** Цвет категории верхнего уровня по ее месту в списке (отсортирован по убыванию суммы). */
export function colorForIndex(index) {
  return index < TOP_LIMIT ? CHART_COLORS[index] : OTHER_COLOR
}

/**
 * Сегменты для кольцевой диаграммы: топ-N категорий + «Прочее».
 * @param {Array} items - категории верхнего уровня из отчета бэкенда
 * @returns {Array<{ label: string, value: number, color: string, percentage: number }>}
 */
export function buildDonutSegments(items = []) {
  const top = items.slice(0, TOP_LIMIT).map((item, index) => ({
    label: item.name,
    value: Number(item.total),
    color: colorForIndex(index),
    percentage: item.percentage,
  }))

  const rest = items.slice(TOP_LIMIT)
  if (rest.length > 0) {
    top.push({
      label: 'Прочее',
      value: rest.reduce((sum, item) => sum + Number(item.total), 0),
      color: OTHER_COLOR,
      percentage: Math.round(rest.reduce((sum, item) => sum + item.percentage, 0) * 10) / 10,
    })
  }
  return top
}
