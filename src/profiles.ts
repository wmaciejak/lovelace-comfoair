import { ComfoairCardConfig, DetectHass } from './types';

export type IntegrationProfile = 'mqtt' | 'esphome';
type Mapping = { field: keyof ComfoairCardConfig; domain: string; suffix: string | string[] };

const MQTT: Mapping[] = [
  { field: 'tempSensor1', domain: 'sensor', suffix: 'outside_temperature' },
  { field: 'tempSensor2', domain: 'sensor', suffix: 'exhaust_temperature' },
  { field: 'tempSensor3', domain: 'sensor', suffix: 'return_temperature' },
  { field: 'tempSensor4', domain: 'sensor', suffix: 'supply_temperature' },
  { field: 'fan_speed_supply', domain: 'sensor', suffix: 'supply_fan_speed' },
  { field: 'fan_speed_exhaust', domain: 'sensor', suffix: 'exhaust_fan_speed' },
  { field: 'supply_air_level', domain: 'sensor', suffix: 'supply_air_level' },
  { field: 'return_air_level', domain: 'sensor', suffix: 'return_air_level' },
  { field: 'filterstatus', domain: 'binary_sensor', suffix: 'filter_status' },
  { field: 'bypass_valve', domain: 'binary_sensor', suffix: 'bypass_valve' },
  { field: 'preheat', domain: 'binary_sensor', suffix: 'preheating_status' },
  { field: 'summer_mode', domain: 'binary_sensor', suffix: 'summer_mode' },
  { field: 'airflow_control', domain: 'select', suffix: 'fancontrol' },
  { field: 'filter_reset', domain: 'button', suffix: 'reset_filter' },
  { field: 'filter_interval', domain: 'number', suffix: 'filter_weeks' },
];
const ESPHOME: Mapping[] = [
  { field: 'bypass_valve', domain: 'sensor', suffix: 'bypass_state' },
  { field: 'filterstatus', domain: 'sensor', suffix: 'days_remaining_filter' },
  { field: 'airflow_supply', domain: 'sensor', suffix: ['supply_air_flow','supply_fan_flow'] },
  { field: 'airflow_extract', domain: 'sensor', suffix: ['exhaust_air_flow','exhaust_fan_flow'] },
  { field: 'humidity_supply', domain: 'sensor', suffix: 'supply_air_humidity' },
  { field: 'humidity_extract', domain: 'sensor', suffix: 'extract_air_humidity' },
  { field: 'power', domain: 'sensor', suffix: ['power_usage','power_consumption_current'] },
  { field: 'energy', domain: 'sensor', suffix: ['power_total','energy_consumption_since_start'] },
  { field: 'preheater_power', domain: 'sensor', suffix: 'preheater_power_usage' },

  { field: 'tempSensor1', domain: 'sensor', suffix: 'outdoor_air_temp' },
  { field: 'tempSensor2', domain: 'sensor', suffix: 'exhaust_air_temp' },
  { field: 'tempSensor3', domain: 'sensor', suffix: 'extract_air_temp' },
  { field: 'tempSensor4', domain: 'sensor', suffix: 'post_heater_temp_after' },
  { field: 'fan_speed_supply', domain: 'sensor', suffix: 'supply_fan_speed' },
  { field: 'fan_speed_exhaust', domain: 'sensor', suffix: 'exhaust_fan_speed' },
  { field: 'supply_air_level', domain: 'sensor', suffix: 'supply_fan_duty' },
  { field: 'return_air_level', domain: 'sensor', suffix: 'exhaust_fan_duty' },
];

export interface ProfileDetection {
  mapped: Partial<ComfoairCardConfig>;
  missing: (keyof ComfoairCardConfig)[];
  ambiguous: (keyof ComfoairCardConfig)[];
}

/** Exact role suffixes and a user-selected HA device prevent cross-device guesses. */
export function detectProfile(hass: DetectHass, profile: IntegrationProfile, deviceId: string): ProfileDetection {
  const result: ProfileDetection = { mapped: {}, missing: [], ambiguous: [] };
  for (const rule of profile === 'mqtt' ? MQTT : ESPHOME) {
    const ids = Object.keys(hass.states).filter(id =>
      !!deviceId && hass.entities?.[id]?.device_id === deviceId &&
      id.startsWith(rule.domain + '.') && (Array.isArray(rule.suffix)?rule.suffix:[rule.suffix]).some(suffix=>id.endsWith('_'+suffix)||id===rule.domain+'.'+suffix),
    );
    if (ids.length === 1) (result.mapped as Record<string, string>)[rule.field as string] = ids[0];
    else (ids.length ? result.ambiguous : result.missing).push(rule.field);
  }
  if (profile === 'esphome') {
    if (result.mapped.bypass_valve) result.mapped.bypass_mode='positive';
    if (result.mapped.filterstatus) result.mapped.filter_mode='nonpositive';
  }
  return result;
}
