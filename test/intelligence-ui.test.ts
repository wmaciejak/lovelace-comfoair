// @vitest-environment happy-dom
import {afterEach,describe,it,expect,vi} from 'vitest';
import {HomeAssistant} from 'custom-card-helpers';
import {MqttComfoairIntelligence} from '../src/comfoair-intelligence';
import {MqttComfoairCardEditor} from '../src/comfoair-card-editor';
import '../src/comfoair-card';
afterEach(()=>document.body.replaceChildren());
function make(){
 const panel=document.createElement('mqttcomfoair-intelligence') as MqttComfoairIntelligence;
 const callService=vi.fn().mockResolvedValue(undefined);
 panel.hass={language:'en',states:{'sensor.days':{entity_id:'sensor.days',state:'10',attributes:{unit_of_measurement:'days'}},'script.record':{entity_id:'script.record',state:'off',attributes:{}}},callService} as unknown as HomeAssistant;
 panel.config={type:'custom:mqttcomfoair-card',entity:'climate.unit',filter_days_remaining:'sensor.days',filter_service_script:'script.record'};
 document.body.append(panel);return {panel,callService};
}
describe('insight actions',()=>{
 it('records service only after explicit confirmation and uses no counter reset service',async()=>{
 const {panel,callService}=make();await panel.updateComplete;
 panel.shadowRoot!.querySelector<HTMLButtonElement>('button')!.click();await panel.updateComplete;expect(callService).not.toHaveBeenCalled();
 const confirm=[...panel.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent==='Confirm')!;confirm.click();await panel.updateComplete;
 expect(callService).toHaveBeenCalledWith('script','turn_on',{entity_id:'script.record'});expect(callService).toHaveBeenCalledTimes(1);
 });
 it('only offers bypass actions advertised by a live selector',async()=>{
 const {panel,callService}=make();panel.config={...panel.config,summer_indoor_temperature:'sensor.days',summer_bypass_control:'select.bypass',summer_bypass_open_option:'open',summer_bypass_auto_option:'auto'};
 panel.hass={...panel.hass,states:{...panel.hass.states,'select.bypass':{entity_id:'select.bypass',state:'auto',attributes:{options:['auto']}}}} as unknown as HomeAssistant;
 await panel.updateComplete;expect(panel.shadowRoot!.textContent).not.toContain('Request bypass');
 [...panel.shadowRoot!.querySelectorAll('button')].find(b=>b.textContent==='Request automatic bypass')!.click();await panel.updateComplete;
 expect(callService).toHaveBeenCalledWith('select','select_option',{entity_id:'select.bypass',option:'auto'});
 });
 it('previews a missing entity repair without overwriting a live mapping',async()=>{
 const editor=document.createElement('mqttcomfoair-card-editor') as MqttComfoairCardEditor;
 editor.hass={language:'en',states:{'climate.unit':{entity_id:'climate.unit',state:'fan_only',attributes:{}},'sensor.new_outdoor_air_temp':{entity_id:'sensor.new_outdoor_air_temp',state:'5',attributes:{unit_of_measurement:'°C'}}},entities:{'sensor.new_outdoor_air_temp':{device_id:'esp'}}} as unknown as HomeAssistant;
 editor.setConfig({type:'custom:mqttcomfoair-card',entity:'climate.unit',tempSensor1:'sensor.old'});const changes=vi.fn();editor.addEventListener('config-changed',changes);document.body.append(editor);await editor.updateComplete;
 const select=editor.shadowRoot!.querySelector<HTMLSelectElement>('[data-profile]')!;select.value='esphome';select.dispatchEvent(new Event('change'));await editor.updateComplete;
 editor.shadowRoot!.querySelector('[data-profile-device]')!.dispatchEvent(new CustomEvent('value-changed',{detail:{value:{device:'esp'}}}));await editor.updateComplete;
 expect(changes).not.toHaveBeenCalled();expect(editor.shadowRoot!.textContent).toContain('sensor.new_outdoor_air_temp');
 editor.shadowRoot!.querySelector<HTMLButtonElement>('[data-apply-repairs]')!.click();expect(changes.mock.calls[0][0].detail.config.tempSensor1).toBe('sensor.new_outdoor_air_temp');
 });
});

it('refreshes actionable script availability on a script-only HA update',async()=>{
 const card=document.createElement('mqttcomfoair-card') as any;
 card.setConfig({type:'custom:mqttcomfoair-card',entity:'climate.unit',filter_days_remaining:'sensor.days',filter_service_script:'script.record'});
 card.hass={language:'en',states:{'climate.unit':{entity_id:'climate.unit',state:'fan_only',attributes:{}},'sensor.days':{entity_id:'sensor.days',state:'10',attributes:{unit_of_measurement:'days'}},'script.record':{entity_id:'script.record',state:'unavailable',attributes:{}}}};
 document.body.append(card);await card.updateComplete;
 const insights=card.shadowRoot.querySelector('mqttcomfoair-intelligence') as MqttComfoairIntelligence;await insights.updateComplete;
 expect(insights.shadowRoot!.querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
 card.hass={...card.hass,states:{...card.hass.states,'script.record':{entity_id:'script.record',state:'off',attributes:{}}}};
 await card.updateComplete;await insights.updateComplete;
 expect(insights.shadowRoot!.querySelector<HTMLButtonElement>('button')!.disabled).toBe(false);
});
