import { describe, expect, it } from 'vitest';
import { controlAction, controlOptionLabel, detectControlEntities } from '../src/controls';
import { ComfoairCardConfig, DetectHass, HassEntityLike } from '../src/types';

const entity = (id: string, state: string, attributes: Record<string, unknown> = {}): HassEntityLike =>
  ({ entity_id: id, state, attributes });
const config: ComfoairCardConfig = {
  type: 'custom:mqttcomfoair-card', entity: 'climate.ca350_climate',
  airflow_control: 'select.ca350_fancontrol', boost_control: 'switch.ca350_boost',
  boost_duration: 'number.ca350_boost_duration', filter_reset: 'button.ca350_reset_filter',
  filter_interval: 'number.ca350_filter_weeks', operating_mode_control: 'select.ca350_operating_mode',
};
const hass: DetectHass = { states: {
  'select.ca350_fancontrol': entity('select.ca350_fancontrol', 'Both', { options: ['off', 'In', 'Out', 'Both'] }),
  'switch.ca350_boost': entity('switch.ca350_boost', 'off'),
  'number.ca350_boost_duration': entity('number.ca350_boost_duration', '10', { min: 5, max: 60, step: 5 }),
  'button.ca350_reset_filter': entity('button.ca350_reset_filter', 'unknown'),
  'number.ca350_filter_weeks': entity('number.ca350_filter_weeks', '12', { min: 1, max: 26, step: 1 }),
  'select.ca350_operating_mode': entity('select.ca350_operating_mode', 'auto', { options: ['auto', 'manual'] }),
} };

describe('extended control service calls', () => {
  it('keeps raw select options while translating their display labels', () => {
    expect(controlOptionLabel('Both', 'pl')).toBe('Nawiew i wywiew');
    expect(controlOptionLabel('In', 'en')).toBe('Supply only');
    expect(controlOptionLabel('Out', 'en')).toBe('Extract only');
    expect(controlOptionLabel('custom', 'pl')).toBe('custom');
    expect(controlAction(hass, config, 'airflow_control', 'In')).toEqual({
      domain: 'select', service: 'select_option', data: { entity_id: 'select.ca350_fancontrol', option: 'In' },
    });
    expect(controlAction(hass, config, 'operating_mode_control', 'manual')?.data.option).toBe('manual');
  });
  it('rejects options not advertised by the entity', () => {
    expect(controlAction(hass, config, 'airflow_control', 'supply_only')).toBeUndefined();
    expect(controlAction(hass, config, 'operating_mode_control', 'fan_only')).toBeUndefined();
  });
  it('switches boost using explicit on and off actions', () => {
    expect(controlAction(hass, config, 'boost_control', true)).toEqual({
      domain: 'switch', service: 'turn_on', data: { entity_id: 'switch.ca350_boost' },
    });
    expect(controlAction(hass, config, 'boost_control', false)?.service).toBe('turn_off');
    expect(controlAction(hass, config, 'boost_control', 'toggle')).toBeUndefined();
  });
  it('resets a never-pressed button whose state is unknown', () => {
    expect(controlAction(hass, config, 'filter_reset')).toEqual({
      domain: 'button', service: 'press', data: { entity_id: 'button.ca350_reset_filter' },
    });
  });
  it('validates numeric limits, step and empty inputs', () => {
    expect(controlAction(hass, config, 'boost_duration', '30')?.data.value).toBe(30);
    expect(controlAction(hass, config, 'filter_interval', 26)?.data.value).toBe(26);
    for (const value of ['', ' ', 0, 27, 1.5, NaN, Infinity]) {
      expect(controlAction(hass, config, 'filter_interval', value)).toBeUndefined();
    }
    expect(controlAction(hass, config, 'boost_duration', 12)).toBeUndefined();
  });
  it('supports HA helpers without changing the service domain', () => {
    const cfg = { ...config, boost_control: 'input_boolean.boost', filter_interval: 'input_number.weeks',
      airflow_control: 'input_select.airflow', filter_reset: 'input_button.reset' };
    const h: DetectHass = { states: {
      'input_boolean.boost': entity('input_boolean.boost', 'off'),
      'input_number.weeks': entity('input_number.weeks', '5', { min: 1, max: 26, step: 1 }),
      'input_select.airflow': entity('input_select.airflow', 'Both', { options: ['In', 'Both'] }),
      'input_button.reset': entity('input_button.reset', 'unknown'),
    } };
    expect(controlAction(h, cfg, 'boost_control', true)?.domain).toBe('input_boolean');
    expect(controlAction(h, cfg, 'filter_interval', 10)?.domain).toBe('input_number');
    expect(controlAction(h, cfg, 'airflow_control', 'In')?.domain).toBe('input_select');
    expect(controlAction(h, cfg, 'filter_reset')?.domain).toBe('input_button');
  });
  it('does not send actions to missing, unavailable or wrong-domain entities', () => {
    expect(controlAction(hass, { ...config, boost_control: 'switch.missing' }, 'boost_control', true)).toBeUndefined();
    expect(controlAction(hass, { ...config, boost_control: 'button.ca350_reset_filter' }, 'boost_control', true)).toBeUndefined();
    const h = { states: { ...hass.states, 'switch.ca350_boost': entity('switch.ca350_boost', 'unavailable') } };
    expect(controlAction(h, config, 'boost_control', true)).toBeUndefined();
    expect(controlAction(hass, { ...config, show_controls: false }, 'boost_control', true)).toBeUndefined();
  });
});

describe('control entity detection', () => {
  it('finds documented CA350 entities using the device registry', () => {
    const h = { ...hass, entities: Object.fromEntries([config.entity, ...Object.keys(hass.states)].map(id => [id, { device_id: 'ca350' }])) };
    expect(detectControlEntities(h, config.entity)).toMatchObject({
      airflow_control: 'select.ca350_fancontrol', filter_reset: 'button.ca350_reset_filter',
      filter_interval: 'number.ca350_filter_weeks', boost_control: 'switch.ca350_boost',
      boost_duration: 'number.ca350_boost_duration', operating_mode_control: 'select.ca350_operating_mode',
    });
  });
  it('leaves missing or ambiguous controls for manual mapping', () => {
    expect(detectControlEntities(hass, config.entity)).toEqual({});
    const h: DetectHass = { states: { 'switch.boost1': entity('switch.boost1', 'off'), 'switch.boost2': entity('switch.boost2', 'off') },
      entities: { [config.entity]: { device_id: 'x' }, 'switch.boost1': { device_id: 'x' }, 'switch.boost2': { device_id: 'x' } } };
    expect(detectControlEntities(h, config.entity).boost_control).toBeUndefined();
    h.entities!['switch.boost2'].device_id = 'other';
    expect(detectControlEntities(h, config.entity).boost_control).toBe('switch.boost1');
  });
});
