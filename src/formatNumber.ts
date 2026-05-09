type Input = number | null | undefined | boolean | string
type LocaleOptions = {
  language?: string
  number_format?: string
}
type Options = {
  decimals?: number
  fallback?: string
  locale?: LocaleOptions
}

function getLanguage(locale?: LocaleOptions): string | undefined {
  if (!locale) return undefined
  if (locale.number_format === 'system') return undefined
  return locale.language
}

function formatNumber(
  number: Input,
  { decimals = 1, fallback = 'N/A', locale }: Options = {}
): string {
  const type = typeof number
  if (
    number === null ||
    number === '' ||
    ['boolean', 'undefined'].includes(type)
  ) {
    return fallback
  }

  const value = Number(number)
  if (Number.isNaN(value)) return fallback

  if (!locale) {
    return value.toFixed(decimals)
  }

  if (locale.number_format === 'decimal_comma') {
    return value.toFixed(decimals).replace('.', ',')
  }

  if (locale.number_format === 'space_comma') {
    return value.toFixed(decimals).replace('.', ',')
  }

  if (locale.number_format === 'comma_decimal') {
    return value.toFixed(decimals)
  }

  return new Intl.NumberFormat(getLanguage(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export default formatNumber
