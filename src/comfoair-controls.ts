import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ComfoairCardConfig, DetectHass } from './types';
import { localize } from './localize';
import { CONTROL_DEFINITIONS, ControlKey, controlAction, controlAvailable, controlEntity, controlOptionLabel, controlOptions } from './controls';

@customElement('mqttcomfoair-controls')
export class MqttComfoairControls extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: ComfoairCardConfig;
  @property() public language = 'en';
  @state() private _busy: ControlKey | undefined;
  @state() private _error = false;
  @state() private _confirmReset = false;
  @state() private _drafts: Partial<Record<ControlKey, string>> = {};

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('config')) {
      this._drafts = {};
      this._confirmReset = false;
      this._error = false;
    }
  }

  private _t(key: string): string { return localize(key, this.language); }

  private async _perform(key: ControlKey, value?: unknown): Promise<void> {
    if (this._busy || (key === 'filter_reset' && !this._confirmReset)) return;
    const action = controlAction(this.hass as unknown as DetectHass, this.config, key, value);
    if (!action) return;
    this._busy = key;
    this._error = false;
    try {
      await this.hass.callService(action.domain, action.service, action.data);
      const drafts = { ...this._drafts };
      delete drafts[key];
      this._drafts = drafts;
    } catch {
      this._error = true;
    } finally {
      this._busy = undefined;
      this._confirmReset = false;
    }
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config || this.config.show_controls === false) return html``;
    const controls = CONTROL_DEFINITIONS.filter(item => this.config[item.key]);
    if (!controls.length) return html``;
    return html`<section aria-label=${this._t('controls')}>
      <h3>${this._t('controls')}</h3>
      ${controls.map(definition => {
        const { key, kind } = definition;
        const entity = controlEntity(this.hass as unknown as DetectHass, this.config, key);
        const available = controlAvailable(entity, key);
        const disabled = !!this._busy || !available;
        const label = this._t(key);
        if (kind === 'select') {
          const options = entity ? controlOptions(entity) : [];
          return html`<div class="row">
            <label for=${key}>${label}</label>
            <select id=${key} .value=${entity?.state ?? ''} ?disabled=${disabled || !options.length}
              @change=${(ev: Event): void => { void this._perform(key, (ev.target as HTMLSelectElement).value); }}>
              ${!available ? html`<option>${this._t('unavailable')}</option>` : ''}
              ${options.map(option => html`<option .value=${option} ?selected=${option === entity?.state}>${controlOptionLabel(option, this.language)}</option>`)}
            </select>
          </div>`;
        }
        if (kind === 'number') {
          const value = this._drafts[key] ?? entity?.state ?? '';
          const valid = !!controlAction(this.hass as unknown as DetectHass, this.config, key, value);
          return html`<form class="row" @submit=${(ev: Event): void => { ev.preventDefault(); void this._perform(key, value); }}>
            <label for=${key}>${label}${!available ? html` · ${this._t('unavailable')}` : ''}</label>
            <div class="number">
              <input id=${key} type="number" .value=${value} min=${String(entity?.attributes.min ?? '')}
                max=${String(entity?.attributes.max ?? '')} step=${String(entity?.attributes.step ?? '')}
                ?disabled=${disabled} @input=${(ev: Event): void => {
                  this._drafts = { ...this._drafts, [key]: (ev.target as HTMLInputElement).value };
                }}>
              <span>${String(entity?.attributes.unit_of_measurement ?? '')}</span>
              <button type="submit" data-apply=${key} ?disabled=${disabled || !valid}>${this._t('apply')}</button>
            </div>
          </form>`;
        }
        if (kind === 'switch') return html`<div class="row">
          <span>${label} · ${available ? this._t(entity?.state === 'on' ? 'active' : 'off') : this._t('unavailable')}</span>
          <button data-control=${key} ?disabled=${disabled}
            @click=${(): void => { void this._perform(key, entity?.state !== 'on'); }}>
            ${this._t(entity?.state === 'on' ? 'boost_stop' : 'boost_start')}
          </button>
        </div>`;
        return html`<div class="row">
          <span>${label}${!available ? html` · ${this._t('unavailable')}` : ''}</span>
          ${this._confirmReset ? html`<div class="confirmation" role="group" aria-label=${this._t('confirm_filter_reset')}>
            <span>${this._t('confirm_filter_reset')}</span>
            <div class="buttons">
              <button data-confirm-reset ?disabled=${disabled} @click=${(): void => { void this._perform(key); }}>${this._t('confirm')}</button>
              <button data-cancel-reset ?disabled=${!!this._busy} @click=${(): void => { this._confirmReset = false; }}>${this._t('cancel')}</button>
            </div>
          </div>` : html`<button data-control=${key} ?disabled=${disabled} @click=${(): void => { this._confirmReset = true; }}>${label}</button>`}
        </div>`;
      })}
      ${this._busy ? html`<span role="status">${this._t('updating')}</span>` : ''}
      ${this._error ? html`<span class="error" role="alert">${this._t('update_failed')}</span>` : ''}
    </section>`;
  }

  static styles = css`
    :host { display: block; }
    section { border-top: 1px solid var(--divider-color); margin-top: 12px; padding-top: 12px; }
    h3 { font-size: 14px; margin: 0 0 10px; }
    .row { display: grid; gap: 6px; margin: 0 0 12px; font-size: 13px; }
    select, input, button { box-sizing: border-box; min-height: 36px; font: inherit; color: var(--primary-text-color);
      background: var(--card-background-color, transparent); border: 1px solid var(--divider-color); border-radius: 8px; padding: 6px 9px; }
    select { width: 100%; }
    input { width: 100%; min-width: 0; }
    button { cursor: pointer; }
    button:hover { border-color: var(--primary-color); }
    :disabled { opacity: 0.5; cursor: default; }
    .number { display: grid; grid-template-columns: minmax(60px, 1fr) auto auto; align-items: center; gap: 8px; }
    .confirmation { display: grid; gap: 8px; }
    .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    .error { color: var(--error-color, #db4437); }
  `;
}

declare global {
  interface HTMLElementTagNameMap { 'mqttcomfoair-controls': MqttComfoairControls; }
}
