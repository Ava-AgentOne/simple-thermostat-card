# Changelog

All notable changes to this fork are documented here. For the full upstream history through v3.0.26, see [Wheemer/simple-thermostat](https://github.com/Wheemer/simple-thermostat).

## [v3.2.0] - 2026-05-11

### Added — UI editor: HVAC modes section
- New section in the visual editor that auto-discovers the climate entity's available `hvac_modes` and renders one toggle per mode.
- Toggle off any mode (e.g. `dry`, `heat_cool`, `fan_only`) to hide its button from the card — no YAML editing required.
- Writes to the standard `control.hvac.<mode>: false` config key, so existing YAML-configured cards remain fully compatible.
- Empty `control` / `control.hvac` objects are cleaned up automatically so the generated YAML stays tidy.
- Mode labels are formatted for display (`heat_cool` → `Heat Cool`, `fan_only` → `Fan Only`).

### Notes
- This is the first divergence from upstream Wheemer. All additions are wrapped in `AVA-AGENTONE` comment markers in `src/editor.ts` and `src/styles.css` for easy merging when pulling future upstream changes.
- One pre-existing test failure in `src/test/renderInfoItem.test.ts` (whitespace assertion bug from upstream Wheemer; flagged as TODO in their code) is unrelated to this change.

## [v3.1.0] - 2026-05-09

### Forked from upstream
- Mirrored from [Wheemer/simple-thermostat](https://github.com/Wheemer/simple-thermostat) at v3.0.26
- Re-namespaced as `simple-thermostat-card` under [Ava-AgentOne](https://github.com/Ava-AgentOne)
- The Lovelace card type stays `custom:simple-thermostat` — existing dashboard YAML keeps working unchanged

### Infrastructure
- Default branch is `main` (not `master`)
- Release workflow: tag push (`v*`) builds the bundle and attaches `simple-thermostat.js` to the GitHub Release
- HACS validation workflow runs on push, PR, and daily on cron
- Test workflow runs jest on push to `main` and PRs

### Inherited from upstream v3.0.26
All fixes and features from Wheemer's v3.0.x line are included:
- `header.toggles` for multiple header toggle switches
- `entities` config key (preferred over legacy `sensors`)
- Toggle-capable extra-entity rows render as switches
- `swing_horizontal` / `swing_vertical` mode support (HA Core 2024.12+)
- `vane_horizontal` / `vane_vertical` for Intesis-style integrations
- `current_temperature_entity` override
- HA 2026.5.0 localization compatibility
- Fix for HA 2025.5 `--paper-*` CSS variable removal
- Fix for Safari/iOS duplicate custom-element registration
- Fix for crashes inside collapsible/container cards
- Fix for unlisted preset modes (e.g. `away_indefinitely`)
- Lit 3.x migration

## Lineage

| Phase | Maintainer | Versions |
|---|---|---|
| Original | nervetattoo (Raymond Julin) | 0.x – 2.5.0 |
| Modernization | Wheemer | 3.0.0 – 3.0.26 |
| This fork | Ava-AgentOne | 3.1.0+ |

## Versioning policy

This fork uses its own minor-version line (`3.1.x`) to avoid collisions with upstream Wheemer. When pulling upstream changes, the corresponding Wheemer version is noted in the release entry.
