import { LitElement, html } from 'lit'
import styles from './styles.css'
import fireEvent from './fireEvent'

import { CardConfig } from './config/card'
import { HASS } from './types'

const stub = {
  header: {},
  layout: {
    mode: {},
  },
}

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj))

// AVA-AGENTONE v3.8: editor fully rewritten to use <ha-form> with selectors.
//
// Rationale: HA has been progressively replacing element-level web components
// (ha-textfield, ha-icon-input, mwc-list-item slot in ha-select, etc.) with a
// new generation built on webawesome internals. Custom-card editors that wire
// individual elements one by one keep breaking as those internals change.
// ha-form + selectors is the path HA's own card editors use, because it lets
// HA own all the rendering decisions; the schema is a stable declarative API.
//
// The HVAC modes section is NOT moved into the schema. Its toggles depend on
// hvac_modes attributes from the live state object, which changes per entity.
// ha-form schemas are best when static. Keeping it as a custom render below
// the form is cleaner than trying to memoize per-entity schemas.

export default class SimpleThermostatEditor extends LitElement {
  config: CardConfig
  hass: HASS

  static get styles() {
    return styles
  }

  static get properties() {
    return { hass: {}, config: {} }
  }

  static getStubConfig() {
    return { ...stub }
  }

  setConfig(config) {
    this.config = config || { ...stub }
  }

  // ---- Data adapter: nested CardConfig <-> flat form data ----

  _toFormData() {
    const c: any = this.config || {}
    return {
      entity: c.entity ?? '',
      show_header: c.header !== false,
      show_mode_names: c.layout?.mode?.names !== false,
      show_mode_icons: c.layout?.mode?.icons !== false,
      show_mode_headings: c.layout?.mode?.headings !== false,
      header_name: c.header && c.header !== false ? c.header.name ?? '' : '',
      header_icon: c.header && c.header !== false ? c.header.icon ?? '' : '',
      decimals: c.decimals != null ? String(c.decimals) : '',
      step_size: c.step_size != null ? String(c.step_size) : '',
      step_layout: c.layout?.step ?? '',
    }
  }

  _fromFormData(data: any): CardConfig {
    const copy: any = cloneDeep(this.config) || {}

    if (data.entity) copy.entity = data.entity
    else delete copy.entity

    if (data.show_header === false) {
      copy.header = false
    } else {
      if (copy.header === false || !copy.header) copy.header = {}
      if (data.header_name) copy.header.name = data.header_name
      else delete copy.header.name
      if (data.header_icon) copy.header.icon = data.header_icon
      else delete copy.header.icon
    }

    if (!copy.layout) copy.layout = {}
    if (!copy.layout.mode) copy.layout.mode = {}
    const writeMode = (key: string, val: boolean) => {
      if (val === false) copy.layout.mode[key] = false
      else delete copy.layout.mode[key]
    }
    writeMode('names', data.show_mode_names)
    writeMode('icons', data.show_mode_icons)
    writeMode('headings', data.show_mode_headings)
    if (Object.keys(copy.layout.mode).length === 0) delete copy.layout.mode

    if (data.decimals === '' || data.decimals == null) delete copy.decimals
    else copy.decimals = Number(data.decimals)

    if (data.step_size === '' || data.step_size == null) delete copy.step_size
    else copy.step_size = Number(data.step_size)

    if (data.step_layout) copy.layout.step = data.step_layout
    else delete copy.layout.step

    if (Object.keys(copy.layout).length === 0) delete copy.layout

    return copy
  }

  _schema(formData: any) {
    const headerVisible = formData.show_header !== false

    return [
      {
        name: 'entity',
        required: true,
        selector: { entity: { domain: 'climate' } },
      },
      {
        name: 'display_options',
        type: 'grid',
        schema: [
          { name: 'show_header', selector: { boolean: {} } },
          { name: 'show_mode_names', selector: { boolean: {} } },
          { name: 'show_mode_icons', selector: { boolean: {} } },
          { name: 'show_mode_headings', selector: { boolean: {} } },
        ],
      },
      ...(headerVisible
        ? [
            {
              name: 'header_fields',
              type: 'grid',
              schema: [
                { name: 'header_name', selector: { text: {} } },
                { name: 'header_icon', selector: { icon: {} } },
              ],
            },
          ]
        : []),
      {
        name: 'advanced',
        type: 'expandable',
        flatten: true,
        schema: [
          {
            name: 'advanced_grid',
            type: 'grid',
            schema: [
              {
                name: 'decimals',
                selector: {
                  select: {
                    options: [
                      { value: '', label: 'Default' },
                      { value: '0', label: '0' },
                      { value: '1', label: '1' },
                    ],
                  },
                },
              },
              {
                name: 'step_size',
                selector: {
                  select: {
                    options: [
                      { value: '', label: 'Default' },
                      { value: '0.5', label: '0.5' },
                      { value: '1', label: '1' },
                    ],
                  },
                },
              },
            ],
          },
          {
            name: 'step_layout',
            selector: {
              select: {
                options: [
                  { value: '', label: 'Default' },
                  { value: 'column', label: 'column' },
                  { value: 'row', label: 'row' },
                ],
              },
            },
          },
        ],
      },
    ]
  }

  _computeLabel = (schema: any): string => {
    const labels: Record<string, string> = {
      entity: 'Entity',
      show_header: 'Show header?',
      show_mode_names: 'Show mode names?',
      show_mode_icons: 'Show mode icons?',
      show_mode_headings: 'Show mode headings?',
      header_name: 'Name (optional)',
      header_icon: 'Icon (optional)',
      advanced: 'Advanced',
      decimals: 'Decimals (optional)',
      step_size: 'Step Size (optional)',
      step_layout: 'Step Layout (optional)',
    }
    return labels[schema.name] ?? schema.name
  }

  render() {
    if (!this.hass) return html``

    const formData = this._toFormData()
    const schema = this._schema(formData)

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${formData}
          .schema=${schema}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formValueChanged}
        ></ha-form>

        ${this._renderHvacModes()}
      </div>
    `
  }

  _formValueChanged = (ev: CustomEvent) => {
    ev.stopPropagation()
    if (!this.config || !this.hass) return
    const newConfig = this._fromFormData(ev.detail.value)
    fireEvent(this, 'config-changed', { config: newConfig })
  }

  // ---- HVAC modes section (unchanged) ----

  _isHvacModeEnabled(mode: string): boolean {
    const ctrl: any = this.config?.control
    if (ctrl === false) return false
    if (!ctrl || typeof ctrl !== 'object' || Array.isArray(ctrl)) return true
    const hvac = ctrl.hvac
    if (hvac === false) return false
    if (!hvac || typeof hvac !== 'object') return true

    const hasNonMetaKeys = Object.keys(hvac).some((k) => !k.startsWith('_'))
    if (hasNonMetaKeys) {
      const value = hvac[mode]
      if (value === undefined) return false
      if (typeof value === 'object' && value !== null) {
        return value.include !== false
      }
      return value !== false
    }
    return true
  }

  _hvacModeChanged(mode: string, checked: boolean) {
    const copy: any = cloneDeep(this.config)

    const entityId = copy.entity
    const stateObj = entityId ? this.hass?.states?.[entityId] : null
    const allModes: string[] = stateObj?.attributes?.hvac_modes ?? []

    if (allModes.length === 0) return

    const newVisibility: Record<string, boolean> = {}
    for (const m of allModes) {
      newVisibility[m] = m === mode ? checked : this._isHvacModeEnabled(m)
    }

    if (
      !copy.control ||
      typeof copy.control !== 'object' ||
      Array.isArray(copy.control)
    ) {
      copy.control = {}
    }

    const allVisible = allModes.every((m) => newVisibility[m])
    if (allVisible) {
      delete copy.control.hvac
    } else {
      copy.control.hvac = {}
      for (const m of allModes) {
        copy.control.hvac[m] = newVisibility[m]
      }
    }

    if (Object.keys(copy.control).length === 0) {
      delete copy.control
    }

    fireEvent(this, 'config-changed', { config: copy })
  }

  _formatModeName(mode: string): string {
    return mode
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  _renderHvacModes() {
    const entityId = this.config?.entity
    const stateObj = entityId ? this.hass.states[entityId] : null
    const modes: string[] = stateObj?.attributes?.hvac_modes ?? []

    if (modes.length === 0) {
      return html``
    }

    return html`
      <div class="ava-editor-section">
        <div class="ava-editor-section-title">HVAC modes</div>
        <div class="ava-editor-section-subtitle">
          Toggle off any mode you want to hide from the card buttons.
        </div>
        <div class="ava-mode-grid">
          ${modes.map(
            (mode) => html`
              <ha-formfield label="${this._formatModeName(mode)}">
                <ha-switch
                  .checked=${this._isHvacModeEnabled(mode)}
                  @change=${(e: any) =>
                    this._hvacModeChanged(mode, e.target.checked)}
                ></ha-switch>
              </ha-formfield>
            `
          )}
        </div>
      </div>
    `
  }
}
