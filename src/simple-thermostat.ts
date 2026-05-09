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
})
