# Changelog

## [v3.9.1] - 2026-06-05

### Changed
- Advanced section (Decimals / Step Size / Step Layout) now renders as compact dropdowns instead of stacked radio buttons. HA's `select` selector defaults to `mode: 'list'` (radios) when there are fewer than 6 options; we explicitly set `mode: 'dropdown'` to override. The Advanced panel is now ~70% shorter.

## [v3.9.0] - 2026-05-11

Initial release.

A Lovelace thermostat card for Home Assistant. Compact layout with current temperature, target temperature, HVAC mode buttons, and configurable header.

### Features

- Climate entity control with target temperature up/down buttons
- HVAC mode buttons (off, cool, heat, heat_cool, dry, fan_only — whatever the entity supports)
- Visual editor with:
  - Entity picker (climate-only)
  - Show/hide toggles for header, mode names, mode icons, mode headings
  - Optional card name and icon
  - Per-mode visibility toggles (auto-discovered from the entity)
  - Collapsible advanced panel for decimals, step size, step layout
- YAML configuration for sensors, control overrides, custom CSS variables
- Tested on Home Assistant 2026.5.x; minimum 2024.1.0

### Configuration

Minimum:

```yaml
type: custom:simple-thermostat
entity: climate.your_climate_entity
```

With sensor rows and custom styling:

```yaml
type: custom:simple-thermostat
entity: climate.your_climate_entity
header:
  name: Living Room
sensors:
  - entity: sensor.humidity
    name: Humidity
    icon: mdi:water-percent
style:
  --st-setpoint-font-size: 56px
  --st-setpoint-font-weight: bold
```
