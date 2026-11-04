import { LitElement, html, css, TemplateResult, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { ComfoairCardConfig, DetectHass } from './types';
import { EDITOR_TYPE, ENTITY_FIELDS } from './const';
import { autodetectEntities } from './helpers';
import { localize, resolveLanguage } from './localize';
import { CONTROL_DEFINITIONS } from './controls';
import { detectProfile, IntegrationProfile } from './profiles';
type FormSchema = Record<string, unknown>;

const ADVANCED_SCHEMA: FormSchema[] = [
  ...['airflow_supply','airflow_extract','humidity_supply','humidity_extract','power','energy','preheater_power','exchanger_inlet','exchanger_outlet'].map(name=>({name,selector:{entity:{domain:'sensor'}}})),
  { name:'history_entities',selector:{entity:{domain:'sensor',multiple:true}} },
  { name:'history_hours',selector:{select:{options:[{value:'1',label:'1 hour'},{value:'24',label:'24 hours'},{value:'168',label:'7 days'}]}} },
  { name:'bypass_mode',selector:{select:{options:['binary','positive']}} },
  { name:'filter_mode',selector:{select:{options:['binary','nonpositive']}} },
  { name:'recovery_mode',selector:{select:{options:['temperature','exchanger','hidden']}} },
  { name:'layout',selector:{select:{options:['full','compact']}} },
  { name:'telemetry_order',selector:{select:{multiple:true,options:['airflow_supply','airflow_extract','humidity_supply','humidity_extract','power','energy','preheater_power']}} },
  { name:'status_chips',selector:{select:{multiple:true,options:['fan','filter','bypass','preheat','season']}} },
  { name: 'name', selector: { text: {} } },
  { name: 'tempSensor1', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
  { name: 'tempSensor2', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
  { name: 'tempSensor3', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
  { name: 'tempSensor4', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
  { name: 'filterstatus', selector: { entity: { domain: ['binary_sensor','sensor'] } } },
  { name: 'bypass_valve', selector: { entity: { domain: ['binary_sensor','sensor'] } } },
  { name: 'summer_mode', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'preheat', selector: { entity: { domain: 'binary_sensor' } } },
  { name: 'fan_speed_supply', selector: { entity: { domain: 'sensor' } } },
  { name: 'fan_speed_exhaust', selector: { entity: { domain: 'sensor' } } },
  { name: 'return_air_level', selector: { entity: { domain: 'sensor' } } },
  { name: 'supply_air_level', selector: { entity: { domain: 'sensor' } } },
];

const CONTROL_SCHEMA: FormSchema[] = [
  ...['boost_script','boost_cancel_script','preset_auto_script','preset_home_script','preset_away_script','preset_quiet_script'].map(name=>({name,selector:{entity:{domain:'script'}}})),
  { name:'boost_timer', selector:{entity:{domain:'timer'}} },
  { name:'manual_override', selector:{entity:{domain:'input_boolean'}} },
  { name: 'show_controls', selector: { boolean: {} } },
  ...CONTROL_DEFINITIONS.map(item => ({ name: item.key, selector: { entity: { domain: [...item.domains] } } })),
];

@customElement(EDITOR_TYPE)
export class MqttComfoairCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ComfoairCardConfig;
  @state() private _detectedCount = 0;
  @state() private _profile: IntegrationProfile | '' = '';
  @state() private _profileDevice = '';

  public setConfig(config: ComfoairCardConfig): void {
    this._config = { show_controls: true, ...config };
  }

  /** Haupt-Schema; blendet Felder aus, die im aktuellen Modus keine Wirkung haben. */
  private _mainSchema(): FormSchema[] {
    const cfg = this._config;
    const t = (key: string): string => localize(key, resolveLanguage(cfg.language, this.hass?.language));
    const schema: FormSchema[] = [
      { name: 'language', selector: { select: { options: ['auto', 'en', 'pl', 'de', 'nl'].map(value => ({ value, label: value === 'auto' ? t('auto') : ({en:'English', pl:'Polski', de:'Deutsch', nl:'Nederlands'}[value] || value) })) } } },
      { name: 'entity', required: true, selector: { entity: { domain: ['climate', 'fan', 'select'] } } },
      { name: 'animation', selector: { select: { options: [
        { value: 'animated', label: t('animated') },
        { value: 'static', label: t('static') },
      ] } } },
    ];
    if (cfg.animation === 'animated') {
      schema.push({ name: 'animation_speed_source', selector: { select: { options: [
        { value: 'fixed', label: t('animation_speed') },
        { value: 'level', label: t('level') },
      ] } } });
      if (cfg.animation_speed_source !== 'level') {
        schema.push({ name: 'animation_speed', selector: { number: { min: 10, max: 200, step: 10, unit_of_measurement: '%', mode: 'slider' } } });
      }
    }
    schema.push({ name: 'color_scale', selector: { select: { options: [
      { value: 'auto', label: t('auto_scale') },
      { value: 'fixed', label: t('fixed_scale') },
    ] } } });
    if (cfg.color_scale === 'fixed') {
      schema.push(
        { name: 'temp_min', selector: { number: { min: -30, max: 20, step: 1, unit_of_measurement: '°C', mode: 'box' } } },
        { name: 'temp_max', selector: { number: { min: 0, max: 50, step: 1, unit_of_measurement: '°C', mode: 'box' } } },
      );
    }
    schema.push({ name: 'show_legend', selector: { boolean: {} } });
    return schema;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) return html``;
    return html`
      <div class="editor">
<label>
  ${localize('profile', resolveLanguage(this._config.language, this.hass.language))}
  <select
    data-profile
    .value=${this._profile}
    @change=${(event: Event) => {
      this._profile = (event.target as HTMLSelectElement)
        .value as IntegrationProfile | '';
      this._profileDevice = '';
    }}
  >
    <option value="">—</option>
    <option value="mqtt">MQTT</option>
    <option value="esphome">ESPHome</option>
  </select>
</label>

${this._profile ? html`
  <ha-form
    data-profile-device
    .hass=${this.hass}
    .data=${{ device: this._profileDevice }}
    .schema=${[{ name: 'device', selector: { device: {} } }]}
    @value-changed=${(event: CustomEvent) => {
      event.stopPropagation();
      this._profileDevice = event.detail.value.device ?? '';
    }}
  ></ha-form>
` : ''}

${this._profile && this._profileDevice ? html`
  <div>
    ${Object.entries(
      detectProfile(
        this.hass as unknown as DetectHass,
        this._profile,
        this._profileDevice,
      ).mapped,
    ).map(([field, entity]) => html`
      <div>${field}: ${entity}</div>
    `)}
  </div>
  <button
    type="button"
    data-apply-profile
    @click=${() => {
      if (!this._profile || !this._profileDevice) return;
      const { mapped } = detectProfile(
        this.hass as unknown as DetectHass,
        this._profile,
        this._profileDevice,
      );
      const next = { ...this._config };
      for (const [field, entity] of Object.entries(mapped)) {
        const values = next as unknown as Record<string, unknown>;
        if (!values[field]) values[field] = entity;
      }
      this._emit(next);
    }}
  >
    ${localize('apply_profile', resolveLanguage(this._config.language, this.hass.language))}
  </button>
` : ''}
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${this._mainSchema()}
          .computeLabel=${this._label}
          @value-changed=${this._mainChanged}
        ></ha-form>
        ${this._detectedCount > 0
          ? html`<div class="hint">✓ ${this._detectedCount} ${localize('detected', resolveLanguage(this._config.language, this.hass.language))}</div>`
          : ''}
        <ha-expansion-panel outlined>
          <span slot="header">${localize('controls', resolveLanguage(this._config.language, this.hass.language))}</span>
          <ha-form .hass=${this.hass} .data=${this._config} .schema=${CONTROL_SCHEMA}
            .computeLabel=${this._label} @value-changed=${this._advancedChanged}></ha-form>
        </ha-expansion-panel>
        <ha-expansion-panel outlined>
          <span slot="header">${localize('advanced', resolveLanguage(this._config.language, this.hass.language))}</span>
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${ADVANCED_SCHEMA}
            .computeLabel=${this._label}
            @value-changed=${this._advancedChanged}
          ></ha-form>
        </ha-expansion-panel>
      </div>
    `;
  }

  private _label = (schemaItem: { name: string }): string =>
    localize(schemaItem.name === 'preheat' ? 'preheat_field' : schemaItem.name.startsWith('airflow_') && schemaItem.name !== 'airflow_control' ? 'telemetry_'+schemaItem.name : schemaItem.name, resolveLanguage(this._config.language, this.hass?.language));

  private _mainChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = ev.detail.value as Partial<ComfoairCardConfig>;
    const newEntity = value.entity ?? '';
    const entityChanged = !!newEntity && newEntity !== this._config.entity;
    let next: ComfoairCardConfig = { ...this._config, ...value };
    if (entityChanged) {
      // alte auto-erkannte Felder verwerfen, dann für die neue Entity frisch erkennen,
      // damit keine Sensoren des vorherigen Geräts stehen bleiben
      const cleared = next as unknown as Record<string, unknown>;
      for (const f of ENTITY_FIELDS) {
        if (f !== 'entity') delete cleared[f];
      }
      const detected = autodetectEntities(this.hass as unknown as DetectHass, newEntity);
      next = { ...next, ...detected };
      this._detectedCount = Object.keys(detected).length;
    }
    this._emit(next);
  }

  private _advancedChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = { ...ev.detail.value } as Partial<ComfoairCardConfig>;
    if (value.history_hours != null) value.history_hours = Number(value.history_hours) as 1 | 24 | 168;
    this._emit({ ...this._config, ...value });
  }

  private _emit(config: ComfoairCardConfig): void {
    this._config = config;
    fireEvent(this, 'config-changed', { config });
  }

  static get styles(): CSSResultGroup {
    return css`
      .hint { color: var(--success-color, #43a047); padding: 4px 0 8px; font-size: 0.9em; }
      ha-form { display: block; }
      ha-expansion-panel { margin-top: 8px; }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mqttcomfoair-card-editor': MqttComfoairCardEditor;
  }
}
