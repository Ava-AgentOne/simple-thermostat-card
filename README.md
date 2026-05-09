# simple-thermostat-card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
![Build](https://github.com/Ava-AgentOne/simple-thermostat-card/actions/workflows/test.yml/badge.svg)
![Validate HACS](https://github.com/Ava-AgentOne/simple-thermostat-card/actions/workflows/hacs.yml/badge.svg)

> A Lovelace thermostat card for Home Assistant — Ava-AgentOne fork of [Wheemer/simple-thermostat](https://github.com/Wheemer/simple-thermostat), which itself is a community-maintained continuation of [nervetattoo/simple-thermostat](https://github.com/nervetattoo/simple-thermostat) by [@nervetattoo](https://github.com/nervetattoo). All credit for the original card goes to Raymond Julin; thanks to [Wheemer](https://github.com/Wheemer) for the lit-3.x modernization and active maintenance through the v3.x line.

A compact, flexible thermostat card focused on easy interaction and configurable layout. Embed sensor values, customize controls, theme to taste. The card type stays `custom:simple-thermostat` so existing dashboard YAML continues to work unchanged after migration.

## Lineage

| Phase | Maintainer | Versions | Notes |
|---|---|---|---|
| Original | [@nervetattoo](https://github.com/nervetattoo) (Raymond Julin) | 0.x – 2.5.0 | Stopped active maintenance ~2022; removed from HACS Sep 2025 |
| Modernization | [@Wheemer](https://github.com/Wheemer) | 3.0.0 – 3.0.26+ | Lit 3.x migration, HA 2025/2026 compatibility fixes |
| This fork | [Ava-AgentOne](https://github.com/Ava-AgentOne) | 3.1.0+ | Personal fork; tracks Wheemer with own release cadence |

## Why a fork

This is a personal mirror under [Ava-AgentOne](https://github.com/Ava-AgentOne) for stability and self-hosted CI/CD. If you want the most up-to-date upstream code with no migration friction, use [Wheemer's repo directly](https://github.com/Wheemer/simple-thermostat) — they ship patches frequently. This fork follows upstream but on its own release cadence.

## Installation

### Via HACS (recommended)

1. **Remove any previous `simple-thermostat` install** from HACS first (the original `nervetattoo` version was removed from HACS in Sep 2025 and will not work on HA 2025.x or later).
2. In HACS, open the kebab menu (⋮) → **Custom repositories**.
3. Add `https://github.com/Ava-AgentOne/simple-thermostat-card` with category **Dashboard** *(NOT Integration — that's the most common install error)*.
4. Search for "Simple Thermostat (Ava-AgentOne)" in HACS Frontend and install.
5. **Hard-refresh your browser** (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear the old cached bundle. This step is critical — without it, the old broken card script stays in the cache and you'll think nothing changed.
6. Existing `type: custom:simple-thermostat` cards keep working — no YAML changes needed.

### Manual install

1. Download `simple-thermostat.js` from the [latest release](https://github.com/Ava-AgentOne/simple-thermostat-card/releases/latest).
2. Place it in your HA `config/www/` directory.
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
entity: climate.living_room
```

For the full configuration reference (all options, examples, CSS variables), see [Wheemer's README](https://github.com/Wheemer/simple-thermostat#configuration) — the configuration surface is identical to upstream.

## Compatibility

- **Home Assistant**: 2024.1.0 minimum. Tested on 2026.5.x.
- **HACS**: 2.0+
- **Browsers**: Modern Chromium / Firefox / Safari (including iOS 18+)

## Building from source

```bash
npm install --legacy-peer-deps
npm run build
# Output: dist/simple-thermostat.js
```

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for the dev workflow.

## License

MIT — same as upstream. See [LICENSE](LICENSE).

## Credits

- **Raymond Julin / [@nervetattoo](https://github.com/nervetattoo)** — original author
- **[@Wheemer](https://github.com/Wheemer)** — Lit 3 modernization, HA 2025/2026 compatibility
- **[@nickdos](https://github.com/nickdos)** — interim maintainer who bridged the gap and pointed users to Wheemer
- **Ava-AgentOne** — this fork
