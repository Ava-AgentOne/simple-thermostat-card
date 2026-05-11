import { LitElement, html } from 'lit'
import styles from './styles.css'
import fireEvent from './fireEvent'
import { name } from '../package.json'

import { CardConfig } from './config/card'
import { HASS } from './types'

function setValue(obj, path, value) {
  const pathFragments = path.split('.')
  let o = obj
  while (pathFragments.length - 1) {
    var fragment = pathFragments.shift()
    if (!o.hasOwnProperty(fragment)) o[fragment] = {}
    o = o[fragment]
  }
  o[pathFragments[0]] = value
}

const OptionsDecimals = [0, 1]

const OptionsStepSize = [0.5, 1]

const OptionsStepLayout = ['column', 'row']

const includeDomains = ['climate']

const GithubReadMe =
  'https://github.com/Wheemer/simple-thermostat/blob/master/README.md'

const stub = {
  header: {},
  layout: {
    mode: {},
  },
}

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj))

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

  _openLink() {
    window.open(GithubReadMe)
  }

  render() {
    if (!this.hass) return html``

    return html`
      <div class="card-config">
        <div class="overall-config">
          <div class="side-by-side">
            <ha-entity-picker
              label="Entity (required)"
              .hass=${this.hass}
              .value="${this.config.entity}"
              .configValue=${'entity'}
              .includeDomains=${includeDomains}
              @change="${this.valueChanged}"
              allow-custom-entity
            ></ha-entity-picker>
            <ha-entity-picker
              label="Current temperature entity (optional)"
              .hass=${this.hass}
              .value="${this.config.current_temperature_entity}"
              .configValue=${'current_temperature_entity'}
              @change="${this.valueChanged}"
              allow-custom-entity
            ></ha-entity-picker>
          </div>

          <ha-formfield label="Show header?">
            <ha-switch
              .checked=${this.config.header !== false}
              @change=${this.toggleHeader}
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show mode names?">
            <ha-switch
              .checked=${this.config?.layout?.mode?.names !== false}
              .configValue="${'layout.mode.names'}"
              @change=${this.valueChanged}
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show mode icons?">
            <ha-switch
              .checked=${this.config?.layout?.mode?.icons !== false}
              .configValue="${'layout.mode.icons'}"
              @change=${this.valueChanged}
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show mode headings?">
            <ha-switch
              .checked=${this.config?.layout?.mode?.headings !== false}
              .configValue="${'layout.mode.headings'}"
              @change=${this.valueChanged}
            ></ha-switch>
          </ha-formfield>

          ${this.config.header !== false
            ? html`
                <div class="side-by-side">
                  <ha-textfield
                    label="Name (optional)"
                    .value="${this.config.header?.name ?? ''}"
                    .configValue="${'header.name'}"
                    @input="${this.valueChanged}"
                  ></ha-textfield>

                  <ha-icon-input
                    label="Icon (optional)"
                    .value="${this.config.header?.icon}"
                    .configValue=${'header.icon'}
                    @value-changed=${this.valueChanged}
                  ></ha-icon-input>
                </div>

                <div class="side-by-side">
                  <ha-entity-picker
                    label="Toggle Entity (optional)"
                    .hass=${this.hass}
                    .value="${this.config?.header?.toggle?.entity}"
                    .configValue=${'header.toggle.entity'}
                    @change="${this.valueChanged}"
                    allow-custom-entity
                  ></ha-entity-picker>

                  <ha-textfield
                    label="Toggle entity label"
                    .value="${this.config?.header?.toggle?.name ?? ''}"
                    .configValue="${'header.toggle.name'}"
                    @input="${this.valueChanged}"
                  ></ha-textfield>
                </div>
              `
            : ''}

          <div class="side-by-side">
            <ha-textfield
              label="Fallback Text (optional)"
              .value="${this.config.fallback ?? ''}"
              .configValue="${'fallback'}"
              @input="${this.valueChanged}"
            ></ha-textfield>
          </div>

          <div class="side-by-side">
            <ha-select
              label="Decimals (optional)"
              .configValue=${'decimals'}
              .value="${this.config.decimals?.toString() ?? ''}"
              @selected="${this.valueChanged}"
              @closed="${(e) => e.stopPropagation()}"
            >
              ${Object.values(OptionsDecimals).map(
                (item) => html`<ha-list-item .value="${item.toString()}">${item}</ha-list-item>`
              )}
            </ha-select>

            <ha-textfield
              label="Unit (optional)"
              .value="${this.config.unit ?? ''}"
              .configValue="${'unit'}"
              @input="${this.valueChanged}"
            ></ha-textfield>
          </div>

          <div class="side-by-side">
            <ha-select
              label="Step Layout (optional)"
              .configValue=${'layout.step'}
              .value="${this.config.layout?.step ?? ''}"
              @selected="${this.valueChanged}"
              @closed="${(e) => e.stopPropagation()}"
            >
              ${Object.values(OptionsStepLayout).map(
                (item) => html`<ha-list-item .value="${item}">${item}</ha-list-item>`
              )}
            </ha-select>

            <ha-select
              label="Step Size (optional)"
              .configValue=${'step_size'}
              .value="${this.config.step_size?.toString() ?? ''}"
              @selected="${this.valueChanged}"
              @closed="${(e) => e.stopPropagation()}"
            >
              ${Object.values(OptionsStepSize).map(
                (item) => html`<ha-list-item .value="${item.toString()}">${item}</ha-list-item>`
              )}
            </ha-select>
          </div>

          <!-- AVA-AGENTONE START: HVAC modes visibility section -->
          ${this._renderHvacModes()}
          <!-- AVA-AGENTONE END -->

          <div class="side-by-side">
            <ha-button @click=${this._openLink}>
              Configuration Options
            </ha-button>

            Settings for label, control, sensors, faults and hiding UI elements
            can only be configured in the code editor
          </div>
        </div>
      </div>
    `
  }

  valueChanged(ev) {
    if (!this.config || !this.hass) {
      return
    }
    const { target } = ev
    const copy = cloneDeep(this.config)
    if (target.configValue) {
      if (target.value === '') {
        delete copy[target.configValue]
      } else {
        setValue(
          copy,
          target.configValue,
          target.checked !== undefined ? target.checked : target.value
        )
      }
    }
    fireEvent(this, 'config-changed', { config: copy })
  }

  toggleHeader(ev) {
    this.config.header = ev.target.checked ? {} : false
    fireEvent(this, 'config-changed', { config: this.config })
  }

  // AVA-AGENTONE START: HVAC modes editor methods
  // Reads available hvac_modes from the selected climate entity and lets the
  // user toggle each one on/off. Writes to `control.hvac.<mode>: false` on hide,
  // deletes the key on show. Cleans up empty parent objects so YAML stays tidy.

  _isHvacModeEnabled(mode: string): boolean {
    const ctrl: any = this.config?.control
    if (ctrl === false) return false
    if (!ctrl || typeof ctrl !== 'object' || Array.isArray(ctrl)) return true
    const hvac = ctrl.hvac
    if (hvac === false) return false
    if (!hvac || typeof hvac !== 'object') return true
    return hvac[mode] !== false
  }

  _hvacModeChanged(mode: string, checked: boolean) {
    const copy: any = cloneDeep(this.config)

    // Normalize `control` to object form. The editor only writes object form;
    // if the user had `control: false` or a string[] array, we replace with {}.
    if (
      !copy.control ||
      typeof copy.control !== 'object' ||
      Array.isArray(copy.control)
    ) {
      copy.control = {}
    }
    if (!copy.control.hvac || typeof copy.control.hvac !== 'object') {
      copy.control.hvac = {}
    }

    if (checked) {
      delete copy.control.hvac[mode]
    } else {
      copy.control.hvac[mode] = false
    }

    // Tidy: remove empty objects so we don't leave `control: {}` cruft in YAML.
    if (Object.keys(copy.control.hvac).length === 0) {
      delete copy.control.hvac
    }
    if (Object.keys(copy.control).length === 0) {
      delete copy.control
    }

    fireEvent(this, 'config-changed', { config: copy })
  }

  _formatModeName(mode: string): string {
    // "heat_cool" -> "Heat Cool", "fan_only" -> "Fan Only"
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
  // AVA-AGENTONE END
}
