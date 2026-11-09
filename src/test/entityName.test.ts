import entityName from '../entityName'
import parseHeaderConfig from '../config/header'
import renderTemplated from '../components/templated'
import { render } from 'lit'

const stateObj = {
  entity_id: 'climate.living_room',
  state: 'heat',
  attributes: { friendly_name: 'Old friendly name' },
}

// Home Assistant 2026.4+ (formatEntityName) and older versions (no helper)
const newHass = (name: unknown = 'Thermostat Living room') => ({
  states: { [stateObj.entity_id]: stateObj },
  formatEntityName: jest.fn(() => name),
})
const oldHass = { states: { [stateObj.entity_id]: stateObj } }

describe('entityName', () => {
  test('uses hass.formatEntityName when Home Assistant has it', () => {
    const hass = newHass()
    expect(entityName(hass, stateObj)).toBe('Thermostat Living room')
    expect(hass.formatEntityName).toHaveBeenCalledWith(stateObj, undefined)
  })

  test('falls back to friendly_name on older Home Assistant', () => {
    expect(entityName(oldHass, stateObj)).toBe('Old friendly name')
  })

  test('falls back when the helper throws or returns nothing', () => {
    const throwing = { formatEntityName: () => { throw new Error('boom') } }
    expect(entityName(throwing, stateObj)).toBe('Old friendly name')
    expect(entityName(newHass(''), stateObj)).toBe('Old friendly name')
  })

  test('uses the entity ID when there is no name at all', () => {
    expect(entityName(oldHass, { entity_id: 'sensor.x', attributes: {} })).toBe('sensor.x')
  })

  test('returns nothing for values that are not state objects', () => {
    expect(entityName(newHass(), undefined)).toBeUndefined()
    expect(entityName(newHass(), 21.5)).toBeUndefined()
  })
})

describe('header title', () => {
  test('defaults to the name Home Assistant shows', () => {
    const data = parseHeaderConfig(undefined, stateObj, newHass()) as any
    expect(data.name).toBe('Thermostat Living room')
  })

  test('a configured name still wins, and false still hides it', () => {
    expect((parseHeaderConfig({ name: 'BedRoom' }, stateObj, newHass()) as any).name).toBe('BedRoom')
    expect((parseHeaderConfig({ name: false }, stateObj, newHass()) as any).name).toBe(false)
  })

  test('older Home Assistant keeps friendly_name', () => {
    expect((parseHeaderConfig(undefined, stateObj, oldHass) as any).name).toBe('Old friendly name')
  })
})

describe('version 3 rows without a label', () => {
  const renderRow = (hass) => {
    const container = document.createElement('div')
    render(renderTemplated({
      context: stateObj,
      entityId: stateObj.entity_id,
      label: undefined,
      hass: { language: 'en', resources: {}, locale: {}, ...hass },
      config: { decimals: 1, layout: {} },
      localize: (str) => str,
      openEntityPopover: () => {},
      variables: {},
    }), container)
    return container.querySelector('.entity-heading')
  }

  test('show the name Home Assistant shows', () => {
    expect(renderRow(newHass()).textContent).toBe('Thermostat Living room')
  })

  test('show that name as text, not HTML', () => {
    const heading = renderRow(newHass('<img src=x onerror="window.__xss=1">'))
    expect(heading.querySelector('img')).toBeNull()
    expect(heading.textContent).toBe('<img src=x onerror="window.__xss=1">')
  })

  test('keep friendly_name on older Home Assistant', () => {
    expect(renderRow(oldHass).textContent).toBe('Old friendly name')
  })
})
