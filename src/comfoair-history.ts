import { LitElement, html, svg, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

export interface HistoryPoint { time: number; value: number | null }
export interface HistoryState { entity_id?: string; state?: string; last_changed?: string; last_updated?: string }
interface Series { entity: string; rows: HistoryState[]; samples: HistoryPoint[] }
interface ViewData { start: number; end: number; original: HistoryPoint[]; plotted: HistoryPoint[]; min: number; max: number }
export interface HistoryCsvSeries { entity: string; name: string; unit: string; rows: HistoryState[] }

function rawHistoryPoints(rows: HistoryState[]): HistoryPoint[] {
  return rows.map(row => {
    const raw = String(row.state ?? '').trim();
    const value = raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null;
    return { time: Date.parse(row.last_changed ?? row.last_updated ?? ''), value };
  }).filter(point => Number.isFinite(point.time)).sort((a, b) => a.time - b.time);
}

/** Quote every field; prevent spreadsheet formulas in user-controlled text fields. */
export function historyCsv(series: HistoryCsvSeries[], start: number, end: number): string {
  const cell = (value: string, numeric = false): string => {
    const safe = !numeric && /^[\s]*[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  const lines = ['timestamp_utc,entity_id,name,state,unit'];
  for (const item of series) {
    for (const row of item.rows) {
      const time = Date.parse(row.last_changed ?? row.last_updated ?? '');
      if (!Number.isFinite(time) || time < start || time > end) continue;
      const state = String(row.state ?? '');
      const numeric = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(state) && Number.isFinite(Number(state));
      lines.push([cell(new Date(time).toISOString()), cell(item.entity), cell(item.name), cell(state, numeric), cell(item.unit)].join(','));
    }
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

export function historyEntityIds(ids: string[]): string[] {
  return [...new Set(ids.filter(id => /^[a-z_]+\.[a-z0-9_]+$/.test(id)))].slice(0, 8);
}

/** Bucket at most 240 points; a bucket containing unavailable data remains a gap. */
export function historyPoints(rows: HistoryState[]): HistoryPoint[] {
  return sampledPoints(rawHistoryPoints(rows));
}

function sampledPoints(points: HistoryPoint[]): HistoryPoint[] {
  if (points.length <= 240) return points;
  const result: HistoryPoint[] = [];
  for (let index = 0; index < 240; index++) {
    const bucket = points.slice(Math.floor(index * points.length / 240), Math.floor((index + 1) * points.length / 240));
    const last = bucket[bucket.length - 1];
    result.push({ time: last.time, value: bucket.some(point => point.value === null) ? null : last.value });
  }
  return result;
}

function nearestIndex(points: HistoryPoint[], target: number): number {
  if (!points.length) return -1;
  let lower = 0; let upper = points.length;
  while (lower < upper) { const middle = Math.floor((lower + upper) / 2); if (points[middle].time < target) lower = middle + 1; else upper = middle; }
  if (lower === 0) return 0;
  if (lower === points.length) return points.length - 1;
  return target - points[lower - 1].time <= points[lower].time - target ? lower - 1 : lower;
}

const LABELS: Record<string, Record<string, string>> = {
  en: { title: 'History', loading: 'Loading history…', empty: 'No history', error: 'History could not be loaded.', refresh: 'Refresh', day: '24 hours', week: '7 days', hour: '1 hour' },
  pl: { title: 'Historia', loading: 'Ładowanie historii…', empty: 'Brak historii', error: 'Nie udało się wczytać historii.', refresh: 'Odśwież', day: '24 godziny', week: '7 dni', hour: '1 godzina' },
  de: { title: 'Verlauf', loading: 'Verlauf wird geladen…', empty: 'Kein Verlauf', error: 'Verlauf konnte nicht geladen werden.', refresh: 'Aktualisieren', day: '24 Stunden', week: '7 Tage', hour: '1 Stunde' },
  nl: { title: 'Geschiedenis', loading: 'Geschiedenis laden…', empty: 'Geen geschiedenis', error: 'Geschiedenis kon niet worden geladen.', refresh: 'Vernieuwen', day: '24 uur', week: '7 dagen', hour: '1 uur' },
};

const INTERACTION_LABELS: Record<string, Record<string, string>> = {
  en: { zoom_in: 'Zoom in', zoom_out: 'Zoom out', reset: 'Reset zoom', export: 'Export CSV', series: 'Visible series', inspect: 'Use arrow keys to inspect samples; Home and End jump to the first and last sample.', unavailable: 'Unavailable', selection: 'Select at least one series.', sampled: 'Charts show up to 240 sampled points per series. Tooltips and CSV use original readings. Units and names reflect current entity metadata.', export_error: 'CSV download could not be started.' },
  pl: { zoom_in: 'Powiększ', zoom_out: 'Pomniejsz', reset: 'Resetuj powiększenie', export: 'Eksportuj CSV', series: 'Widoczne serie', inspect: 'Strzałkami przeglądasz pomiary; Home i End przechodzą do pierwszego i ostatniego pomiaru.', unavailable: 'Niedostępne', selection: 'Wybierz co najmniej jedną serię.', sampled: 'Wykresy pokazują do 240 próbek na serię. Podpowiedzi i CSV używają oryginalnych pomiarów. Jednostki i nazwy pochodzą z bieżących metadanych encji.', export_error: 'Nie udało się rozpocząć pobierania CSV.' },
  de: { zoom_in: 'Vergrößern', zoom_out: 'Verkleinern', reset: 'Zoom zurücksetzen', export: 'CSV exportieren', series: 'Sichtbare Reihen', inspect: 'Mit Pfeiltasten Messwerte auswählen; Pos1 und Ende wählen den ersten und letzten Wert.', unavailable: 'Nicht verfügbar', selection: 'Mindestens eine Reihe auswählen.', sampled: 'Diagramme zeigen bis zu 240 Punkte je Reihe. Tooltips und CSV verwenden Originalwerte. Einheiten und Namen entsprechen aktuellen Entitätsmetadaten.', export_error: 'CSV-Download konnte nicht gestartet werden.' },
  nl: { zoom_in: 'Inzoomen', zoom_out: 'Uitzoomen', reset: 'Zoom herstellen', export: 'CSV exporteren', series: 'Zichtbare reeksen', inspect: 'Gebruik pijltoetsen voor metingen; Home en End kiezen de eerste en laatste meting.', unavailable: 'Niet beschikbaar', selection: 'Selecteer minstens één reeks.', sampled: 'Grafieken tonen maximaal 240 punten per reeks. Tooltips en CSV gebruiken originele metingen. Eenheden en namen zijn huidige entiteitsmetadata.', export_error: 'CSV-download kon niet worden gestart.' },
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
  @state() private _hidden: string[] = [];
  @state() private _viewStart = 0;
  @state() private _viewEnd = 0;
  @state() private _inspection: { entity: string; time: number } | undefined;
  @state() private _exportError = false;
  private _generation = 0;
  private _requestKey = '';
  private _start = 0;
  private _end = 0;
  private _downloadUrls = new Map<string, ReturnType<typeof setTimeout>>();
  private _views = new Map<string, ViewData>();

  private _t(key: string): string { return (LABELS[this.language] ?? LABELS.en)[key] ?? (INTERACTION_LABELS[this.language] ?? INTERACTION_LABELS.en)[key]; }
  private _locale(): string { return this.language in LABELS ? this.language : 'en'; }

  public connectedCallback(): void {
    super.connectedCallback();
    this._requestKey = '';
    this.requestUpdate();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._generation++;
    this._requestKey = '';
    for (const [url, timeout] of this._downloadUrls) { clearTimeout(timeout); URL.revokeObjectURL(url); }
    this._downloadUrls.clear();
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
    this._views.clear();
    this._inspection = undefined;
    this._exportError = false;
    if (!ids.length || !this.hass?.callApi) { this._loading = false; return; }
    this._loading = true;
    this._end = Date.now();
    this._start = this._end - this._boundedHours() * 3600000;
    this._viewStart = this._start;
    this._viewEnd = this._end;
    const params = new URLSearchParams({ filter_entity_id: ids.join(','), end_time: new Date(this._end).toISOString(), minimal_response: '', no_attributes: '' });
    try {
      const result = await this.hass.callApi<HistoryState[][]>('GET', 'history/period/' + new Date(this._start).toISOString() + '?' + params.toString());
      if (generation !== this._generation || !this.isConnected) return;
      if (!Array.isArray(result)) throw new Error('Invalid history response');
      this._series = ids.map(entity => {
        const rows = (result.find(rows => Array.isArray(rows) && rows[0]?.entity_id === entity) ?? []).filter(row => {
        const time = Date.parse(row.last_changed ?? row.last_updated ?? '');
        return Number.isFinite(time) && time <= this._end;
        });
        return { entity, rows, samples: rawHistoryPoints(rows) };
      });
    } catch {
      if (generation === this._generation && this.isConnected) this._error = true;
    } finally {
      if (generation === this._generation && this.isConnected) this._loading = false;
    }
  }

  private _view(series: Series): ViewData {
    const cached = this._views.get(series.entity);
    if (cached && cached.start === this._viewStart && cached.end === this._viewEnd) return cached;
    const original = series.samples.filter(point => point.time >= this._viewStart && point.time <= this._viewEnd);
    const priorIndex = nearestIndex(series.samples, this._viewStart);
    let carryIndex = priorIndex;
    if (carryIndex >= 0 && series.samples[carryIndex].time >= this._viewStart) carryIndex--;
    if (carryIndex >= 0 && original[0]?.time !== this._viewStart) original.unshift(series.samples[carryIndex]);
    let min = Infinity; let max = -Infinity;
    for (const point of original) { if (point.value !== null) { min = Math.min(min, point.value); max = Math.max(max, point.value); } }
    const chartPoints = original.map(point => ({ ...point, time: Math.max(this._viewStart, point.time) }));
    const last = chartPoints[chartPoints.length - 1];
    if (last && last.time < this._viewEnd) chartPoints.push({ ...last, time: this._viewEnd });
    const result = { start: this._viewStart, end: this._viewEnd, original, plotted: sampledPoints(chartPoints), min, max };
    this._views.set(series.entity, result);
    return result;
  }

  private _zoom(factor: number): void {
    const loadedSpan = this._end - this._start;
    const span = Math.min(loadedSpan, Math.max(Math.min(60000, loadedSpan), (this._viewEnd - this._viewStart) * factor));
    const center = this._inspection?.time ?? (this._viewStart + this._viewEnd) / 2;
    this._viewStart = Math.max(this._start, Math.min(this._end - span, center - span / 2));
    this._viewEnd = this._viewStart + span;
    this._inspection = undefined;
  }

  private _inspect(series: Series, target: number): void {
    const points = this._view(series).original;
    if (!points.length) return;
    const point = points[nearestIndex(points, target)];
    this._inspection = { entity: series.entity, time: point.time };
  }

  private _pointer(ev: PointerEvent, series: Series): void {
    const rect = (ev.currentTarget as SVGElement).getBoundingClientRect();
    if (!rect.width) return;
    const viewX = (ev.clientX - rect.left) / rect.width * 300;
    const fraction = Math.max(0, Math.min(1, (viewX - 2) / 296));
    this._inspect(series, this._viewStart + fraction * (this._viewEnd - this._viewStart));
  }

  private _key(ev: KeyboardEvent, series: Series): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Escape'].includes(ev.key)) return;
    ev.preventDefault();
    if (ev.key === 'Escape') { this._inspection = undefined; return; }
    const points = this._view(series).original;
    if (!points.length) return;
    const current = this._inspection?.entity === series.entity ? nearestIndex(points, this._inspection.time) : -1;
    const index = ev.key === 'Home' ? 0 : ev.key === 'End' ? points.length - 1 : Math.max(0, Math.min(points.length - 1, current + (ev.key === 'ArrowLeft' ? -1 : 1)));
    this._inspection = { entity: series.entity, time: points[index].time };
  }

  private _export(): void {
    this._exportError = false;
    let url: string | undefined;
    const anchor = document.createElement('a');
    try {
      const content = historyCsv(this._series.filter(series => !this._hidden.includes(series.entity)).map(series => ({ ...series,
        name: String(this.hass.states[series.entity]?.attributes.friendly_name ?? series.entity),
        unit: String(this.hass.states[series.entity]?.attributes.unit_of_measurement ?? ''),
      })), this._viewStart, this._viewEnd);
      url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
      anchor.href = url;
      anchor.download = 'ventilation-history-' + new Date(this._viewStart).toISOString().slice(0, 10) + '.csv';
      document.body.append(anchor); anchor.click();
      const createdUrl = url;
      this._downloadUrls.set(createdUrl, setTimeout(() => { URL.revokeObjectURL(createdUrl); this._downloadUrls.delete(createdUrl); }, 1000));
    } catch {
      if (url) URL.revokeObjectURL(url);
      this._exportError = true;
    } finally { anchor.remove(); }
  }

  private _chart(series: Series): TemplateResult {
    const entity = this.hass.states[series.entity];
    const { original, plotted: points, min, max } = this._view(series);
    const unit = String(entity?.attributes.unit_of_measurement ?? '');
    const name = String(entity?.attributes.friendly_name ?? series.entity);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return html`<div class="series"><strong>${name}</strong><span>${this._t(original.length ? 'unavailable' : 'empty')}</span></div>`;
    const segments: string[][] = [[]];
    for (const point of points) {
      if (point.value === null) { if (segments[segments.length - 1].length) segments.push([]); continue; }
      const x = 2 + (point.time - this._viewStart) / (this._viewEnd - this._viewStart) * 296;
      const y = max === min ? 30 : 58 - (point.value - min) / (max - min) * 56;
      segments[segments.length - 1].push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    const formatter = new Intl.NumberFormat(this._locale(), { maximumFractionDigits: 2 });
    const inspected = this._inspection?.entity === series.entity ? original[nearestIndex(original, this._inspection.time)] : undefined;
    return html`<div class="series"><strong>${name}</strong>
      <span class="range">${formatter.format(min)}–${formatter.format(max)} ${unit}</span>
      <svg viewBox="0 0 300 60" preserveAspectRatio="none" role="img" tabindex="0" aria-label=${name + ': ' + formatter.format(min) + '–' + formatter.format(max) + ' ' + unit + '. ' + this._t('inspect')}
        @pointermove=${(ev: PointerEvent) => this._pointer(ev, series)} @pointerdown=${(ev: PointerEvent) => this._pointer(ev, series)}
        @keydown=${(ev: KeyboardEvent) => this._key(ev, series)}>
        ${segments.filter(segment => segment.length).map(segment => svg`<polyline points=${segment.join(' ')} />`)}
        ${inspected && inspected.value !== null ? svg`<circle cx=${Math.max(2, Math.min(298, 2 + (inspected.time - this._viewStart) / (this._viewEnd - this._viewStart) * 296))} cy=${max === min ? 30 : 58 - (inspected.value - min) / (max - min) * 56} r="3" />` : ''}
      </svg>
      ${inspected ? html`<output data-tooltip role="status"><time datetime=${new Date(inspected.time).toISOString()}>${new Date(inspected.time).toLocaleString(this._locale())}</time> · ${inspected.value === null ? this._t('unavailable') : String(inspected.value) + ' ' + unit}</output>` : ''}
      </div>`;
  }

  protected render(): TemplateResult {
    const formatTime = (time: number): string => new Date(time).toLocaleString(this._locale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const visible = this._series.filter(series => !this._hidden.includes(series.entity));
    const hasData = visible.some(series => this._view(series).original.length);
    const zoomed = this._viewStart !== this._start || this._viewEnd !== this._end;
    return html`<section aria-label=${this._t('title')}>
      <header><strong>${this._t('title')}</strong><nav aria-label=${this._t('title')}>
        ${([1, 24, 168] as const).map(hours => html`<button type="button" aria-pressed=${this._boundedHours() === hours} @click=${() => { this.hours = hours; }}>${this._t(hours === 1 ? 'hour' : hours === 24 ? 'day' : 'week')}</button>`)}
        <button type="button" data-refresh ?disabled=${this._loading} @click=${() => { void this._load(); }}>${this._t('refresh')}</button>
      </nav></header>
      <div class="tools">
        <button type="button" data-zoom-in ?disabled=${!hasData || this._viewEnd - this._viewStart <= 60000} @click=${() => this._zoom(0.5)}>${this._t('zoom_in')}</button>
        <button type="button" data-zoom-out ?disabled=${!zoomed} @click=${() => this._zoom(2)}>${this._t('zoom_out')}</button>
        <button type="button" data-zoom-reset ?disabled=${!zoomed} @click=${() => { this._viewStart = this._start; this._viewEnd = this._end; this._inspection = undefined; }}>${this._t('reset')}</button>
        <button type="button" data-export ?disabled=${this._loading || !hasData} @click=${() => this._export()}>${this._t('export')}</button>
      </div>
      ${this._series.length ? html`<fieldset><legend>${this._t('series')}</legend>${this._series.map(series => html`<label><input type="checkbox" data-series=${series.entity} .checked=${!this._hidden.includes(series.entity)} @change=${(ev: Event) => {
        this._hidden = (ev.target as HTMLInputElement).checked ? this._hidden.filter(id => id !== series.entity) : [...this._hidden, series.entity];
        if (this._inspection?.entity === series.entity) this._inspection = undefined;
      }}>${String(this.hass.states[series.entity]?.attributes.friendly_name ?? series.entity)}</label>`)}</fieldset>` : ''}
      ${this._loading ? html`<p role="status">${this._t('loading')}</p>` : this._error ? html`<p role="alert">${this._t('error')}</p>` : !visible.length && this._series.length ? html`<p>${this._t('selection')}</p>` : hasData ? html`${visible.map(series => this._chart(series))}<div class="times"><time datetime=${new Date(this._viewStart).toISOString()}>${formatTime(this._viewStart)}</time><time datetime=${new Date(this._viewEnd).toISOString()}>${formatTime(this._viewEnd)}</time></div><p class="note">${this._t('sampled')}</p>` : html`<p>${this._t('empty')}</p>`}
      ${this._exportError ? html`<p role="alert">${this._t('export_error')}</p>` : ''}
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
    button:disabled { opacity:0.5; cursor:default; }
    .tools { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    fieldset { border:0; padding:8px 0; min-width:0; display:flex; flex-wrap:wrap; gap:6px 12px; font-size:12px; }
    legend { font-size:12px; color:var(--secondary-text-color); }
    label { display:flex; align-items:center; min-height:32px; overflow-wrap:anywhere; }
    input { min-width:20px; min-height:20px; }
    .series { display:grid; grid-template-columns:1fr auto; gap:4px; margin-top:12px; font-size:12px; }
    .series strong { overflow-wrap:anywhere; }
    svg { width:100%; height:64px; grid-column:1/-1; overflow:visible; }
    svg:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    circle { fill:var(--primary-color,#03a9f4); }
    output { grid-column:1/-1; padding:6px; background:var(--secondary-background-color); overflow-wrap:anywhere; }
    .note { font-size:11px; color:var(--secondary-text-color); }
    polyline { stroke:var(--primary-color,#03a9f4); stroke-width:2; fill:none; vector-effect:non-scaling-stroke; }
    .times { display:flex; justify-content:space-between; gap:8px; font-size:11px; color:var(--secondary-text-color); }
    [role="alert"] { color:var(--error-color); }
  `;
}

declare global { interface HTMLElementTagNameMap { 'mqttcomfoair-history': MqttComfoairHistory } }
