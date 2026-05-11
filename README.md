# Simple Thermostat

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
![Build](https://github.com/Ava-AgentOne/simple-thermostat-card/actions/workflows/test.yml/badge.svg)
![Validate HACS](https://github.com/Ava-AgentOne/simple-thermostat-card/actions/workflows/hacs.yml/badge.svg)

A Lovelace thermostat card for Home Assistant. Compact layout, configurable header, sensor rows, per-mode visibility toggles, and a visual editor for the common configuration.

## Installation

### Via HACS (recommended)

1. In HACS, open the kebab menu (⋮) → **Custom repositories**.
2. Add `https://github.com/Ava-AgentOne/simple-thermostat-card` with category **Dashboard**.
3. Search HACS Frontend for "Simple Thermostat" and install.
4. **Hard-refresh your browser** (`Ctrl+Shift+R` / `Cmd+Shift+R`) — without this, the browser may keep an older cached version of the card.

### Manual install

1. Download `simple-thermostat.js` from the [latest release](https://github.com/Ava-AgentOne/simple-thermostat-card/releases/latest).
2. Place it in your Home Assistant `config/www/` directory.
3. Add to Lovelace resources:

```yaml
resources:
  - url: /local/simple-thermostat.js
    type: module
```

4. Hard-refresh the browser.

## Quick configuration

```yaml
type: custom:simple-thermostat
entity: climate.your_climate_entity
```

That's the minimum. Everything else is optional.

## More configuration

```yaml
type: custom:simple-thermostat
entity: climate.living_room
header:
  name: Living Room
sensors:
  - entity: sensor.humidity
    name: Humidity
    icon: mdi:water-percent
control:
  hvac:
    dry: false
    fan_only: false
style:
  --st-setpoint-font-size: 56px
  --st-setpoint-font-weight: bold
```

Common options:

| Key | What it does |
|---|---|
| `entity` | Climate entity (required) |
| `header.name` | Override the card title |
| `header.icon` | MDI icon shown next to the title |
| `sensors` | Extra rows showing other entities under the header |
| `control.hvac.<mode>` | Set to `false` to hide a specific mode button |
| `decimals` | Decimal places for the displayed values |
| `step_size` | Increment when tapping up/down (e.g. `0.5` or `1`) |
| `layout.step` | `column` or `row` for the step buttons |
| `show_setpoint_unit` | Set to `true` to show °C/°F next to the big target number |
| `style` | Map of CSS variables for visual customization |

Most of these are also exposed in the visual editor.

## Compatibility

- **Home Assistant**: 2024.1.0 minimum. Tested on 2026.5.x.
- **HACS**: 2.0+
- **Browsers**: Modern Chromium, Firefox, Safari (including iOS 18+).

## Building from source

```bash
npm install --legacy-peer-deps
npm run build
# Output: dist/simple-thermostat.js
```

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Based on the original simple-thermostat card by Raymond Julin (nervetattoo), with subsequent modernization work by Wheemer. This repository is independently maintained.</sub>
