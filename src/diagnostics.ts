import {ComfoairCardConfig,DetectHass} from './types';
import {ENTITY_FIELDS} from './const';
export interface ConfigIssue {field:string;entity:string;kind:'missing'|'unavailable'|'unit';expected?:string}
const units:Record<string,string[]>={tempSensor1:['°C','°F','K'],tempSensor2:['°C','°F','K'],tempSensor3:['°C','°F','K'],tempSensor4:['°C','°F','K'],exchanger_inlet:['°C','°F','K'],exchanger_outlet:['°C','°F','K'],airflow_supply:['m³/h','m3/h','L/s','l/s'],airflow_extract:['m³/h','m3/h','L/s','l/s'],power:['W'],preheater_power:['W'],energy:['Wh','kWh'],filter_days_remaining:['d','days'],humidity_supply:['%'],humidity_extract:['%']};
for(const field of ['energy_day','energy_previous_day','energy_month','energy_previous_month'])units[field]=['Wh','kWh'];
for(const field of ['summer_indoor_temperature','summer_outdoor_temperature'])units[field]=['°C','°F','K'];
for(const field of ['summer_indoor_humidity','summer_outdoor_humidity'])units[field]=['%'];
export function diagnoseConfig(hass:DetectHass,config:ComfoairCardConfig):ConfigIssue[]{
 const issues:ConfigIssue[]=[];const values=config as unknown as Record<string,unknown>;
 for(const field of [...new Set(ENTITY_FIELDS)]){
  const id=values[field];if(typeof id!=='string'||!id)continue;
  const entity=hass.states[id];
  if(!entity){issues.push({field,entity:id,kind:'missing'});continue;}
  if(['unknown','unavailable'].includes(entity.state)){issues.push({field,entity:id,kind:'unavailable'});continue;}
  if(units[field]&&!units[field].includes(String(entity.attributes.unit_of_measurement??'')))issues.push({field,entity:id,kind:'unit',expected:units[field].join(', ')});
 }
 return issues;
}
/** Does not replace unavailable or manually configured live assignments. */
export function repairMappings(hass:DetectHass,config:ComfoairCardConfig,suggestions:Partial<ComfoairCardConfig>):ComfoairCardConfig{
 const result={...config};const out=result as unknown as Record<string,unknown>;const old=config as unknown as Record<string,unknown>;
 for(const [field,value] of Object.entries(suggestions)){
  if(!ENTITY_FIELDS.includes(field)||typeof value!=='string'||!hass.states[value])continue;
  if(!old[field]||(typeof old[field]==='string'&&!hass.states[old[field] as string]))out[field]=value;
 }
 for(const [field,mode] of [['bypass_valve','bypass_mode'],['filterstatus','filter_mode']]){
  if(out[field]!==old[field]&&(suggestions as unknown as Record<string,unknown>)[mode]!==undefined)out[mode]=(suggestions as unknown as Record<string,unknown>)[mode];
 }
 return result;
}
