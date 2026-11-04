// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { MqttComfoairHistory, historyEntityIds, historyPoints } from '../src/comfoair-history';
import '../src/comfoair-history';

afterEach(() => document.body.replaceChildren());

function setup(call = vi.fn().mockResolvedValue([])) {
  const card = document.createElement('mqttcomfoair-history') as MqttComfoairHistory;
  card.entities = ['sensor.temperature'];
  card.hass = { states: {}, callApi: call } as unknown as HomeAssistant;
  document.body.append(card);
  return { card, call };
}

describe('bounded history', () => {
  it('deduplicates valid entity IDs and caps requests to eight entities', () => {
    expect(historyEntityIds(['sensor.a', 'sensor.a', 'bad value', ...Array.from({ length: 20 }, (_, i) => `sensor.n${i}`)])).toHaveLength(8);
  });
  it('retains unavailable gaps and rejects nonfinite and malformed numeric data', () => {
    const rows = ['12', 'unavailable', 'Infinity', '12oops', '15'].map((state, i) => ({ state, last_changed: new Date(i * 1000).toISOString() }));
    expect(historyPoints(rows).map(point => point.value)).toEqual([12, null, null, null, 15]);
  });
  it('bounds series size while preserving a gap within each sampled bucket', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({ state: i === 501 ? 'unknown' : String(i), last_changed: new Date(i * 1000).toISOString() }));
    const points = historyPoints(rows);
    expect(points.length).toBeLessThanOrEqual(240);
    expect(points.some(point => point.value === null)).toBe(true);
  });
  it('requests bounded history once and ignores unrelated hass updates', async () => {
    const { card, call } = setup();
    card.hours = 999;
    await vi.waitFor(() => expect(call).toHaveBeenCalledTimes(1));
    expect(call.mock.calls[0][1]).toContain('filter_entity_id=sensor.temperature');
    const url = new URL('http://ha/' + call.mock.calls[0][1]);
    const start = new Date(decodeURIComponent(url.pathname.split('/').pop()!)).getTime();
    expect(new Date(url.searchParams.get('end_time')!).getTime() - start).toBe(168 * 3600000);
    card.hass = { ...card.hass, states: {} };
    await card.updateComplete;
    expect(call).toHaveBeenCalledTimes(1);
  });
  it('shows request failure and allows retry', async () => {
    const call = vi.fn().mockRejectedValueOnce(new Error('Network')).mockResolvedValue([]);
    const { card } = setup(call);
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('[role="alert"]')).not.toBeNull());
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-refresh]')!.click();
    await vi.waitFor(() => expect(call).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(card.shadowRoot!.textContent).toContain('No history'));
  });
  it('ignores responses after disconnect', async () => {
    let finish!: (value: unknown) => void;
    const { card } = setup(vi.fn().mockImplementation(() => new Promise(resolve => { finish = resolve; })));
    await card.updateComplete;
    card.remove();
    finish([[{ entity_id: 'sensor.temperature', state: '99', last_changed: new Date().toISOString() }]]);
    await Promise.resolve(); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('svg')).toBeNull();
  });
  it('does not replace the new time range with an obsolete response', async () => {
    const finishes: ((value: unknown) => void)[] = [];
    const { card } = setup(vi.fn().mockImplementation(() => new Promise(resolve => finishes.push(resolve))));
    await vi.waitFor(() => expect(finishes).toHaveLength(1));
    card.hours = 1;
    await vi.waitFor(() => expect(finishes).toHaveLength(2));
    finishes[1]([[{ entity_id: 'sensor.temperature', state: '44', last_changed: new Date(Date.now() - 1000).toISOString() }]]);
    await vi.waitFor(() => expect(card.shadowRoot!.textContent).toContain('44–44'));
    finishes[0]([[{ entity_id: 'sensor.temperature', state: '99', last_changed: new Date(Date.now() - 1000).toISOString() }]]);
    await Promise.resolve(); await card.updateComplete;
    expect(card.shadowRoot!.textContent).not.toContain('99–99');
  });
  it('displays historical gaps as separate line segments', async () => {
    const rows = ['1', '2', 'unknown', '3', '4'].map((state, i) => ({ entity_id: 'sensor.temperature', state, last_changed: new Date(Date.now() - 5000 + i * 1000).toISOString() }));
    const { card } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelectorAll('polyline')).toHaveLength(2));
    for (const line of card.shadowRoot!.querySelectorAll('polyline')) {
      expect(line.namespaceURI).toBe('http://www.w3.org/2000/svg');
    }
  });
});
