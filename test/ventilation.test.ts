import { describe, expect, it } from 'vitest';
import { nativeFan, normalizeStatus, temperatureC, exchangerRecovery, telemetryValue } from '../src/ventilation';
const entity = (state: string, attributes: Record<string, unknown> = {}) => ({entity_id:'sensor.test',state,attributes});
describe('native ventilation', () => {
  it('normalizes native fan percentages without requiring climate', () => {
    expect(nativeFan(entity('on',{percentage:50,percentage_step:25,supported_features:1}))).toMatchObject({running:true, percentage:50});
    expect(nativeFan(entity('unavailable',{percentage:50})).available).toBe(false);
    for (const percentage of [undefined,null,'',-1,101]) expect(nativeFan(entity('on',{percentage})).percentage).toBeUndefined();
  });
  it('requires explicit numeric status semantics', () => {
    expect(normalizeStatus(entity('40'), 'positive')).toBe('on');
    expect(normalizeStatus(entity('0'),'nonpositive')).toBe('on');
    expect(normalizeStatus(entity('12'),'binary')).toBeUndefined();
    expect(normalizeStatus(entity('unavailable'),'positive')).toBeUndefined();
  });
  it('converts units and rejects malformed/nonfinite temperatures', () => {
    expect(temperatureC(entity('68',{unit_of_measurement:'°F'}))).toBe(20);
    expect(temperatureC(entity('293.15',{unit_of_measurement:'K'}))).toBeCloseTo(20);
    expect(temperatureC(entity('12bad',{unit_of_measurement:'°C'}))).toBeUndefined();
    expect(temperatureC(entity('Infinity',{unit_of_measurement:'°C'}))).toBeUndefined();
  });
  it('calculates heating and cooling exchanger effectiveness without clamping misleading values', () => {
    expect(exchangerRecovery(0,20,16,'off')).toBe(80);
    expect(exchangerRecovery(30,20,22,'off')).toBe(80);
    expect(exchangerRecovery(0,20,25,'off')).toBeNull();
    expect(exchangerRecovery(0,20,16,'on')).toBeNull();
    expect(exchangerRecovery(0,20,16,undefined)).toBeNull();
    expect(exchangerRecovery(20,20.2,20.1,'off')).toBeNull();
  });
  it('keeps airflow and fan duty units distinct', () => {
    expect(telemetryValue(entity('210',{unit_of_measurement:'m³/h'}))).toEqual({value:210,unit:'m³/h'});
    expect(telemetryValue(entity('unknown'))).toBeUndefined();
  });
});
