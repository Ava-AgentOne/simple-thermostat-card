# Changelog

All notable changes to this fork are documented here. For the full upstream history through v3.0.26, see [Wheemer/simple-thermostat](https://github.com/Wheemer/simple-thermostat).

## [v3.4.0] - 2026-05-11

### Fixed — Editor dropdowns (real fix this time)
- **Decimals / Step Layout / Step Size dropdowns now actually save.** v3.3.0 claimed to fix this but didn't. Root cause was misdiagnosed: there's no event re-fire race. HA's `<ha-select>` fires the `selected` event _before_ its own `.value` property updates (see `home-assistant/frontend` `src/components/ha-select.ts` — `_handleSelect` emits the event but doesn't write `this.value`; the parent is expected to do that on the next render). v3.3's handler read `target.value` first and fell back to `ev.detail?.value`, but `target.value` is always the stale previous value at the moment `selected` fires, so the fallback was never reached.
- New read order: `ev.detail.value` first (HA's authoritative source), `ev.target.value` second.
- Numeric configValues (`decimals`, `step_size`) are coerced via `Number()` so the YAML stays type-correct — the dropdown options are numbers (`0`, `1`, `0.5`) but round-trip through HA as strings, which would silently break arithmetic in the renderer.
- The re-fire guard from v3.3 (now a no-op since `selected` only fires on actual changes) is left in place as a defensive cheap equality check.

### Changed — Editor layout
- Decimals, Step Size, and Step Layout dropdowns moved into a new collapsible **Advanced** `<ha-expansion-panel>` section. They remain fully functional but no longer clutter the default view. Step Layout was kept per spec; Decimals and Step Size were also kept (vs. removed) so users can still adjust without dropping to YAML.
- The "Show mode headings?" toggle was removed from the editor. (The underlying `layout.mode.headings` config key still works in YAML — only the UI control is gone.)

### Notes on v3.3 honesty
- v3.3 shipped with a confident-but-wrong dropdown fix and a fabricated "Show ___" grid layout cleanup that, while real, didn't surface the buried Name field for users because the field was conditionally hidden when `header: false`. The conditional-render path was unchanged from upstream Wheemer and is the correct behavior — toggling "Show header?" on reveals the Name field as expected.
- All v3.4 additions remain wrapped in `AVA-AGENTONE` markers in `src/editor.ts` and `src/styles.css` for tractable future merges from upstream.

## [v3.3.0] - 2026-05-11

### Fixed — Editor dropdowns
- **Decimals / Step Layout / Step Size dropdowns now save correctly.** They were silently reverting to the previous value on every open. Root cause: ha-select's `selected` event re-fires when HA pushes the config back into the editor, and the shared `valueChanged` handler had no guard against the re-fire — the second fire would race with the user's selection. Also fixed a latent bug where clearing a nested-path value (e.g. `layout.step`) tried to delete a literal `"layout.step"` key.
- New `_selectChanged` method dedicated to ha-select with a re-fire guard (compares new value to current) and dotted-path delete.

### Added — Editor: layout cleanup
- The four "Show ___" toggles are now wrapped in a responsive grid (`.ava-editor-toggle-grid`) so they stop overflowing into the Name / Icon fields on narrow editor panels. The previously buried `Name (optional)` field is discoverable again.

### Added — Card: style passthrough (CSS var override)
- New top-level `style:` config key on the card. Any key/value pairs you put there are emitted as inline style on the `<ha-card>` element, so you can override CSS variables (or set plain CSS properties) without needing the `card-mod` integration:
  ```yaml
  type: custom:simple-thermostat
  entity: climate.majles_ac
  style:
    --st-setpoint-font-size: 56px
    --st-setpoint-font-weight: bold
  ```
- Two new CSS vars wired into the existing setpoint style for the common "make my target temperature bigger / bolder" case:
  - `--st-setpoint-font-size` (defaults to upstream's `--st-font-size-l` / `--st-font-size-xl` cascade)
  - `--st-setpoint-font-weight` (defaults to `400`)
- All other upstream CSS vars (`--st-font-size-title`, mode colors, etc.) remain available through the same `style:` key.

### Notes on upstream divergence
- This release touches `src/main.ts` (style passthrough render block), `src/config/card.ts` (new `style` field on `CardConfig`), `src/editor.ts` (dropdown handler + toggle grid wrap), and `src/styles.css` (toggle-grid + setpoint vars). All additions are wrapped in `AVA-AGENTONE` markers to keep future upstream merges tractable.

## [v3.2.1] - 2026-05-11

### Fixed
- **HVAC modes editor: toggling any mode hid all buttons.** The upstream `control.hvac` config key uses allow-list semantics — as soon as any non-`_` key is set, modes not explicitly truthy get filtered out at render time. The previous editor wrote just `{ <mode>: false }`, which flipped that switch and accidentally hid every mode. The editor now writes the full enumeration of available modes (each `true` or `false`) on every toggle, or deletes `control.hvac` entirely when all modes are visible. Existing YAML written by hand continues to work unchanged.
- Editor's `_isHvacModeEnabled` read path now correctly mirrors runtime filter logic, so the initial toggle states match what the card actually renders even for hand-edited configs with partial mode lists.

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
