import {LitElement,html,css,TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import {HomeAssistant,fireEvent} from 'custom-card-helpers';
import {ComfoairCardConfig,HassEntityLike} from './types';
import {summerAdvice,airflowBalance,energyEstimate,filterMaintenance,reportedReason,entityTimestamp} from './intelligence';

const TEXT:Record<string,Record<string,string>>={
 en:{title:'Ventilation insights',maintenance:'Filter maintenance',days:'days remaining',due:'Estimated due date',service:'Last recorded service',record:'Record filter service',confirm:'Confirm',cancel:'Cancel',confirmService:'Record that the filters were serviced? This does not reset the device counter.',unknown:'Unknown',reason:'Why ventilation is running',next:'Next reported transition',fault:'Device / connection alert',ack:'Acknowledge',acknowledged:'Active — acknowledged',clear:'Clear',active:'Active',energy:'Energy and estimated cost',day:'Today / previous day',month:'This month / previous month',estimate:'Estimate at current tariff',delta:'Difference',balance:'Airflow balance',instant:'Instant supply/extract deviation',sustained:'Sustained deviation reported by HA',baseline:'Baseline',summer:'Summer cooling advice',cooling:'Outdoor air is cooler and no wetter in absolute humidity.',humid:'Outdoor air is cooler but has higher absolute humidity.',warm:'Outdoor air is not sufficiently cooler.',indoor:'Indoor absolute humidity',outdoor:'Outdoor absolute humidity',bypass:'Request bypass',auto:'Request automatic bypass',advisory:'Advice only; no automatic command is sent.',editSchedule:'Open schedule',overrideNext:'Override until next schedule change',schedule:'Weekly schedule',override:'Manual override until',error:'The action failed. Check the mapped entity.',manual:'Manual',boost:'Boost',demand:'Demand automation',device:'Device controller'},
 pl:{title:'Informacje o wentylacji',maintenance:'Serwis filtrów',days:'dni do wymiany',due:'Szacowany termin',service:'Ostatni zapisany serwis',record:'Zapisz serwis filtrów',confirm:'Potwierdź',cancel:'Anuluj',confirmService:'Zapisać wykonany serwis filtrów? Nie zeruje to licznika urządzenia.',unknown:'Brak danych',reason:'Dlaczego wentylacja działa',next:'Następna zgłoszona zmiana',fault:'Alarm urządzenia / połączenia',ack:'Potwierdź alarm',acknowledged:'Aktywny — potwierdzony',clear:'Brak alarmu',active:'Aktywny',energy:'Energia i szacowany koszt',day:'Dziś / poprzedni dzień',month:'Ten miesiąc / poprzedni miesiąc',estimate:'Szacunek według bieżącej taryfy',delta:'Różnica',balance:'Bilans przepływów',instant:'Chwilowa odchyłka nawiewu/wywiewu',sustained:'Utrzymująca się odchyłka zgłoszona przez HA',baseline:'Wartość bazowa',summer:'Letnie chłodzenie — wskazówki',cooling:'Powietrze zewnętrzne jest chłodniejsze i nie ma wyższej wilgotności bezwzględnej.',humid:'Powietrze zewnętrzne jest chłodniejsze, ale ma wyższą wilgotność bezwzględną.',warm:'Powietrze zewnętrzne nie jest wystarczająco chłodne.',indoor:'Wilgotność bezwzględna wewnątrz',outdoor:'Wilgotność bezwzględna na zewnątrz',bypass:'Włącz bypass',auto:'Ustaw automatyczny bypass',advisory:'Tylko wskazówka; brak automatycznych poleceń.',editSchedule:'Otwórz harmonogram',overrideNext:'Steruj ręcznie do następnej zmiany',schedule:'Harmonogram tygodniowy',override:'Sterowanie ręczne do',error:'Polecenie nie powiodło się. Sprawdź przypisaną encję.',manual:'Ręcznie',boost:'Przewietrzanie',demand:'Automatyzacja zapotrzebowania',device:'Sterownik urządzenia'},
};
@customElement('mqttcomfoair-intelligence')
export class MqttComfoairIntelligence extends LitElement {
 @property({attribute:false}) hass!:HomeAssistant;
 @property({attribute:false}) config!:ComfoairCardConfig;
 @property() language='en';
 @state() private _confirm=false;
 @state() private _busy=false;
 @state() private _error=false;
 private _t(key:string):string{return (TEXT[this.language]??TEXT.en)[key]??TEXT.en[key]??key;}
 private _entity(id?:string):HassEntityLike|undefined{return id?this.hass?.states[id]:undefined;}
 private _number(n:number|undefined,digits=1):string{return n===undefined?'—':new Intl.NumberFormat(this.language,{maximumFractionDigits:digits}).format(n);}
 private _date(timestamp?:number):string{return timestamp===undefined?this._t('unknown'):new Date(timestamp).toLocaleString(this.language);}
 private async _script(id?:string):Promise<void>{
  if(this._busy||!id?.startsWith('script.')||!this._entity(id)||['unknown','unavailable'].includes(this._entity(id)!.state))return;
  this._busy=true;this._error=false;
  try{await this.hass.callService('script','turn_on',{entity_id:id});}catch{this._error=true;}finally{this._busy=false;this._confirm=false;}
 }
 private _scriptButton(id:string|undefined,label:string,confirm=false):TemplateResult {
  const entity=this._entity(id),disabled=this._busy||!entity||['unknown','unavailable'].includes(entity.state);
  return html`<button ?disabled=${disabled} @click=${()=>{if(confirm)this._confirm=true;else void this._script(id);}}>${label}</button>`;
 }
 private _energy(currentId?:string,previousId?:string):TemplateResult {
  const data=energyEstimate(this._entity(currentId),this._entity(previousId),this._entity(this.config.energy_tariff));
  return html`<div>${data?html`${this._number(data.current)} / ${this._number(data.previous)} kWh · ${this._t('delta')}: ${this._number(data.delta)} kWh
   ${data.cost!==undefined?html`<div>${this._t('estimate')}: ${this._number(data.cost,2)} ${data.currency}</div>`:''}`:this._t('unknown')}</div>`;
 }
 private async _bypass(option:string):Promise<void>{
  const id=this.config.summer_bypass_control,entity=this._entity(id);
  if(this._busy||!id?.startsWith('select.')||!entity||['unknown','unavailable'].includes(entity.state)||!Array.isArray(entity.attributes.options)||!entity.attributes.options.includes(option))return;
  this._busy=true;this._error=false;
  try{await this.hass.callService('select','select_option',{entity_id:id,option});}catch{this._error=true;}finally{this._busy=false;}
 }
 protected render():TemplateResult {
  if(!this.hass||!this.config||this.config.show_intelligence===false)return html``;
  const c=this.config;
  const filter=filterMaintenance(this._entity(c.filter_days_remaining),this._entity(c.filter_last_service));
  const reason=reportedReason(this._entity(c.controller_source),this._entity(c.controller_next_transition));
  const balance=airflowBalance(this._entity(c.airflow_supply),this._entity(c.airflow_extract),c.airflow_baseline??0,c.airflow_tolerance??10);
  const advice=summerAdvice(this._entity(c.summer_indoor_temperature),this._entity(c.summer_outdoor_temperature),this._entity(c.summer_indoor_humidity),this._entity(c.summer_outdoor_humidity),c.summer_minimum_difference??2);
  const summerConfigured=!!(c.summer_indoor_temperature||c.summer_outdoor_temperature||c.summer_indoor_humidity||c.summer_outdoor_humidity);
  const bypass=this._entity(c.summer_bypass_control),options=Array.isArray(bypass?.attributes.options)?bypass!.attributes.options:[];
  const schedule=this._entity(c.schedule_entity),next=this._entity(c.schedule_next_transition);
  const override=this._entity(c.manual_override_until);
  const fault=this._entity(c.fault_entity),ack=this._entity(c.fault_acknowledged);
  const havePanels=!!(c.filter_days_remaining||c.filter_last_service||c.controller_source||c.fault_entity||c.energy_day||c.energy_month||c.airflow_baseline!==undefined||c.airflow_sustained_fault||summerConfigured||c.schedule_entity);
  if(!havePanels)return html``;
  return html`<section aria-label=${this._t('title')}>
   ${c.filter_days_remaining||c.filter_last_service?html`<article><h3>${this._t('maintenance')}</h3><div>${this._number(filter?.days)} ${this._t('days')}</div><div>${this._t('due')}: ${this._date(filter?.due)}</div><div>${this._t('service')}: ${this._date(filter?.lastService??entityTimestamp(this._entity(c.filter_last_service)))}</div>
    ${c.filter_service_script?this._confirm?html`<p>${this._t('confirmService')}</p>${this._scriptButton(c.filter_service_script,this._t('confirm'))}<button @click=${()=>{this._confirm=false;}}>${this._t('cancel')}</button>`:this._scriptButton(c.filter_service_script,this._t('record'),true):''}</article>`:''}
   ${c.controller_source?html`<article><h3>${this._t('reason')}</h3><div>${this._t(reason.source)}</div><div>${this._t('next')}: ${this._date(reason.next)}</div></article>`:''}
   ${c.fault_entity?html`<article><h3>${this._t('fault')}</h3><div>${!fault||['unknown','unavailable'].includes(fault.state)?this._t('unknown'):c.fault_entity?.startsWith('alert.')?this._t(fault.state==='idle'?'clear':fault.state==='off'?'acknowledged':'active'):fault.state==='on'?this._t('active'):fault.state==='off'?this._t('clear'):fault.state}</div>${ack?.state==='on'?html`<span>${this._t('acknowledged')}</span>`:''}${c.fault_ack_script?this._scriptButton(c.fault_ack_script,this._t('ack')):''}</article>`:''}
   ${c.energy_day||c.energy_month?html`<article><h3>${this._t('energy')}</h3>${c.energy_day?html`<strong>${this._t('day')}</strong>${this._energy(c.energy_day,c.energy_previous_day)}`:''}${c.energy_month?html`<strong>${this._t('month')}</strong>${this._energy(c.energy_month,c.energy_previous_month)}`:''}</article>`:''}
   ${c.airflow_baseline!==undefined||c.airflow_sustained_fault?html`<article><h3>${this._t('balance')}</h3><div>${this._t('instant')}: ${this._number(balance?.imbalance)}% · ${this._t('baseline')}: ${this._number(c.airflow_baseline??0)}%</div><div>${this._t('delta')}: ${this._number(balance?.deviation)}%</div>${c.airflow_sustained_fault?html`<div>${this._t('sustained')}: ${this._entity(c.airflow_sustained_fault)?.state??this._t('unknown')}</div>`:''}</article>`:''}
   ${summerConfigured?html`<article><h3>${this._t('summer')}</h3><p>${this._t(advice.status)}</p><div>${this._t('indoor')}: ${this._number(advice.indoorAH)} g/m³</div><div>${this._t('outdoor')}: ${this._number(advice.outdoorAH)} g/m³</div><small>${this._t('advisory')}</small>
    ${c.summer_bypass_control?.startsWith('select.')&&bypass&&!['unknown','unavailable'].includes(bypass.state)?html`${c.summer_bypass_open_option&&options.includes(c.summer_bypass_open_option)?html`<button ?disabled=${this._busy} @click=${()=>{void this._bypass(c.summer_bypass_open_option!);}}>${this._t('bypass')}</button>`:''}${c.summer_bypass_auto_option&&options.includes(c.summer_bypass_auto_option)?html`<button ?disabled=${this._busy} @click=${()=>{void this._bypass(c.summer_bypass_auto_option!);}}>${this._t('auto')}</button>`:''}`:''}</article>`:''}
   ${c.schedule_entity?html`<article><h3>${this._t('schedule')}</h3><button @click=${()=>fireEvent(this,'hass-more-info',{entityId:c.schedule_entity})}>${this._t('editSchedule')}</button>${c.schedule_override_script?this._scriptButton(c.schedule_override_script,this._t('overrideNext')):''}<div>${schedule&&!['unknown','unavailable'].includes(schedule.state)?schedule.state:this._t('unknown')}</div><div>${this._t('next')}: ${this._date(reportedReason(undefined,next).next)}</div>${c.manual_override_until?html`<div>${this._t('override')}: ${this._date(reportedReason(undefined,override).next)}</div>`:''}</article>`:''}
   ${this._error?html`<p role="alert">${this._t('error')}</p>`:''}
  </section>`;
 }
 static styles=css`:host{display:block}section{display:grid;gap:10px;margin-top:12px}article{border-top:1px solid var(--divider-color);padding-top:10px;overflow-wrap:anywhere}h3{font-size:14px;margin:0 0 6px}button{font:inherit;min-height:44px;margin:6px 6px 0 0;padding:6px 12px;background:var(--card-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px}button:focus-visible{outline:2px solid var(--primary-color)}:disabled{opacity:.5}small{display:block;color:var(--secondary-text-color)}`;
}
