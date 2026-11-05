/** Render documentation images from the built card, using English demo entities. */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/images');
await mkdir(output, { recursive: true });
const iconNames = ['fan', 'fan-off', 'fan-speed-1', 'fan-speed-2', 'fan-speed-3', 'hvac', 'gauge', 'tree-outline', 'home-thermometer-outline', 'export', 'import', 'air-filter', 'valve', 'radiator', 'weather-sunny', 'snowflake'];
const icons = Object.fromEntries(await Promise.all(iconNames.map(async name => {
  const response = await fetch(`https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/${name}.svg`);
  if (!response.ok) throw new Error(`Icon ${name}: HTTP ${response.status}`);
  const svg = await response.text();
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(match => match[1]);
  if (!paths.length) throw new Error(`No SVG path for ${name}`);
  return [name, paths];
})));
const license = await fetch('https://raw.githubusercontent.com/Templarian/MaterialDesign-JS/master/LICENSE');
if (!license.ok) throw new Error('Cannot fetch icon license');
await writeFile(path.join(output, 'LICENSE-MDI.txt'), await license.text());
const bundle = await readFile(path.join(root, 'comfoair-card.js'));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--primary-text-color);background:var(--canvas)}
body{--canvas:#0a111c;--card-background-color:#121f2e;--secondary-background-color:#1b2b3e;--primary-text-color:#edf3fb;--secondary-text-color:#9caec4;--divider-color:#2b3b4e;--primary-color:#3fd2bd;--rgb-primary-color:63,210,189;--disabled-text-color:#74859a;--error-color:#ff8c80;color-scheme:dark}
body.light{--canvas:#f0f4f8;--card-background-color:#fff;--secondary-background-color:#f1f5f9;--primary-text-color:#142638;--secondary-text-color:#60758a;--divider-color:#dce5ed;--primary-color:#087e8b;--rgb-primary-color:8,126,139;--disabled-text-color:#8b9baa;color-scheme:light}
#capture{width:1080px;padding:38px 40px 40px;background:radial-gradient(ellipse at 96% 0%,#16887913,transparent 60%),var(--canvas)}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:2.4px;color:var(--primary-color);margin:0 0 12px}
h1{font-size:29px;line-height:1.15;letter-spacing:-.8px;margin:0 0 9px}p.subtitle{font-size:14px;color:var(--secondary-text-color);margin:0 0 26px;line-height:1.5}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}.label{font-size:11px;letter-spacing:1.4px;font-weight:700;color:var(--secondary-text-color);margin:0 0 10px}
.wrap{min-width:0}.panel{display:block;padding:18px 20px}.panel h2{font-size:16px;letter-spacing:-.2px;margin:0 0 4px}
.foot{margin:22px 0 0;color:var(--secondary-text-color);font-size:11px;letter-spacing:.2px}.wide{width:100%}mqttcomfoair-card{display:block}
</style></head><body><main id="capture"></main><script type="module" src="/comfoair-card.js"></script></body></html>`;
const server = createServer((request, response) => {
  response.setHeader('Content-Type', request.url === '/comfoair-card.js' ? 'application/javascript' : 'text/html');
  response.end(request.url === '/comfoair-card.js' ? bundle : html);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1600 }, deviceScaleFactor: 2, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(async icons => {
    Date.now = () => Date.parse('2026-11-05T18:30:00Z');
    customElements.define('ha-card', class extends HTMLElement {
      constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{display:block;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:18px;box-shadow:0 10px 28px #0000000b;color:var(--primary-text-color)}</style><slot></slot>'; }
    });
    customElements.define('ha-icon', class extends HTMLElement {
      static get observedAttributes() { return ['icon']; }
      constructor() { super(); this.attachShadow({ mode: 'open' }); }
      connectedCallback() { this.draw(); }
      attributeChangedCallback() { this.draw(); }
      draw() {
        this.shadowRoot.innerHTML = '<style>:host{display:inline-flex;align-items:center;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);flex:none}svg{width:100%;height:100%;fill:currentColor}</style><svg viewBox="0 0 24 24" aria-hidden="true">' + (icons[(this.getAttribute('icon') ?? '').replace('mdi:', '')] ?? icons.fan).map(d => '<path d="' + d + '"></path>').join('') + '</svg>';
      }
    });
    await customElements.whenDefined('mqttcomfoair-card');
    const states = {};
    const entity = (id, value, unit, attributes = {}) => { states[id] = { entity_id: id, state: String(value), attributes: { unit_of_measurement: unit, ...attributes } }; };
    entity('climate.demo', 'fan_only', undefined, { supported_features: 9, temperature: 20, min_temp: 15, max_temp: 25, target_temp_step: 1, fan_modes: ['off', 'low', 'medium', 'high'], fan_mode: 'medium' });
    entity('fan.demo', 'on', undefined, { supported_features: 1, percentage: 55, percentage_step: 5 });
    for (const [id, value, unit] of [['outdoor',7.8,'°C'],['exhaust',9.9,'°C'],['extract',22.4,'°C'],['supply',20.6,'°C'],['inlet',7.8,'°C'],['outlet',20.6,'°C'],['supply_rpm',1284,'rpm'],['extract_rpm',1246,'rpm'],['supply_duty',55,'%'],['extract_duty',54,'%'],['supply_flow',220,'m³/h'],['extract_flow',210,'m³/h'],['supply_rh',43,'%'],['extract_rh',51,'%'],['power',38.4,'W'],['energy',126.8,'kWh'],['heater_power',0,'W'],['days',42,'days'],['day',1.32,'kWh'],['previous_day',1.6,'kWh'],['month',41.6,'kWh'],['previous_month',47.3,'kWh'],['tariff',0.28,'EUR/kWh'],['summer_indoor',25,'°C'],['summer_outdoor',19.5,'°C'],['summer_indoor_rh',55,'%'],['summer_outdoor_rh',42,'%']]) entity('sensor.' + id,value,unit);
    entity('binary_sensor.filter','off'); entity('binary_sensor.bypass','off'); entity('binary_sensor.preheat','off'); entity('binary_sensor.summer','off'); entity('binary_sensor.deviation','off');
    entity('input_boolean.manual','off'); entity('sensor.source','schedule'); entity('sensor.last_service','2026-09-24T10:15:00Z'); entity('sensor.next_transition','2026-11-05T22:00:00Z');
    entity('schedule.quiet','off'); entity('alert.attention','idle');
    entity('select.bypass','auto',undefined,{options:['auto','open']});
    for (const name of ['boost','cancel','auto','home','away','quiet','service','ack','override']) entity('script.' + name,'off');
    const hass = { language:'en',locale:{language:'en',number_format:'comma_decimal'},config:{unit_system:{temperature:'°C'}},states,callService:async()=>{},callApi:async(_method,url)=>{
      const end = Date.parse(new URL(url,'http://demo').searchParams.get('end_time'));
      return ['sensor.supply_flow','sensor.power','sensor.outdoor'].map((entity_id,index)=>Array.from({length:97},(_,i)=>({entity_id,state:i>=45&&i<=48?'unavailable':(index===0?215+12*Math.sin(i/7)+(i>64&&i<73?18:0):index===1?38+4*Math.sin(i/7)+(i>64&&i<73?14:0):8+3*Math.sin(i/18)).toFixed(1),last_changed:new Date(end-86400000+i*900000).toISOString()})));
    }};
    const base = {type:'custom:mqttcomfoair-card',entity:'climate.demo',name:'Whole-home ventilation',language:'en',animation:'static',show_legend:true,tempSensor1:'sensor.outdoor',tempSensor2:'sensor.exhaust',tempSensor3:'sensor.extract',tempSensor4:'sensor.supply',fan_speed_supply:'sensor.supply_rpm',fan_speed_exhaust:'sensor.extract_rpm',supply_air_level:'sensor.supply_duty',return_air_level:'sensor.extract_duty',filterstatus:'binary_sensor.filter',bypass_valve:'binary_sensor.bypass',preheat:'binary_sensor.preheat',summer_mode:'binary_sensor.summer',recovery_mode:'exchanger',exchanger_inlet:'sensor.inlet',exchanger_outlet:'sensor.outlet'};
    window.demo = {hass,base};
    window.startCapture = (title, subtitle, labels) => {
      document.getElementById('capture').innerHTML='<p class="eyebrow">COMFOAIR CARD / HOME ASSISTANT</p><h1>'+title+'</h1><p class="subtitle">'+subtitle+'</p><div class="grid">'+labels.map(label=>'<div class="wrap"><p class="label">'+label+'</p><div class="slot"></div></div>').join('')+'</div><p class="foot">Repository build · English demo entities · No live device connection</p>';
    };
    window.mountCard = async (slot, config) => {
      const card=document.createElement('mqttcomfoair-card');card.setConfig({...base,...config});card.hass=hass;document.querySelectorAll('.slot')[slot].append(card);await card.updateComplete;
    };
  }, icons);
  for (const theme of ['dark', 'light']) {
    await page.evaluate(async theme => {
      document.body.className=theme==='light'?'light':'';
      window.startCapture('Your ventilation. At a glance.','Live temperatures, actual airflow and capability-aware controls.',['FULL AIRFLOW VIEW','COMPACT CONTROL VIEW']);
      await window.mountCard(0,{airflow_supply:'sensor.supply_flow',airflow_extract:'sensor.extract_flow',humidity_supply:'sensor.supply_rh',humidity_extract:'sensor.extract_rh',power:'sensor.power',energy:'sensor.energy'});
      await window.mountCard(1,{name:'Quick controls',entity:'fan.demo',layout:'compact',status_chips:['fan','filter','bypass'],show_legend:false,boost_script:'script.boost',boost_cancel_script:'script.cancel',preset_auto_script:'script.auto',preset_home_script:'script.home',preset_away_script:'script.away',preset_quiet_script:'script.quiet',manual_override:'input_boolean.manual',power:'sensor.power',preheater_power:'sensor.heater_power'});
    }, theme);
    await page.locator('#capture').screenshot({path:path.join(output,`overview-${theme}.png`)});
  }
  await page.evaluate(async()=>{
    document.body.className='';
    window.startCapture('More context. Better decisions.','Maintenance, schedules and performance insights from your mapped Home Assistant entities.',['CARE & CONTROL','PERFORMANCE & COMFORT']);
    const common={type:'custom:mqttcomfoair-card',entity:'climate.demo'};
    const configs=[{...common,filter_days_remaining:'sensor.days',filter_last_service:'sensor.last_service',filter_service_script:'script.service',controller_source:'sensor.source',controller_next_transition:'sensor.next_transition',fault_entity:'alert.attention',fault_ack_script:'script.ack',schedule_entity:'schedule.quiet',schedule_next_transition:'sensor.next_transition',schedule_override_script:'script.override'},
      {...common,energy_day:'sensor.day',energy_previous_day:'sensor.previous_day',energy_month:'sensor.month',energy_previous_month:'sensor.previous_month',energy_tariff:'sensor.tariff',airflow_supply:'sensor.supply_flow',airflow_extract:'sensor.extract_flow',airflow_baseline:0,airflow_tolerance:10,airflow_sustained_fault:'binary_sensor.deviation',summer_indoor_temperature:'sensor.summer_indoor',summer_outdoor_temperature:'sensor.summer_outdoor',summer_indoor_humidity:'sensor.summer_indoor_rh',summer_outdoor_humidity:'sensor.summer_outdoor_rh',summer_bypass_control:'select.bypass',summer_bypass_open_option:'open',summer_bypass_auto_option:'auto'}];
    for(const [i,config] of configs.entries()){
      const frame=document.createElement('ha-card');frame.className='panel';
      const panel=document.createElement('mqttcomfoair-intelligence');panel.hass=window.demo.hass;panel.config=config;panel.language='en';frame.append(panel);document.querySelectorAll('.slot')[i].append(frame);await panel.updateComplete;
    }
  });
  await page.locator('#capture').screenshot({path:path.join(output,'insights.png')});
  await page.evaluate(async()=>{
    window.startCapture('Explore every reading.','Inspect original samples, zoom into a period and export the visible data as CSV.',['INTERACTIVE HISTORY']);
    document.querySelector('.grid').style.gridTemplateColumns='1fr';
    const frame=document.createElement('ha-card');frame.className='panel';
    const history=document.createElement('mqttcomfoair-history');history.hass=window.demo.hass;history.entities=['sensor.supply_flow','sensor.power','sensor.outdoor'];history.language='en';history.hours=24;
    for(const [id,name] of [['sensor.supply_flow','Supply airflow'],['sensor.power','Electrical power'],['sensor.outdoor','Outdoor temperature']]) window.demo.hass.states[id].attributes.friendly_name=name;
    frame.append(history);document.querySelector('.slot').append(frame);await history.updateComplete;
  });
  const history = page.locator('mqttcomfoair-history');
  await history.locator('svg').first().waitFor();
  await history.locator('svg').first().press('End');
  await page.locator('#capture').screenshot({path:path.join(output,'history.png')});
  console.log('Rendered four English documentation screenshots from comfoair-card.js');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
