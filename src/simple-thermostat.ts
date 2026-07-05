import { name as CARD_NAME, version } from '../package.json'
import SimpleThermostatEditor from './editor'
import SimpleThermostat from './main'

if (!customElements.get(CARD_NAME)) {
  customElements.define(CARD_NAME, SimpleThermostat)
}
if (!customElements.get(`${CARD_NAME}-editor`)) {
  customElements.define(`${CARD_NAME}-editor`, SimpleThermostatEditor)
}

console.info(`%c${CARD_NAME}: ${version}`, 'font-weight: bold')
;(window as any).customCards = (window as any).customCards || []
;(window as any).customCards.push({
  type: CARD_NAME,
  name: 'Simple Thermostat',
  preview: false,
  description: 'A different take on the thermostat card',
  documentationURL: 'https://github.com/Ava-AgentOne/simple-thermostat-card',
  // HA 2026.6+: suggest this card for climate entities in the card picker
  // (shows under the Community section when the user picks an entity)
  getEntitySuggestion: (_hass: unknown, entityId: string) => {
    if (entityId.split('.')[0] !== 'climate') {
      return null
    }
    return {
      config: { type: `custom:${CARD_NAME}`, entity: entityId },
    }
  },
})
