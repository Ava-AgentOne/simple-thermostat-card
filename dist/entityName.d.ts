/**
 * The name to show for an entity when the card config doesn't set one.
 *
 * Home Assistant 2026.4 added hass.formatEntityName, the helper the built-in
 * cards use to build names from the entity and device registries (for example
 * "Power meter Off-peak consumption"), and 2026.11 switched dashboards to those
 * names. Older versions only have the friendly_name attribute, which Home
 * Assistant is deprecating.
 */
export default function entityName(hass: any, stateObj: any): string | undefined;
