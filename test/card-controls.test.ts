// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { MqttComfoairCard } from '../src/comfoair-card';
import { MqttComfoairControls } from '../src/comfoair-controls';
import '../src/comfoair-card';

afterEach(() => { document.body.replaceChildren(); });

describe('controls in the main card', () => {
  it('shows a service error and re-enables the controls for retry', async () => {
    const card = document.createElement('mqttcomfoair-card') as MqttComfoairCard;
    const call = vi.fn().mockRejectedValue(new Error('offline'));
    card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: 'en' });
    card.hass = { language: 'en', states: { 'climate.test': { entity_id: 'climate.test', state: 'fan_only', attributes: { supported_features: 8, fan_modes: ['low'], fan_mode: 'low' } } }, callService: call } as unknown as HomeAssistant;
    document.body.append(card); await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Speed 1"]')!.click();
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('[role="alert"]')?.textContent).toContain('Could not update'));
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Speed 1"]')!.disabled).toBe(false);
  });
  it('hides temperature and fan controls when the climate entity cannot support them', async () => {
    const card = document.createElement('mqttcomfoair-card') as MqttComfoairCard;
    const call = vi.fn();
    card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test' });
    card.hass = { language: 'en', states: { 'climate.test': { entity_id: 'climate.test', state: 'fan_only', attributes: { supported_features: 0 } } }, callService: call } as unknown as HomeAssistant;
    document.body.append(card); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('.setpc')).toBeNull();
    expect(card.shadowRoot!.querySelector('.fanrow')).toBeNull();
    expect(call).not.toHaveBeenCalled();
  });
  it('shows only advertised fan modes and never sends unsupported ones', async () => {
    const card = document.createElement('mqttcomfoair-card') as MqttComfoairCard;
    const call = vi.fn();
    card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: 'en' });
    card.hass = { language: 'en', states: { 'climate.test': { entity_id: 'climate.test', state: 'fan_only', attributes: { supported_features: 8, fan_modes: ['low', 'high'], fan_mode: 'low' } } }, callService: call } as unknown as HomeAssistant;
    document.body.append(card); await card.updateComplete;
    expect(card.shadowRoot!.querySelectorAll('.fanrow button')).toHaveLength(2);
    expect(card.shadowRoot!.querySelector('button[aria-label="Off"]')).toBeNull();
    card.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Speed 3"]')!.click();
    expect(call).toHaveBeenCalledWith('climate', 'set_fan_mode', { entity_id: 'climate.test', fan_mode: 'high' });
  });
  it('renders the mapped controls with the card language and refreshes on control-only state changes', async () => {
    const call = vi.fn().mockResolvedValue(undefined);
    const card = document.createElement('mqttcomfoair-card') as MqttComfoairCard;
    const states = {
      'climate.test': { entity_id: 'climate.test', state: 'fan_only', attributes: { fan_mode: 'low' } },
      'switch.boost': { entity_id: 'switch.boost', state: 'off', attributes: {} },
    };
    card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: 'pl', boost_control: 'switch.boost' });
    card.hass = { language: 'en', states, callService: call } as unknown as HomeAssistant;
    document.body.append(card); await card.updateComplete;
    const controls = card.shadowRoot!.querySelector('mqttcomfoair-controls') as MqttComfoairControls;
    await controls.updateComplete;
    expect(controls.shadowRoot!.textContent).toContain('Włącz przewietrzanie');
    card.hass = { ...card.hass, states: { ...card.hass.states,
      'switch.boost': { ...card.hass.states['switch.boost'], state: 'on' },
    } };
    await card.updateComplete; await controls.updateComplete;
    expect(controls.shadowRoot!.textContent).toContain('Zatrzymaj przewietrzanie');
    expect(call).not.toHaveBeenCalled();
  });
  it('keeps the existing fan service values when rendering translated buttons', async () => {
    const call = vi.fn().mockResolvedValue(undefined);
    const card = document.createElement('mqttcomfoair-card') as MqttComfoairCard;
    card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: 'pl' });
    card.hass = { language: 'en', states: { 'climate.test': {
      entity_id: 'climate.test', state: 'fan_only', attributes: { fan_mode: 'low', fan_modes: ['off', 'low', 'medium', 'high'], supported_features: 8 },
    } }, callService: call } as unknown as HomeAssistant;
    document.body.append(card); await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('button[aria-label="Bieg 3"]')!.click();
    expect(call).toHaveBeenCalledWith('climate', 'set_fan_mode', { entity_id: 'climate.test', fan_mode: 'high' });
  });
});
