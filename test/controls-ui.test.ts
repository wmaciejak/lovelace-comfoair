// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { MqttComfoairControls } from '../src/comfoair-controls';
import '../src/comfoair-controls';

afterEach(() => { document.body.replaceChildren(); });

async function setup(fail = false): Promise<{ card: MqttComfoairControls; call: ReturnType<typeof vi.fn> }> {
  const card = document.createElement('mqttcomfoair-controls') as MqttComfoairControls;
  const call = vi.fn().mockImplementation(() => fail ? Promise.reject(new Error('Disconnected')) : Promise.resolve());
  card.hass = { states: {
    'select.direction': { entity_id: 'select.direction', state: 'Both', attributes: { options: ['Both', 'In', 'Out'] } },
    'switch.boost': { entity_id: 'switch.boost', state: 'off', attributes: {} },
    'number.duration': { entity_id: 'number.duration', state: '10', attributes: { min: 5, max: 60, step: 5, unit_of_measurement: 'min' } },
    'button.reset': { entity_id: 'button.reset', state: 'unknown', attributes: {} },
  }, callService: call } as unknown as HomeAssistant;
  card.config = { type: 'custom:mqttcomfoair-card', entity: 'climate.test', airflow_control: 'select.direction',
    boost_control: 'switch.boost', boost_duration: 'number.duration', filter_reset: 'button.reset' };
  card.language = 'en';
  document.body.append(card);
  await card.updateComplete;
  return { card, call };
}

describe('extended controls UI', () => {
  it('blocks concurrent actions while a service request is pending', async () => {
    const { card, call } = await setup();
    let finish!: () => void;
    call.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.click();
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="filter_reset"]')!.disabled).toBe(true);
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.click();
    expect(call).toHaveBeenCalledTimes(1);
    finish();
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.disabled).toBe(false));
  });
  it('sends raw airflow options and the boost action only after user input', async () => {
    const { card, call } = await setup();
    expect(call).not.toHaveBeenCalled();
    const select = card.shadowRoot!.querySelector('select')!;
    select.value = 'In'; select.dispatchEvent(new Event('change'));
    await card.updateComplete;
    expect(call).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.direction', option: 'In' });
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.disabled).toBe(false));
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.click();
    await card.updateComplete;
    expect(call).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.boost' });
  });
  it('requires confirmation before resetting filters and allows cancellation', async () => {
    const { card, call } = await setup();
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="filter_reset"]')!.click();
    await card.updateComplete;
    expect(call).not.toHaveBeenCalled();
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-cancel-reset]')!.click();
    await card.updateComplete;
    expect(call).not.toHaveBeenCalled();
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="filter_reset"]')!.click();
    await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-confirm-reset]')!.click();
    await card.updateComplete;
    expect(call).toHaveBeenCalledWith('button', 'press', { entity_id: 'button.reset' });
  });
  it('validates and applies runtime values using the entity unit and limits', async () => {
    const { card, call } = await setup();
    const input = card.shadowRoot!.querySelector<HTMLInputElement>('input[type="number"]')!;
    input.value = '12'; input.dispatchEvent(new Event('input'));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-apply="boost_duration"]')!.disabled).toBe(true);
    input.value = '30'; input.dispatchEvent(new Event('input'));
    await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-apply="boost_duration"]')!.click();
    await card.updateComplete;
    expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: 'number.duration', value: 30 });
    expect(card.shadowRoot!.textContent).toContain('min');
  });
  it('shows failures without leaving controls busy', async () => {
    const { card, call } = await setup(true);
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.click();
    await card.updateComplete;
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('[role="alert"]')?.textContent).toContain('Could not update'));
    expect(call).toHaveBeenCalledTimes(1);
    expect(card.shadowRoot!.querySelector('[role="alert"]')?.textContent).toContain('Could not update');
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.disabled).toBe(false);
  });
  it('hides unconfigured controls and disables missing entities', async () => {
    const { card } = await setup();
    expect(card.shadowRoot!.querySelector('[data-apply="filter_interval"]')).toBeNull();
    card.config = { ...card.config, boost_control: 'switch.missing' };
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-control="boost_control"]')!.disabled).toBe(true);
    card.config = { ...card.config, show_controls: false };
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('section')).toBeNull();
  });
});
