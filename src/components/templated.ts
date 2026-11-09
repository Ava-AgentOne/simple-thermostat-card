import * as Sqrl from 'squirrelly'
import { html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import entityName from '../entityName'
import formatNumber from '../formatNumber'
import renderInfoItem from './infoItem'

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}
const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])

const HTML_UNESCAPES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}
const unescapeHtml = (str: string) =>
  str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => HTML_UNESCAPES[entity])

// Entity states and attributes come from integrations (MQTT discovery, cloud
// devices, custom components), so every string in them is escaped before a
// template sees it. The rendered template is still inserted as HTML, because
// templates and the filters below produce HTML on purpose.
const escapeData = (value) => {
  if (typeof value === 'string') return escapeHtml(value)
  if (Array.isArray(value)) return value.map(escapeData)
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((memo, key) => {
      memo[key] = escapeData(value[key])
      return memo
    }, {})
  }
  return value
}

const renderIcon = (icon) => `<ha-icon icon="${icon}"></ha-icon>`

// Off on purpose: squirrelly escapes after the filters run, which would also
// escape the HTML that `icon`, `css` and `relativetime` produce. Entity data
// is escaped up front by escapeData instead.
Sqrl.defaultConfig.autoEscape = false
Sqrl.filters.define('icon', renderIcon)
Sqrl.filters.define('join', (arr, delimiter = ', ') => arr.join(delimiter))
Sqrl.filters.define('css', (str, css) => {
  const styles = Object.entries(css).reduce((memo, [key, val]) => {
    return `${memo}${key}:${val};`
  }, '')
  return `<span style="${styles}">${str}</span>`
})

// Prints values as Home Assistant has them: strings are unescaped for the JSON,
// then the whole JSON is escaped so it shows as text.
Sqrl.filters.define('debug', (data) => {
  try {
    const json = JSON.stringify(data, (key, value) =>
      typeof value === 'string' ? unescapeHtml(value) : value
    )
    return escapeHtml(String(json))
  } catch {
    return `Not able to read valid JSON object from: ${escapeHtml(String(data))}`
  }
})

export function wrapEntities(config, content) {
  const { type, labels: showLabels } =
    config?.layout?.entities ?? config?.layout?.sensors ?? {
      type: 'table',
      labels: true,
    }

  const classes = [
    showLabels ? 'with-labels' : 'without-labels',
    type === 'list' ? 'as-list' : 'as-table',
  ]
  return html` <div class="entities ${classes.join(' ')}">${content}</div> `
}

export default function renderTemplated({
  context,
  entityId,
  template = '{{state.text}}',
  label,
  hass,
  variables = {},
  config,
  localize,
  openEntityPopover,
}) {
  const { state, attributes } = context

  const [domain] = entityId.split('.')
  const lang = hass.selectedLanguage || hass.language
  const trPrefix = 'ui.card.climate.'
  const translations = Object.entries(hass.resources?.[lang] ?? {}).reduce(
    (memo, [key, value]) => {
      if (key.startsWith(trPrefix)) memo[key.replace(trPrefix, '')] = value
      return memo
    },
    {}
  )

  // Prepare data to inject as variables into the template. Variables come
  // from the card config, so they are passed through as written.
  const data = {
    ...escapeData({
      ...attributes,
      state: {
        raw: state,
        text: localize(state, `component.${domain}.state._.`),
      },
      ui: translations,
    }),
    v: variables,
  }

  // Need to define these inside the function to be able to reach local scope
  Sqrl.filters.define(
    'formatNumber',
    (str, opts = { decimals: config.decimals }) => {
      return String(
        formatNumber(str, {
          ...opts,
          locale: hass.locale,
        })
      )
    }
  )
  Sqrl.filters.define('relativetime', (str, opts = {}) => {
    return `<ha-relative-time fwd-datetime="${str}" with-hass></ha-relative-time>`
  })
  Sqrl.filters.define('translate', (str, prefix = '') => {
    if (!prefix && (domain === 'climate' || domain === 'humidifier')) {
      return localize(str, `state_attributes.${domain}.${str}`)
    }
    return localize(str, prefix)
  })

  const render = (template) => Sqrl.render(template, data, { useWith: true })

  const value = render(template)

  if (
    label === false ||
    (config?.layout?.entities ?? config?.layout?.sensors)?.labels === false
  ) {
    return html`<div class="entity-value">${unsafeHTML(value)}</div>`
  }

  // Without a label, show the entity's name the way Home Assistant does. It is
  // inserted as HTML below, so escape it like any other entity data.
  let heading
  if (!label) {
    heading = escapeHtml(entityName(hass, context) ?? '')
  } else if (label.match(/^(mdi|hass):.*/)) {
    heading = renderIcon(label)
  } else {
    heading = render(label)
  }

  return html`
    <div class="entity-heading">${unsafeHTML(heading)}</div>
    <div class="entity-value">${unsafeHTML(value)}</div>
  `
}
