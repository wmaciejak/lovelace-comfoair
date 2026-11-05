import {HassEntityLike} from './types';
import {numericState,temperatureC} from './ventilation';

export function absoluteHumidity(temperature?:HassEntityLike,humidity?:HassEntityLike):number|undefined {
 const c=temperatureC(temperature),rh=numericState(humidity);
 if(c===undefined||rh===undefined||rh<0||rh>100||humidity?.attributes.unit_of_measurement!=='%'||c< -50||c>80)return undefined;
 return 216.7*((rh/100)*6.112*Math.exp(17.62*c/(243.12+c)))/(273.15+c);
}
export function summerAdvice(indoor?:HassEntityLike,outdoor?:HassEntityLike,indoorRH?:HassEntityLike,outdoorRH?:HassEntityLike,minimumDifference=2):{status:'unknown'|'cooling'|'humid'|'warm';indoorAH?:number;outdoorAH?:number} {
 const inside=temperatureC(indoor),outside=temperatureC(outdoor),indoorAH=absoluteHumidity(indoor,indoorRH),outdoorAH=absoluteHumidity(outdoor,outdoorRH);
 if(inside===undefined||outside===undefined||indoorAH===undefined||outdoorAH===undefined||!Number.isFinite(minimumDifference)||minimumDifference<0)return {status:'unknown'};
 return {status:inside-outside<minimumDifference?'warm':outdoorAH>indoorAH?'humid':'cooling',indoorAH,outdoorAH};
}
function airflow(entity?:HassEntityLike):number|undefined {
 const raw=numericState(entity);if(raw===undefined||raw<0)return undefined;
 const unit=String(entity?.attributes.unit_of_measurement);
 if(['m³/h','m3/h'].includes(unit))return raw;
 if(unit==='L/s'||unit==='l/s')return raw*3.6;
 return undefined;
}
export function airflowBalance(supply?:HassEntityLike,extract?:HassEntityLike,baseline=0,tolerance=10):{imbalance:number;deviation:number;outside:boolean}|undefined {
 const s=airflow(supply),e=airflow(extract);
 if(s===undefined||e===undefined||s<1||e<1||!Number.isFinite(baseline)||!Number.isFinite(tolerance)||tolerance<0)return undefined;
 const imbalance=100*(s-e)/e,deviation=imbalance-baseline;
 return {imbalance,deviation,outside:Math.abs(deviation)>tolerance};
}
function kWh(entity?:HassEntityLike):number|undefined {
 const n=numericState(entity);if(n===undefined||n<0)return undefined;
 return entity?.attributes.unit_of_measurement==='kWh'?n:entity?.attributes.unit_of_measurement==='Wh'?n/1000:undefined;
}
export function energyEstimate(current?:HassEntityLike,previous?:HassEntityLike,tariff?:HassEntityLike):{current:number;previous?:number;delta?:number;cost?:number;currency?:string}|undefined {
 const value=kWh(current);if(value===undefined)return undefined;
 const prior=kWh(previous),price=numericState(tariff),unit=String(tariff?.attributes.unit_of_measurement??'');
 const currency=/^([A-Za-z]{3})\/kWh$/.exec(unit)?.[1];
 return {current:value,previous:prior,delta:prior===undefined?undefined:value-prior,cost:currency&&price!==undefined&&price>=0?value*price:undefined,currency};
}
export function entityTimestamp(entity?:HassEntityLike):number|undefined {
 if(!entity||['unknown','unavailable'].includes(entity.state))return undefined;
 const epoch=entity.attributes.timestamp;
 const value=typeof epoch==='number'?epoch*1000:Date.parse(entity.state);
 return Number.isFinite(new Date(value).getTime())?value:undefined;
}
export function filterMaintenance(daysEntity?:HassEntityLike,serviceEntity?:HassEntityLike,now=Date.now()):{days:number;due:number;lastService?:number}|undefined {
 const days=numericState(daysEntity);if(days===undefined||!Number.isFinite(now)||!['d','days'].includes(String(daysEntity?.attributes.unit_of_measurement))||!Number.isFinite(new Date(now+days*86400000).getTime()))return undefined;
 return {days,due:now+days*86400000,lastService:entityTimestamp(serviceEntity)};
}
export function reportedReason(source?:HassEntityLike,next?:HassEntityLike):{source:string;next?:number} {
 const allowed=['manual','boost','schedule','demand','device'];
 return {source:source&&allowed.includes(source.state)?source.state:'unknown',next:entityTimestamp(next)};
}
