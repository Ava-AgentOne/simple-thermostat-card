# Changelog

## v3.11.0 - 2026-07-05

### Fixed
- **Touch: scrolling from a +/- button no longer changes the setpoint.** The tap step used to fire on `pointerdown`, so starting a dashboard scroll on the button stepped the temperature once before the browser took over the gesture. The tap step now fires on `pointerup`; `pointercancel`/`pointerleave` cancel the press with no step. Long-press ramp behavior is unchanged (first auto-step at the 400ms hold boundary, then accelerating).
- Flaky unit test that asserted lit whitespace layout (broke on newer lit).

### Added
- **HA 2026.6+ card picker suggestions** — the card now registers `getEntitySuggestion`, so it appears under the Community section of the card picker when a climate entity is selected.
- `touch-action: manipulation` on the setpoint buttons (no more double-tap-zoom delay on touch).

### Changed
- All dependencies exact-pinned (CI installs resolved fresh, unpinned versions on every build — the stale `yarn.lock` was not used by the npm-based workflows and has been removed).
- Removed unused semantic-release config and dependencies (releases are tag-driven via GitHub Actions).

## [v3.10.1] - 2026-06-05

### Fixed
- Long-press ramp now respects the entity's `min_temp` and `max_temp` attributes. Previously, holding + would ramp past the upper limit (e.g. past 30°C); holding − would ramp below the lower limit. The single-tap path was already protected by `?disabled` on the button, but the pointer-event-based ramp bypassed that. Fixed by clamping inside `setTemperature` itself (defensive, single source of truth) and stopping the ramp scheduler once a limit is reached (no point continuing to fire calls that get clamped to the same value).

## [v3.10.0] - 2026-06-05

### Added — Accelerating long-press on setpoint buttons

Press and hold the + or − button to ramp the target temperature instead of tapping repeatedly. Tap behavior is unchanged (single tap = single step).

Acceleration profile:
- Tap or release before 400 ms → one step, same as before
- Hold past 400 ms → ~3 ticks/sec
- Hold past 1.5 s → ~6 ticks/sec
- Hold past 3.5 s → ~10 ticks/sec
- Release / cancel → stops immediately

Each tick updates the local display optimistically. The existing service-call debounce coalesces the rapid updates into a single trailing `set_temperature` call, so the underlying climate entity (e.g. IR-controlled ACs) doesn't get spammed with intermediate values.

Implementation uses `pointerdown` / `pointerup` / `pointercancel` / `pointerleave` rather than `click`, so it works equivalently on mouse, touch, and stylus.

### Added — Mode-state-driven setpoint color

The big target-temperature number now tints based on what the AC is actively doing (the entity's `hvac_action`):
- **cooling** → blue (`#4a9eff` default)
- **heating** → red (`#ff6b4a` default)
- **drying** → amber (`#ffb74a` default)
- **fan** → teal (`#7ad9c8` default)
- **idle / off / none** → default text color

Each color is overridable via CSS variable in the `style:` config block:

```yaml
style:
  --st-setpoint-cooling-color: "#00aaff"
  --st-setpoint-heating-color: "#ff4444"
```

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
