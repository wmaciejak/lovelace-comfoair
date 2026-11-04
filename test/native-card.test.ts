// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MqttComfoairCard } from '../src/comfoair-card';
import '../src/comfoair-card';
import { HomeAssistant } from 'custom-card-helpers';
afterEach(()=>document.body.replaceChildren());
const state=(id:string,value:string,attributes:Record<string,unknown>={})=>({entity_id:id,state:value,attributes});
async function mount(config:Record<string,unknown>, states:Record<string,unknown>) {
 const card=document.createElement('mqttcomfoair-card') as MqttComfoairCard;
 const callService=vi.fn().mockResolvedValue(undefined);
 card.setConfig({type:'custom:mqttcomfoair-card',entity:'fan.native',language:'en',...config});
 card.hass={language:'en',states,callService} as unknown as HomeAssistant;
 document.body.append(card);await card.updateComplete;return {card,callService};
}
describe('native card integration',()=>{
 it('controls native percentage fan without climate helper',async()=>{
 const {card,callService}=await mount({}, {'fan.native':state('fan.native','on',{percentage:50,percentage_step:25,supported_features:1})});
 const range=card.shadowRoot!.querySelector('input')!;range.value='75';range.dispatchEvent(new Event('change'));
 await vi.waitFor(()=>expect(callService).toHaveBeenCalledWith('fan','set_percentage',{entity_id:'fan.native',percentage:75}));
 expect(card.shadowRoot!.querySelector('.setpc')).toBeNull();
 });
 it('rounds raw ESP temperature floats to one localized decimal without changing source values',async()=>{
 const {card}=await mount({tempSensor1:'sensor.temp'},{'fan.native':state('fan.native','on'),'sensor.temp':state('sensor.temp','8.60000038146973',{unit_of_measurement:'°C'})});
 expect(card.shadowRoot!.querySelector('.tempbadge .v')!.textContent).toBe('8.6');
 card.hass={...card.hass,locale:{number_format:'decimal_comma',language:'pl'}} as unknown as HomeAssistant;
 await card.updateComplete;
 expect(card.shadowRoot!.querySelector('.tempbadge .v')!.textContent).toBe('8,6');
 expect(card.hass.states['sensor.temp'].state).toBe('8.60000038146973');
 });
 it('supports a native select and only sends its advertised option',async()=>{
 const {card,callService}=await mount({entity:'select.speed'},{'select.speed':state('select.speed','2',{options:['1','2','3']})});
 const select=card.shadowRoot!.querySelector('select')!;select.value='3';select.dispatchEvent(new Event('change'));
 await vi.waitFor(()=>expect(callService).toHaveBeenCalledWith('select','select_option',{entity_id:'select.speed',option:'3'}));
 });
 it('renders real airflow units and raw numeric bypass/filter statuses',async()=>{
 const {card}=await mount({airflow_supply:'sensor.flow',bypass_valve:'sensor.bypass',bypass_mode:'positive',filterstatus:'sensor.days',filter_mode:'nonpositive',status_chips:['filter','bypass']},{'fan.native':state('fan.native','on',{}),'sensor.flow':state('sensor.flow','210',{unit_of_measurement:'m³/h'}),'sensor.bypass':state('sensor.bypass','10'),'sensor.days':state('sensor.days','-1')});
 expect(card.shadowRoot!.textContent).toContain('210 m³/h');expect(card.shadowRoot!.textContent).toContain('Replace');expect(card.shadowRoot!.textContent).toContain('Open');expect(card.shadowRoot!.querySelectorAll('.chip')).toHaveLength(2);
 });
 it('uses exchanger sensors instead of postheated supply for effectiveness',async()=>{
 const {card}=await mount({recovery_mode:'exchanger',exchanger_inlet:'sensor.in',exchanger_outlet:'sensor.out',tempSensor3:'sensor.extract',tempSensor4:'sensor.heated',bypass_valve:'binary_sensor.bypass'}, {'fan.native':state('fan.native','on'),'sensor.in':state('sensor.in','32',{unit_of_measurement:'°F'}),'sensor.out':state('sensor.out','16',{unit_of_measurement:'°C'}),'sensor.extract':state('sensor.extract','20'),'sensor.heated':state('sensor.heated','25'),'binary_sensor.bypass':state('binary_sensor.bypass','off')});
 expect(card.shadowRoot!.querySelector('.recov')!.textContent).toContain('80%');expect(card.shadowRoot!.querySelector('.recov')!.textContent).toContain('Exchanger effectiveness');
 });
 it('calls backend boost script with duration and makes history buttons keyboard native',async()=>{
 const {card,callService}=await mount({boost_script:'script.boost',tempSensor1:'sensor.in'},{'fan.native':state('fan.native','on'),'sensor.in':state('sensor.in','5')});
 [...card.shadowRoot!.querySelectorAll('button')].find(x=>x.textContent==='30 min')!.click();
 await vi.waitFor(()=>expect(callService).toHaveBeenCalledWith('script','turn_on',{entity_id:'script.boost',variables:{duration:30}}));
 expect(card.shadowRoot!.querySelector('.tempbadge')!.tagName).toBe('BUTTON');expect(card.getGridOptions()).toEqual({columns:12,rows:'auto',min_columns:6});
 });
});
