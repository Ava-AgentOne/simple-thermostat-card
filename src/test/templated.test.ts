import renderTemplated from '../components/templated'
import { render } from 'lit'

// Entity names, states and attributes come from integrations (MQTT discovery,
// cloud devices, custom components), so they are untrusted. Templates and
// variables come from the card config, which only an admin can edit.
const PAYLOAD = '<img src=x onerror="window.__xss=1">'

function renderInto(spec) {
  const container = document.createElement('div')
  const result = renderTemplated({
    entityId: 'climate.living_room',
    hass: { language: 'en', resources: {}, locale: {} },
    config: { decimals: 1, layout: {} },
    localize: (str) => str,
    openEntityPopover: () => {},
    variables: {},
    ...spec,
  })
  render(result, container)
  return container
}

test('entity data is shown as text, not HTML', () => {
  const container = renderInto({
    context: {
      state: '<b>heat</b>',
      attributes: { friendly_name: PAYLOAD, note: '<script>bad()</script>' },
    },
    template: '{{state.text}} {{note}}',
  })
  expect(container.querySelector('img, b, script')).toBeNull()
  expect(container.textContent).toContain(PAYLOAD)
  expect(container.textContent).toContain('<b>heat</b>')
  expect(container.textContent).toContain('<script>bad()</script>')
})

test('HTML written in the template and by filters still renders', () => {
  const container = renderInto({
    context: {
      state: 'heat',
      attributes: { friendly_name: 'Living room', icon_name: 'mdi:fire', temp: 21.25 },
    },
    template: '<b>{{state.text}}</b> {{icon_name | icon}} {{temp | formatNumber}} {{"warm" | css({color: "red"})}}',
  })
  expect(container.querySelector('b')?.textContent).toBe('heat')
  expect(container.querySelector('ha-icon')?.getAttribute('icon')).toBe('mdi:fire')
  expect(container.querySelector('span')?.getAttribute('style')).toBe('color:red;')
  expect(container.textContent).toContain('21.3')
  expect(container.querySelector('.entity-heading')?.textContent).toBe('Living room')
})

test('entity data cannot break out of the HTML a filter produces', () => {
  const container = renderInto({
    context: {
      state: 'heat',
      attributes: {
        icon_name: 'x" onclick="window.__xss=1',
        changed: 'x onmouseover=window.__xss=1',
      },
    },
    template: '{{icon_name | icon}} {{changed | relativetime}}',
    label: false,
  })
  const icon = container.querySelector('ha-icon')
  expect(icon?.getAttribute('icon')).toBe('x" onclick="window.__xss=1')
  expect(icon?.hasAttribute('onclick')).toBe(false)
  const time = container.querySelector('ha-relative-time')
  expect(time?.getAttribute('fwd-datetime')).toBe('x onmouseover=window.__xss=1')
  expect(time?.hasAttribute('onmouseover')).toBe(false)
})

test('the debug filter shows data as text, with its original values', () => {
  const container = renderInto({
    context: { state: 'heat', attributes: { note: PAYLOAD, room: "Kid's room & hall" } },
    template: '{{it | debug}}',
    label: false,
  })
  expect(container.querySelector('img')).toBeNull()
  expect(container.textContent).toContain(`"note":${JSON.stringify(PAYLOAD)}`)
  expect(container.textContent).toContain(`"room":"Kid's room & hall"`)
})

test('variables from the card config may contain HTML', () => {
  const container = renderInto({
    context: { state: 'heat', attributes: {} },
    template: '{{v.badge}}',
    variables: { badge: '<i>eco</i>' },
    label: false,
  })
  expect(container.querySelector('i')?.textContent).toBe('eco')
})
