import { LitElement, html, svg, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

export interface HistoryPoint { time: number; value: number | null }
interface HistoryState { entity_id?: string; state?: string; last_changed?: string; last_updated?: string }
interface Series { entity: string; points: HistoryPoint[] }

export function historyEntityIds(ids: string[]): string[] {
  return [...new Set(ids.filter(id => /^[a-z_]+\.[a-z0-9_]+$/.test(id)))].slice(0, 8);
}

/** Bucket at most 240 points; a bucket containing unavailable data remains a gap. */
export function historyPoints(rows: HistoryState[]): HistoryPoint[] {
  const points = rows.map(row => {
    const raw = String(row.state ?? '').trim();
    const value = raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null;
    return { time: Date.parse(row.last_changed ?? row.last_updated ?? ''), value };
  }).filter(point => Number.isFinite(point.time)).sort((a, b) => a.time - b.time);
  if (points.length <= 240) return points;
  const result: HistoryPoint[] = [];
  for (let index = 0; index < 240; index++) {
    const bucket = points.slice(Math.floor(index * points.length / 240), Math.floor((index + 1) * points.length / 240));
    const last = bucket[bucket.length - 1];
    result.push({ time: last.time, value: bucket.some(point => point.value === null) ? null : last.value });
  }
  return result;
}

const LABELS: Record<string, Record<string, string>> = {
  en: { title: 'History', loading: 'Loading history…', empty: 'No history', error: 'History could not be loaded.', refresh: 'Refresh', day: '24 hours', week: '7 days', hour: '1 hour' },
  pl: { title: 'Historia', loading: 'Ładowanie historii…', empty: 'Brak historii', error: 'Nie udało się wczytać historii.', refresh: 'Odśwież', day: '24 godziny', week: '7 dni', hour: '1 godzina' },
  de: { title: 'Verlauf', loading: 'Verlauf wird geladen…', empty: 'Kein Verlauf', error: 'Verlauf konnte nicht geladen werden.', refresh: 'Aktualisieren', day: '24 Stunden', week: '7 Tage', hour: '1 Stunde' },
  nl: { title: 'Geschiedenis', loading: 'Geschiedenis laden…', empty: 'Geen geschiedenis', error: 'Geschiedenis kon niet worden geladen.', refresh: 'Vernieuwen', day: '24 uur', week: '7 dagen', hour: '1 uur' },
};

@customElement('mqttcomfoair-history')
export class MqttComfoairHistory extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public entities: string[] = [];
  @property({ type: Number }) public hours = 24;
  @property() public language = 'en';
  @state() private _series: Series[] = [];
  @state() private _loading = false;
  @state() private _error = false;
  private _generation = 0;
  private _requestKey = '';
  private _start = 0;
  private _end = 0;

  private _t(key: string): string { return (LABELS[this.language] ?? LABELS.en)[key]; }

  public connectedCallback(): void {
    super.connectedCallback();
    this._requestKey = '';
    this.requestUpdate();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._generation++;
    this._requestKey = '';
  }

  protected willUpdate(_changed: PropertyValues): void {
    if (!this.isConnected || !this.hass?.callApi) return;
    const key = JSON.stringify([historyEntityIds(this.entities), this._boundedHours()]);
    if (key !== this._requestKey) { this._requestKey = key; void this._load(); }
  }

  private _boundedHours(): number { return [1, 24, 168].includes(this.hours) ? this.hours : 168; }

  private async _load(): Promise<void> {
    const generation = ++this._generation;
    const ids = historyEntityIds(this.entities);
    this._error = false;
    this._series = [];
    if (!ids.length || !this.hass?.callApi) { this._loading = false; return; }
    this._loading = true;
    this._end = Date.now();
    this._start = this._end - this._boundedHours() * 3600000;
    const params = new URLSearchParams({ filter_entity_id: ids.join(','), end_time: new Date(this._end).toISOString(), minimal_response: '', no_attributes: '' });
    try {
      const result = await this.hass.callApi<HistoryState[][]>('GET', 'history/period/' + new Date(this._start).toISOString() + '?' + params.toString());
      if (generation !== this._generation || !this.isConnected) return;
      if (!Array.isArray(result)) throw new Error('Invalid history response');
      this._series = ids.map(entity => ({ entity, points: historyPoints(result.find(rows => Array.isArray(rows) && rows[0]?.entity_id === entity) ?? []).filter(point => point.time >= this._start && point.time <= this._end) }));
    } catch {
      if (generation === this._generation && this.isConnected) this._error = true;
    } finally {
      if (generation === this._generation && this.isConnected) this._loading = false;
    }
  }

  private _chart(series: Series): TemplateResult {
    const entity = this.hass.states[series.entity];
    const values = series.points.flatMap(point => point.value === null ? [] : [point.value]);
    const unit = String(entity?.attributes.unit_of_measurement ?? '');
    const name = String(entity?.attributes.friendly_name ?? series.entity);
    if (!values.length) return html`<div class="series"><strong>${name}</strong><span>${this._t('empty')}</span></div>`;
    const min = Math.min(...values); const max = Math.max(...values);
    const segments: string[][] = [[]];
    for (const point of series.points) {
      if (point.value === null) { if (segments[segments.length - 1].length) segments.push([]); continue; }
      const x = 2 + (point.time - this._start) / (this._end - this._start) * 296;
      const y = max === min ? 30 : 58 - (point.value - min) / (max - min) * 56;
      segments[segments.length - 1].push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    const formatter = new Intl.NumberFormat(this.language, { maximumFractionDigits: 2 });
    return html`<div class="series"><strong>${name}</strong>
      <span class="range">${formatter.format(min)}–${formatter.format(max)} ${unit}</span>
      <svg viewBox="0 0 300 60" role="img" aria-label=${name + ': ' + formatter.format(min) + '–' + formatter.format(max) + ' ' + unit}>
        ${segments.filter(segment => segment.length).map(segment => svg`<polyline points=${segment.join(' ')} />`)}
      </svg></div>`;
  }

  protected render(): TemplateResult {
    const formatTime = (time: number): string => new Date(time).toLocaleString(this.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return html`<section aria-label=${this._t('title')}>
      <header><strong>${this._t('title')}</strong><nav aria-label=${this._t('title')}>
        ${([1, 24, 168] as const).map(hours => html`<button type="button" aria-pressed=${this._boundedHours() === hours} @click=${() => { this.hours = hours; }}>${this._t(hours === 1 ? 'hour' : hours === 24 ? 'day' : 'week')}</button>`)}
        <button type="button" data-refresh ?disabled=${this._loading} @click=${() => { void this._load(); }}>${this._t('refresh')}</button>
      </nav></header>
      ${this._loading ? html`<p role="status">${this._t('loading')}</p>` : this._error ? html`<p role="alert">${this._t('error')}</p>` : this._series.some(series => series.points.length) ? html`${this._series.map(series => this._chart(series))}<div class="times"><time>${formatTime(this._start)}</time><time>${formatTime(this._end)}</time></div>` : html`<p>${this._t('empty')}</p>`}
    </section>`;
  }

  static styles = css`
    :host { display:block; }
    section { border-top:1px solid var(--divider-color); margin-top:12px; padding-top:12px; }
    header, nav { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    header { justify-content:space-between; }
    button { min-height:44px; border:1px solid var(--divider-color); border-radius:8px; color:var(--primary-text-color); background:var(--card-background-color); padding:6px 10px; font:inherit; cursor:pointer; }
    button[aria-pressed="true"] { border-color:var(--primary-color); }
    button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .series { display:grid; grid-template-columns:1fr auto; gap:4px; margin-top:12px; font-size:12px; }
    .series strong { overflow-wrap:anywhere; }
    svg { width:100%; height:64px; grid-column:1/-1; overflow:visible; }
    polyline { stroke:var(--primary-color,#03a9f4); stroke-width:2; fill:none; vector-effect:non-scaling-stroke; }
    .times { display:flex; justify-content:space-between; gap:8px; font-size:11px; color:var(--secondary-text-color); }
    [role="alert"] { color:var(--error-color); }
  `;
}

declare global { interface HTMLElementTagNameMap { 'mqttcomfoair-history': MqttComfoairHistory } }
