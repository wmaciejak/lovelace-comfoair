import { LovelaceCardConfig } from 'custom-card-helpers';

export interface ComfoairCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  layout?: 'full' | 'compact';
  telemetry_order?: string[];
  status_chips?: string[];
  bypass_mode?: 'binary' | 'positive';
  filter_mode?: 'binary' | 'nonpositive';
  exchanger_inlet?: string;
  exchanger_outlet?: string;
  recovery_mode?: 'temperature' | 'exchanger' | 'hidden';
  airflow_supply?: string;
  airflow_extract?: string;
  humidity_supply?: string;
  humidity_extract?: string;
  power?: string;
  energy?: string;
  preheater_power?: string;
  history_entities?: string[];
  history_hours?: 1 | 24 | 168;
  boost_script?: string;
  boost_cancel_script?: string;
  boost_timer?: string;
  preset_auto_script?: string;
  preset_home_script?: string;
  preset_away_script?: string;
  preset_quiet_script?: string;
  manual_override?: string;
  language?: 'auto' | 'en' | 'pl' | 'de' | 'nl';
  entity: string;
  tempSensor1?: string; // Außentemperatur
  tempSensor2?: string; // Fortlufttemperatur
  tempSensor3?: string; // Rücklufttemperatur
  tempSensor4?: string; // Zulufttemperatur
  filterstatus?: string;
  bypass_valve?: string;
  summer_mode?: string;
  preheat?: string;
  fan_speed_supply?: string;
  fan_speed_exhaust?: string;
  return_air_level?: string;
  supply_air_level?: string;
  animation?: 'animated' | 'static';
  animation_speed_source?: 'fixed' | 'level'; // festes Tempo oder nach Luftmengen-%
  animation_speed?: number; // Prozent (10–200), nur bei animation_speed_source = 'fixed'
  color_scale?: 'auto' | 'fixed';
  temp_min?: number; // °C, untere Grenze der festen Farbskala (Default -10)
  temp_max?: number; // °C, obere Grenze der festen Farbskala (Default 30)
  show_legend?: boolean; // kleine Temperatur-Farbskala unten einblenden
  show_controls?: boolean;
  airflow_control?: string;
  operating_mode_control?: string;
  boost_control?: string;
  boost_duration?: string;
  filter_reset?: string;
  filter_interval?: string;
}

/** Schlank typisiertes hass-Objekt, ausreichend für reine Helper (testbar). */
export interface HassEntityLike {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface DetectHass {
  states: Record<string, HassEntityLike>;
  entities?: Record<string, { device_id?: string | null }>;
}
