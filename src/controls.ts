import { ComfoairCardConfig, DetectHass, HassEntityLike } from './types';
import { localize } from './localize';

export const CONTROL_DEFINITIONS = [
  { key: 'airflow_control', kind: 'select', domains: ['select', 'input_select'], keywords: ['fancontrol', 'fan_control', 'airflow'] },
  { key: 'operating_mode_control', kind: 'select', domains: ['select', 'input_select'], keywords: ['operating_mode', 'operation_mode', 'auto_manual'] },
  { key: 'boost_duration', kind: 'number', domains: ['number', 'input_number'], keywords: ['boost_duration', 'boost_time'] },
  { key: 'boost_control', kind: 'switch', domains: ['switch', 'input_boolean'], keywords: ['boost'] },
  { key: 'filter_interval', kind: 'number', domains: ['number', 'input_number'], keywords: ['filter_weeks', 'filter_interval'] },
  { key: 'filter_reset', kind: 'button', domains: ['button', 'input_button'], keywords: ['reset_filter', 'filter_reset'] },
] as const;

export type ControlKey = typeof CONTROL_DEFINITIONS[number]['key'];
export interface ControlAction {
  domain: string;
  service: string;
  data: Record<string, string | number>;
}

export function controlEntity(hass: DetectHass, config: ComfoairCardConfig, key: ControlKey): HassEntityLike | undefined {
  const id = config[key];
  const definition = CONTROL_DEFINITIONS.find(item => item.key === key)!;
  if (config.show_controls === false || !id || !(definition.domains as readonly string[]).includes(id.split('.')[0])) return undefined;
  return hass.states[id];
}

export function controlAvailable(entity: HassEntityLike | undefined, key: ControlKey): boolean {
  if (!entity || entity.state === 'unavailable') return false;
  // HA buttons are unknown until their first press; this is a valid actionable state.
  if (key === 'filter_reset') return true;
  if (!entity.state || entity.state === 'unknown') return false;
  if (key === 'boost_control') return ['on', 'off'].includes(entity.state);
  return true;
}

export function controlOptions(entity: HassEntityLike): string[] {
  const options = entity.attributes.options;
  return Array.isArray(options) ? options.filter((value): value is string => typeof value === 'string') : [];
}

/** Build only standard HA entity actions; never infer protocol commands or MQTT topics. */
export function controlAction(
  hass: DetectHass, config: ComfoairCardConfig, key: ControlKey, value?: unknown,
): ControlAction | undefined {
  const entity = controlEntity(hass, config, key);
  if (!controlAvailable(entity, key)) return undefined;
  const id = config[key]!;
  const domain = id.split('.')[0];
  const kind = CONTROL_DEFINITIONS.find(item => item.key === key)!.kind;
  if (kind === 'select') {
    if (typeof value !== 'string' || !controlOptions(entity!).includes(value)) return undefined;
    return { domain, service: 'select_option', data: { entity_id: id, option: value } };
  }
  if (kind === 'switch') {
    if (typeof value !== 'boolean') return undefined;
    return { domain, service: value ? 'turn_on' : 'turn_off', data: { entity_id: id } };
  }
  if (kind === 'button') return { domain, service: 'press', data: { entity_id: id } };
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return undefined;
  const number = Number(value);
  const { min, max, step } = entity!.attributes;
  if (typeof min !== 'number' || typeof max !== 'number' || typeof step !== 'number' ||
      !Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0 ||
      !Number.isFinite(number) || number < min || number > max) return undefined;
  const steps = (number - min) / step;
  if (Math.abs(steps - Math.round(steps)) > 1e-6) return undefined;
  return { domain, service: 'set_value', data: { entity_id: id, value: number } };
}

export function controlOptionLabel(option: string, language?: string): string {
  const keys: Record<string, string> = {
    both: 'airflow_both', in: 'airflow_supply', supply: 'airflow_supply', supply_only: 'airflow_supply',
    out: 'airflow_extract', extract: 'airflow_extract', exhaust: 'airflow_extract', extract_only: 'airflow_extract',
    auto: 'mode_auto', automatic: 'mode_auto', manual: 'mode_manual', off: 'off',
  };
  const key = keys[option.toLowerCase()];
  return key ? localize(key, language) : option;
}

/** Only unambiguous entities on the selected device are mapped automatically. */
export function detectControlEntities(hass: DetectHass, climateEntityId: string): Partial<ComfoairCardConfig> {
  const device = hass.entities?.[climateEntityId]?.device_id;
  if (!device) return {};
  const candidates = Object.keys(hass.states).filter(id => hass.entities?.[id]?.device_id === device);
  const result: Partial<ComfoairCardConfig> = {};
  for (const definition of CONTROL_DEFINITIONS) {
    const matches = candidates.filter(id => {
      if (!(definition.domains as readonly string[]).includes(id.split('.')[0])) return false;
      const text = `${id} ${String(hass.states[id].attributes.friendly_name ?? '')}`.toLowerCase().replace(/[ -]+/g, '_');
      return definition.keywords.some(keyword => text.includes(keyword));
    });
    if (matches.length === 1) result[definition.key] = matches[0];
  }
  return result;
}
