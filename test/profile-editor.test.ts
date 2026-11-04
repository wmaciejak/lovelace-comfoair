// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { MqttComfoairCardEditor } from '../src/comfoair-card-editor';
import '../src/comfoair-card-editor';

afterEach(() => document.body.replaceChildren());

describe('guided setup', () => {
  it('previews mappings for the chosen device and preserves existing mappings when applied', async () => {
    const editor = document.createElement('mqttcomfoair-card-editor') as MqttComfoairCardEditor;
    editor.hass = { language: 'en', states: {
      'sensor.unit_outdoor_air_temp': { entity_id: 'sensor.unit_outdoor_air_temp', state: '5', attributes: {} },
      'sensor.unit_extract_air_temp': { entity_id: 'sensor.unit_extract_air_temp', state: '22', attributes: {} },
    }, entities: { 'sensor.unit_outdoor_air_temp': { device_id: 'esp' }, 'sensor.unit_extract_air_temp': { device_id: 'esp' } } } as unknown as HomeAssistant;
    editor.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', tempSensor1: 'sensor.existing' });
    const changed = vi.fn(); editor.addEventListener('config-changed', changed);
    document.body.append(editor); await editor.updateComplete;
    const select = editor.shadowRoot!.querySelector<HTMLSelectElement>('[data-profile]')!;
    select.value = 'esphome'; select.dispatchEvent(new Event('change')); await editor.updateComplete;
    const deviceForm = editor.shadowRoot!.querySelector('[data-profile-device]')!;
    deviceForm.dispatchEvent(new CustomEvent('value-changed', { detail: { value: { device: 'esp' } } })); await editor.updateComplete;
    expect(editor.shadowRoot!.textContent).toContain('sensor.unit_extract_air_temp');
    expect(changed).not.toHaveBeenCalled();
    editor.shadowRoot!.querySelector<HTMLButtonElement>('[data-apply-profile]')!.click();
    const config = changed.mock.calls[0][0].detail.config;
    expect(config.tempSensor1).toBe('sensor.existing');
    expect(config.tempSensor3).toBe('sensor.unit_extract_air_temp');
  });
});
