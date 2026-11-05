import { CONTROL_DEFINITIONS } from './controls';

export const CARD_VERSION = '0.18.2';
export const CARD_TYPE = 'mqttcomfoair-card';
export const EDITOR_TYPE = 'mqttcomfoair-card-editor';

export type FanMode = 'off' | 'low' | 'medium' | 'high';

export interface FanButton {
  mode: FanMode;
  icon: string;
}

export const FAN_BUTTONS: FanButton[] = [
  { mode: 'off', icon: 'mdi:fan-off' },
  { mode: 'low', icon: 'mdi:fan-speed-1' },
  { mode: 'medium', icon: 'mdi:fan-speed-2' },
  { mode: 'high', icon: 'mdi:fan-speed-3' },
];

/** Config-Schlüssel, die auf HA-Entities zeigen (eine Quelle für shouldUpdate + Editor-Reset). */
export const ENTITY_FIELDS: readonly string[] = [
  'exchanger_inlet', 'exchanger_outlet', 'airflow_supply', 'airflow_extract', 'humidity_supply', 'humidity_extract', 'power', 'energy', 'preheater_power', 'boost_timer', 'manual_override',
  'filter_days_remaining','filter_last_service','controller_source','controller_next_transition','fault_entity','fault_acknowledged','energy_day','energy_previous_day','energy_month','energy_previous_month','energy_tariff','airflow_sustained_fault','summer_indoor_temperature','summer_outdoor_temperature','summer_indoor_humidity','summer_outdoor_humidity','summer_bypass_control','schedule_entity','schedule_next_transition','manual_override_until',
  'filter_service_script','fault_ack_script','schedule_override_script','boost_script','boost_cancel_script','preset_auto_script','preset_home_script','preset_away_script','preset_quiet_script',
  'entity', 'tempSensor1', 'tempSensor2', 'tempSensor3', 'tempSensor4',
  'filterstatus', 'bypass_valve', 'summer_mode', 'preheat',
  'fan_speed_supply', 'fan_speed_exhaust', 'return_air_level', 'supply_air_level',
  ...CONTROL_DEFINITIONS.map(item => item.key),
];
