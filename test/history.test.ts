// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeAssistant } from 'custom-card-helpers';
import { MqttComfoairHistory, historyEntityIds, historyPoints, historyCsv } from '../src/comfoair-history';
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
  it('exports original timestamps, states and metadata with safe quoted CSV cells', () => {
    const csv = historyCsv([{ entity: 'sensor.power', name: '=HYPERLINK("bad")', unit: '@W', rows: [
      { state: '-3.5', last_changed: '2026-11-05T10:00:00Z' },
      { state: '=1+1', last_changed: '2026-11-05T10:01:00Z' },
    ] }], Date.parse('2026-11-05T10:00:00Z'), Date.parse('2026-11-05T10:02:00Z'));
    expect(csv).toContain('"2026-11-05T10:00:00.000Z"');
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
    expect(csv).toContain('"\'@W"');
    expect(csv).toContain('"-3.5"');
    expect(csv).toContain('"\'=1+1"');
  });
  it('lets users inspect precise points, zoom without fetching, and select series', async () => {
    const rows = [1, 2, 3].map((state, i) => ({ entity_id: 'sensor.temperature', state: String(state), last_changed: new Date(Date.now() - 30000 + i * 10000).toISOString() }));
    const { card, call } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    const chart = card.shadowRoot!.querySelector('svg')!;
    chart.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('[data-tooltip]')!.textContent).toContain('1');
    expect(card.shadowRoot!.querySelector('[data-tooltip] time')!.getAttribute('datetime')).toBe(new Date(rows[0].last_changed).toISOString());
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-zoom-in]')!.click();
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-zoom-reset]')!.disabled).toBe(false);
    expect(call).toHaveBeenCalledTimes(1);
    const checkbox = card.shadowRoot!.querySelector<HTMLInputElement>('[data-series]')!;
    checkbox.checked = false; checkbox.dispatchEvent(new Event('change'));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('svg')).toBeNull();
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('[data-export]')!.disabled).toBe(true);
  });
  it('inspects original unsampled data and explicitly displays unavailable samples', async () => {
    const rows = Array.from({ length: 500 }, (_, i) => ({ entity_id: 'sensor.temperature', state: i === 1 ? 'unknown' : String(i), last_changed: new Date(Date.now() - 600000 + i * 1000).toISOString() }));
    const { card } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    const chart = card.shadowRoot!.querySelector('svg')!;
    chart.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' })); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('[data-tooltip] time')!.getAttribute('datetime')).toBe(new Date(rows[0].last_changed).toISOString());
    chart.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('[data-tooltip]')!.textContent).toContain('Unavailable');
    expect(card.shadowRoot!.querySelector('circle')).toBeNull();
  });
  it('scales the chart to original spikes even when plot sampling omits them', async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => ({ entity_id: 'sensor.temperature', state: i === 1 ? '100' : '1', last_changed: new Date(Date.now() - 1200000 + i * 1000).toISOString() }));
    const { card } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    const chart = card.shadowRoot!.querySelector('svg')!;
    chart.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' })); await card.updateComplete;
    chart.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('.range')!.textContent).toContain('1–100');
    const cy = Number(card.shadowRoot!.querySelector('circle')!.getAttribute('cy'));
    expect(cy).toBeGreaterThanOrEqual(2);
    expect(cy).toBeLessThanOrEqual(58);
  });
  it('exports every original selected reading and revokes its download URL on disconnect', async () => {
    const rows = Array.from({ length: 500 }, (_, i) => ({ entity_id: 'sensor.temperature', state: String(i), last_changed: new Date(Date.now() - 600000 + i * 1000).toISOString() }));
    const { card } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:history-test');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      card.shadowRoot!.querySelector<HTMLButtonElement>('[data-export]')!.click();
      const csv = await (create.mock.calls[0][0] as Blob).text();
      expect(csv.split('\r\n')).toHaveLength(502);
      expect(csv).toContain('"499"');
      expect(click).toHaveBeenCalledTimes(1);
      card.remove();
      expect(revoke).toHaveBeenCalledWith('blob:history-test');
    } finally { create.mockRestore(); revoke.mockRestore(); click.mockRestore(); }
  });
  it('keeps zoom inside the fetched range and resets without another request', async () => {
    const rows = [1, 2].map((state, i) => ({ entity_id: 'sensor.temperature', state: String(state), last_changed: new Date(Date.now() - 30000 + i * 10000).toISOString() }));
    const { card, call } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    const initial = [...card.shadowRoot!.querySelectorAll('.times time')].map(el => el.getAttribute('datetime'));
    card.shadowRoot!.querySelector('svg')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' })); await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-zoom-in]')!.click(); await card.updateComplete;
    const zoomed = [...card.shadowRoot!.querySelectorAll('.times time')].map(el => el.getAttribute('datetime'));
    expect(Date.parse(zoomed[0]!)).toBeGreaterThanOrEqual(Date.parse(initial[0]!));
    expect(Date.parse(zoomed[1]!)).toBeLessThanOrEqual(Date.parse(initial[1]!));
    expect(Date.parse(zoomed[1]!) - Date.parse(zoomed[0]!)).toBe(12 * 3600000);
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-zoom-reset]')!.click(); await card.updateComplete;
    expect([...card.shadowRoot!.querySelectorAll('.times time')].map(el => el.getAttribute('datetime'))).toEqual(initial);
    expect(call).toHaveBeenCalledTimes(1);
  });
  it('carries the last actual sample into a steady zoom window without inventing CSV rows', async () => {
    const rows = [{ entity_id: 'sensor.temperature', state: '12', last_changed: new Date(Date.now() - 23 * 3600000).toISOString() }];
    const { card } = setup(vi.fn().mockResolvedValue([rows]));
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('svg')).not.toBeNull());
    card.shadowRoot!.querySelector<HTMLButtonElement>('[data-zoom-in]')!.click(); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('svg')).not.toBeNull();
    expect(card.shadowRoot!.querySelector('.range')!.textContent).toContain('12–12');
    card.shadowRoot!.querySelector('svg')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' })); await card.updateComplete;
    expect(card.shadowRoot!.querySelector('[data-tooltip] time')!.getAttribute('datetime')).toBe(new Date(rows[0].last_changed).toISOString());
    const csv = historyCsv([{ entity: 'sensor.temperature', name: 'Temperature', unit: '°C', rows }], Date.now() - 18 * 3600000, Date.now() - 6 * 3600000);
    expect(csv.split('\r\n')).toHaveLength(2);
  });
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
