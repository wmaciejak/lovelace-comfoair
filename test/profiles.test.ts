import { describe, expect, it } from 'vitest';
import { detectProfile } from '../src/profiles';
import { DetectHass } from '../src/types';

describe('integration profiles', () => {
  it('maps ESPHome sensors on the chosen device without touching unrelated devices', () => {
    const states = {
      'sensor.reku_outdoor_air_temp': { entity_id: 'sensor.reku_outdoor_air_temp', state: '5', attributes: {} },
      'sensor.reku_extract_air_temp': { entity_id: 'sensor.reku_extract_air_temp', state: '20', attributes: {} },
      'sensor.other_supply_fan_speed': { entity_id: 'sensor.other_supply_fan_speed', state: '100', attributes: {} },
    };
    const hass: DetectHass = { states, entities: {
      'sensor.reku_outdoor_air_temp': { device_id: 'esp' }, 'sensor.reku_extract_air_temp': { device_id: 'esp' },
      'sensor.other_supply_fan_speed': { device_id: 'other' },
    } };
    const result = detectProfile(hass, 'esphome', 'esp');
    expect(result.mapped.tempSensor1).toBe('sensor.reku_outdoor_air_temp');
    expect(result.mapped.tempSensor3).toBe('sensor.reku_extract_air_temp');
    expect(result.mapped.fan_speed_supply).toBeUndefined();
    expect(result.missing).toContain('fan_speed_supply');
  });
  it('leaves ambiguous matches unresolved', () => {
    const hass: DetectHass = { states: {
      'sensor.one_outdoor_air_temp': { entity_id: 'sensor.one_outdoor_air_temp', state: '2', attributes: {} },
      'sensor.two_outdoor_air_temp': { entity_id: 'sensor.two_outdoor_air_temp', state: '3', attributes: {} },
    }, entities: { 'sensor.one_outdoor_air_temp': { device_id: 'x' }, 'sensor.two_outdoor_air_temp': { device_id: 'x' } } };
    const result = detectProfile(hass, 'esphome', 'x');
    expect(result.mapped.tempSensor1).toBeUndefined();
    expect(result.ambiguous).toContain('tempSensor1');
  });
  it('maps CA350 MQTT controls using their documented names', () => {
    const hass: DetectHass = { states: {
      'select.ca350_fancontrol': { entity_id: 'select.ca350_fancontrol', state: 'Both', attributes: {} },
      'button.ca350_reset_filter': { entity_id: 'button.ca350_reset_filter', state: 'unknown', attributes: {} },
      'number.ca350_filter_weeks': { entity_id: 'number.ca350_filter_weeks', state: '10', attributes: {} },
    }, entities: { 'select.ca350_fancontrol': { device_id: 'x' }, 'button.ca350_reset_filter': { device_id: 'x' }, 'number.ca350_filter_weeks': { device_id: 'x' } } };
    expect(detectProfile(hass, 'mqtt', 'x').mapped).toMatchObject({ airflow_control: 'select.ca350_fancontrol', filter_reset: 'button.ca350_reset_filter', filter_interval: 'number.ca350_filter_weeks' });
  });
});
