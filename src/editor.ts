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

          <!-- AVA-AGENTONE START: display options grid (was: overflowing inline toggles) -->
          <div class="ava-editor-toggle-grid">
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
          </div>
          <!-- AVA-AGENTONE END -->

          <!-- AVA-AGENTONE START: route ha-select dropdowns to _selectChanged
               instead of valueChanged. valueChanged had a re-fire race and
               broken dotted-path delete. -->
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
            <ha-textfield
              label="Unit (optional)"
              .value="${this.config.unit ?? ''}"
              .configValue="${'unit'}"
              @input="${this.valueChanged}"
            ></ha-textfield>
          </div>

          <!-- AVA-AGENTONE START: Advanced collapsible (Decimals / Step Layout / Step Size).
               Per v3.4 spec: these are reachable but hidden by default to declutter the
               editor. Step Layout was explicitly kept; Decimals and Step Size are kept
               here too for completeness (rather than removed entirely) so users can still
               adjust them without dropping to YAML. -->
          <ha-expansion-panel
            class="ava-advanced-panel"
            outlined
            header="Advanced"
          >
            <div class="side-by-side">
              <ha-select
                label="Decimals (optional)"
                .configValue=${'decimals'}
                .value="${this.config.decimals?.toString() ?? ''}"
                @selected="${this._selectChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                ${Object.values(OptionsDecimals).map(
                  (item) => html`<ha-list-item .value="${item.toString()}">${item}</ha-list-item>`
                )}
              </ha-select>

              <ha-select
                label="Step Size (optional)"
                .configValue=${'step_size'}
                .value="${this.config.step_size?.toString() ?? ''}"
                @selected="${this._selectChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                ${Object.values(OptionsStepSize).map(
                  (item) => html`<ha-list-item .value="${item.toString()}">${item}</ha-list-item>`
                )}
              </ha-select>
            </div>

            <div class="side-by-side">
              <ha-select
                label="Step Layout (optional)"
                .configValue=${'layout.step'}
                .value="${this.config.layout?.step ?? ''}"
                @selected="${this._selectChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                ${Object.values(OptionsStepLayout).map(
                  (item) => html`<ha-list-item .value="${item}">${item}</ha-list-item>`
                )}
              </ha-select>
            </div>
          </ha-expansion-panel>
          <!-- AVA-AGENTONE END -->

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

  // AVA-AGENTONE START: HVAC modes editor methods + dropdown fix
  // Auto-discovers the climate entity's hvac_modes and lets the user toggle each.
  //
  // IMPORTANT: upstream `control.hvac` is an ALLOW-LIST when populated, not a deny-list.
  // As soon as ONE non-underscore key is present, any mode not explicitly truthy is
  // filtered out at render time. So we must always write the FULL enumeration of
  // available modes (each as `true` or `false`), or delete `control.hvac` entirely
  // when every mode is visible.

  // Dedicated handler for <ha-select> dropdowns.
  //
  // v3.4 diagnostic: HA's ha-select fires `selected` BEFORE its own .value
  // property updates (see home-assistant/frontend src/components/ha-select.ts).
  // The authoritative read path is ev.detail.value; ev.target.value is stale
  // at this point. Earlier versions read target first and fell back to detail,
  // which is why the editor silently dropped every selection.
  //
  // Also: numeric option values round-trip through HA as strings, so we coerce
  // them back via the configValue→type map when needed.
  _selectChanged(ev: any) {
    if (!this.config || !this.hass) return
    const target = ev.target
    if (!target?.configValue) return

    // Authoritative: ev.detail.value (HA emits {value} in detail).
    let newValue: any = ev.detail?.value
    if (newValue === undefined) newValue = target.value

    // Coerce known-numeric configValues so YAML stays type-correct.
    const numericConfigValues = ['decimals', 'step_size']
    if (
      numericConfigValues.includes(target.configValue) &&
      newValue !== undefined &&
      newValue !== null &&
      newValue !== ''
    ) {
      const n = Number(newValue)
      if (!Number.isNaN(n)) newValue = n
    }

    const currentValue = this._readConfigPath(target.configValue)
    if (currentValue === newValue) return

    const copy: any = cloneDeep(this.config)
    if (newValue == null || newValue === '') {
      this._deleteConfigPath(copy, target.configValue)
    } else {
      setValue(copy, target.configValue, newValue)
    }
    fireEvent(this, 'config-changed', { config: copy })
  }

  _readConfigPath(path: string): any {
    return path
      .split('.')
      .reduce(
        (o: any, k: string) => (o == null ? undefined : o[k]),
        this.config as any
      )
  }

  _deleteConfigPath(obj: any, path: string) {
    const parts = path.split('.')
    let o = obj
    for (let i = 0; i < parts.length - 1; i++) {
      if (!o[parts[i]]) return
      o = o[parts[i]]
    }
    delete o[parts[parts.length - 1]]
  }

  _isHvacModeEnabled(mode: string): boolean {
    const ctrl: any = this.config?.control
    if (ctrl === false) return false
    if (!ctrl || typeof ctrl !== 'object' || Array.isArray(ctrl)) return true
    const hvac = ctrl.hvac
    if (hvac === false) return false
    if (!hvac || typeof hvac !== 'object') return true

    // Allow-list semantics: if hvac has any non-meta key, unlisted modes are hidden.
    const hasNonMetaKeys = Object.keys(hvac).some((k) => !k.startsWith('_'))
    if (hasNonMetaKeys) {
      const value = hvac[mode]
      if (value === undefined) return false
      if (typeof value === 'object' && value !== null) {
        return value.include !== false
      }
      return value !== false
    }
    // Empty / meta-only object → defaults apply, all modes visible.
    return true
  }

  _hvacModeChanged(mode: string, checked: boolean) {
    const copy: any = cloneDeep(this.config)

    // Pull all available modes for this entity from hass state.
    const entityId = copy.entity
    const stateObj = entityId ? this.hass?.states?.[entityId] : null
    const allModes: string[] = stateObj?.attributes?.hvac_modes ?? []

    // If we can't resolve the mode list (entity not loaded yet), bail.
    if (allModes.length === 0) return

    // Compute the visibility state for every mode AFTER this toggle.
    const newVisibility: Record<string, boolean> = {}
    for (const m of allModes) {
      newVisibility[m] = m === mode ? checked : this._isHvacModeEnabled(m)
    }

    // Normalize `control` to object form. Editor only writes object form.
    if (
      !copy.control ||
      typeof copy.control !== 'object' ||
      Array.isArray(copy.control)
    ) {
      copy.control = {}
    }

    const allVisible = allModes.every((m) => newVisibility[m])
    if (allVisible) {
      // Every mode visible → drop the override so defaults apply.
      delete copy.control.hvac
    } else {
      // Allow-list mode: write the full enumeration so unlisted modes don't vanish.
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
