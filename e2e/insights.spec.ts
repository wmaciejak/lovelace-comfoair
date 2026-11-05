import {test,expect} from '@playwright/test';

test('insights render on mobile and issue commands only after a deliberate action',async({page})=>{
 await page.setViewportSize({width:320,height:900});await page.goto('/e2e/fixture.html');
 await page.evaluate(async()=>{
  await customElements.whenDefined('mqttcomfoair-card');
  const states:Record<string,any>={};
  const state=(id:string,value:string,unit?:string)=>{states[id]={entity_id:id,state:value,attributes:{unit_of_measurement:unit}};};
  state('climate.unit','fan_only');states['climate.unit'].attributes={supported_features:8,fan_modes:['low','high'],fan_mode:'low'};
  state('sensor.days','10','days');state('sensor.source','demand');state('sensor.day','2','kWh');state('sensor.yesterday','3','kWh');state('sensor.tariff','1.2','PLN/kWh');
  state('sensor.flow_in','210','m³/h');state('sensor.flow_out','200','m³/h');state('sensor.indoor','25','°C');state('sensor.outdoor','20','°C');state('sensor.indoor_rh','60','%');state('sensor.outdoor_rh','40','%');state('script.record','off');
  const card=document.createElement('mqttcomfoair-card') as any;
  card.setConfig({type:'custom:mqttcomfoair-card',entity:'climate.unit',language:'en',layout:'compact',status_chips:['fan'],filter_days_remaining:'sensor.days',filter_service_script:'script.record',controller_source:'sensor.source',energy_day:'sensor.day',energy_previous_day:'sensor.yesterday',energy_tariff:'sensor.tariff',airflow_supply:'sensor.flow_in',airflow_extract:'sensor.flow_out',airflow_baseline:0,summer_indoor_temperature:'sensor.indoor',summer_outdoor_temperature:'sensor.outdoor',summer_indoor_humidity:'sensor.indoor_rh',summer_outdoor_humidity:'sensor.outdoor_rh'});
  const calls:any[]=[];
  card.hass={language:'en',states,callService:(...args:any[])=>{calls.push(args);return Promise.resolve();}};
  card.addEventListener('hass-more-info',()=>{});
  (window as any).insightCalls=calls;
  document.getElementById('cards')!.append(card);await card.updateComplete;
 });
 const insights=page.locator('mqttcomfoair-intelligence');
 await expect(insights).toContainText('Demand automation');await expect(insights).toContainText('2.4 PLN');
 await expect(insights).toContainText('Outdoor air is cooler and no wetter');
 expect(await page.evaluate(()=>(window as any).insightCalls)).toEqual([]);
 await insights.getByRole('button',{name:'Record filter service',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).insightCalls)).toEqual([]);
 await insights.getByRole('button',{name:'Confirm',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).insightCalls)).toEqual([['script','turn_on',{entity_id:'script.record'}]]);
 const bounds=await insights.boundingBox();expect(bounds!.width).toBeLessThanOrEqual(320);
});
