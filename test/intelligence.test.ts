import {describe,it,expect} from 'vitest';
import {absoluteHumidity,summerAdvice,airflowBalance,energyEstimate,filterMaintenance,reportedReason} from '../src/intelligence';
import {HassEntityLike} from '../src/types';
const e=(value:string,unit='')=>({entity_id:'sensor.x',state:value,attributes:{unit_of_measurement:unit}} as HassEntityLike);
describe('ventilation intelligence',()=>{
 it('computes absolute humidity from normalized temperature and valid RH',()=>{
 expect(absoluteHumidity(e('20','°C'),e('50','%'))).toBeCloseTo(8.62,1);
 expect(absoluteHumidity(e('68','°F'),e('50','%'))).toBeCloseTo(8.62,1);
 for(const rh of ['-1','101','unavailable'])expect(absoluteHumidity(e('20','°C'),e(rh,'%'))).toBeUndefined();
 expect(absoluteHumidity(e('20','°C'),e('0.5','ratio'))).toBeUndefined();
 });
 it('does not recommend cooling with wetter outdoor absolute air',()=>{
 expect(summerAdvice(e('25','°C'),e('20','°C'),e('40','%'),e('95','%'),2).status).toBe('humid');
 expect(summerAdvice(e('25','°C'),e('20','°C'),e('60','%'),e('40','%'),2).status).toBe('cooling');
 expect(summerAdvice(e('unknown','°C'),e('20','°C'),e('60','%'),e('40','%'),2).status).toBe('unknown');
 });
 it('calculates signed imbalance relative to extract and configured baseline',()=>{
 expect(airflowBalance(e('220','m³/h'),e('200','m³/h'),5,3)).toMatchObject({imbalance:10,deviation:5,outside:true});
 expect(airflowBalance(e('220','m³/h'),e('0','m³/h'),0,10)).toBeUndefined();
 expect(airflowBalance(e('200','%'),e('200','m³/h'),0,10)).toBeUndefined();
 });
 it('preserves unknown energy and calculates only with compatible units',()=>{
 expect(energyEstimate(e('2','kWh'),e('3','kWh'),e('1.2','PLN/kWh'))).toMatchObject({current:2,previous:3,cost:2.4,currency:'PLN',delta:-1});
 expect(energyEstimate(e('unknown','kWh'),e('3','kWh'),e('1','PLN/kWh'))).toBeUndefined();
 expect(energyEstimate(e('1000','Wh'),undefined,e('0.2','EUR/kWh'))).toMatchObject({current:1,cost:0.2,currency:'EUR'});
 });
 it('uses actual days counter for service due date, never fabricates history',()=>{
 expect(filterMaintenance(e('10','d'),undefined,Date.UTC(2026,0,1))).toMatchObject({days:10,due:Date.UTC(2026,0,11)});
 expect(filterMaintenance(e('unknown'),undefined,Date.now())).toBeUndefined();
 expect(filterMaintenance(e('10','W'),undefined,Date.now())).toBeUndefined();
 expect(filterMaintenance(e('1e100','days'),undefined,Date.now())).toBeUndefined();
 });
 it('only accepts explicit controller sources and timestamps',()=>{
 expect(reportedReason(e('boost'),e('2026-01-01T12:00:00Z'))).toMatchObject({source:'boost',next:Date.UTC(2026,0,1,12)});
 expect(reportedReason(e('high'))).toEqual({source:'unknown',next:undefined});
 });
 it('uses absolute HA helper timestamps when the browser has a different time zone',()=>{
 const service=e('2026-01-01 12:00:00');
 const timestamp=Date.parse(service.state)/1000-3600;
 service.attributes.timestamp=timestamp;
 expect(reportedReason(e('boost'),service).next).toBe(timestamp*1000);
 expect(filterMaintenance(e('10','days'),service)?.lastService).toBe(timestamp*1000);
 expect(reportedReason(e('boost'),{...service,state:'unavailable'}).next).toBeUndefined();
 });
});
