import {describe,it,expect} from 'vitest';
import {diagnoseConfig,repairMappings} from '../src/diagnostics';
import {ComfoairCardConfig,DetectHass} from '../src/types';
const config={type:'custom:mqttcomfoair-card',entity:'climate.unit',power:'sensor.old',tempSensor1:'sensor.wrong'} as ComfoairCardConfig;
const hass={states:{'climate.unit':{entity_id:'climate.unit',state:'fan_only',attributes:{}},'sensor.wrong':{entity_id:'sensor.wrong',state:'20',attributes:{unit_of_measurement:'W'}},'sensor.new':{entity_id:'sensor.new',state:'10',attributes:{unit_of_measurement:'W'}}}} as DetectHass;
describe('configuration diagnostics',()=>{
 it('identifies absent entities and incompatible units separately',()=>{
 expect(diagnoseConfig(hass,config)).toEqual(expect.arrayContaining([expect.objectContaining({field:'power',kind:'missing'}),expect.objectContaining({field:'tempSensor1',kind:'unit'})]));
 });
 it('only repairs absent assignments after explicit caller selection',()=>{
 const repaired=repairMappings(hass,config,{power:'sensor.new',tempSensor1:'sensor.new'});
 expect(repaired.power).toBe('sensor.new');expect(repaired.tempSensor1).toBe('sensor.wrong');expect(config.power).toBe('sensor.old');
 });
 it('does not replace unavailable devices or use nonexistent replacement entities',()=>{
 const offline={...hass,states:{...hass.states,'sensor.old':{entity_id:'sensor.old',state:'unavailable',attributes:{unit_of_measurement:'W'}}}};
 expect(repairMappings(offline,config,{power:'sensor.new'}).power).toBe('sensor.old');
 expect(repairMappings(hass,config,{power:'sensor.not_real'}).power).toBe('sensor.old');
 });
 it('checks units for period energy and summer advice assignments',()=>{
 const issues=diagnoseConfig(hass,{...config,energy_day:'sensor.wrong',summer_indoor_temperature:'sensor.wrong',summer_outdoor_humidity:'sensor.wrong'});
 expect(issues).toEqual(expect.arrayContaining(['energy_day','summer_indoor_temperature','summer_outdoor_humidity'].map(field=>expect.objectContaining({field,kind:'unit'}))));
 });
});
