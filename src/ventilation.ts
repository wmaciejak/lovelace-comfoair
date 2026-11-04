import { HassEntityLike } from './types';
export type StatusMode = 'binary' | 'positive' | 'nonpositive';
export function numericState(entity?: HassEntityLike): number | undefined {
  if (!entity || !entity.state.trim()) return undefined;
  const value = Number(entity.state);
  return Number.isFinite(value) ? value : undefined;
}
export function normalizeStatus(entity: HassEntityLike | undefined, mode: StatusMode = 'binary'): string | undefined {
  if (!entity || ['unknown','unavailable'].includes(entity.state)) return undefined;
  if (mode === 'binary') return ['on','off'].includes(entity.state) ? entity.state : undefined;
  const value = numericState(entity);
  return value === undefined ? undefined : (mode === 'positive' ? value > 0 : value <= 0) ? 'on' : 'off';
}
export function temperatureC(entity?: HassEntityLike): number | undefined {
  const value = numericState(entity);
  if (value === undefined) return undefined;
  switch (entity?.attributes.unit_of_measurement ?? '°C') {
    case '°C': return value;
    case '°F': return (value - 32) * 5 / 9;
    case 'K': return value - 273.15;
    default: return undefined;
  }
}
export function exchangerRecovery(inlet: number | undefined, extract: number | undefined, outlet: number | undefined, bypass: string | undefined): number | null {
  if (bypass !== 'off' || inlet === undefined || extract === undefined || outlet === undefined || ![inlet,extract,outlet].every(Number.isFinite)) return null;
  if (Math.abs(extract - inlet) <= 0.5) return null;
  const ratio = (outlet - inlet) / (extract - inlet);
  return ratio >= 0 && ratio <= 1 ? Math.round(ratio * 100) : null;
}
export function nativeFan(entity?: HassEntityLike): {available:boolean; running:boolean; percentage?:number; presets:string[]} {
  const available = !!entity && !['unknown','unavailable'].includes(entity.state);
  const rawPercentage=entity?.attributes.percentage;
  const percentage = rawPercentage == null || rawPercentage === '' ? NaN : Number(rawPercentage);
  return {available, running:available && entity?.state !== 'off', percentage:available && Number.isFinite(percentage) && percentage>=0 && percentage<=100 ? percentage : undefined,
    presets:Array.isArray(entity?.attributes.preset_modes) ? entity!.attributes.preset_modes.filter((x):x is string=>typeof x==='string') : []};
}
export function telemetryValue(entity?: HassEntityLike): {value:number;unit:string} | undefined {
  const value = numericState(entity);
  return value === undefined ? undefined : {value,unit:String(entity?.attributes.unit_of_measurement ?? '')};
}
