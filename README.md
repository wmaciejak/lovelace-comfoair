# ComfoAir ventilation card for Home Assistant

A Lovelace card for ComfoAir ventilation systems, including legacy CA350/550 bridges and compatible AERISnext/ESPHome installations.
The card displays live measurements and controls the entities that your Home Assistant integration exposes.

[![HACS custom repository](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=wmaciejak&repository=lovelace-comfoair&category=plugin)

<img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" alt="ComfoAir card in a dark theme" width="440">

## Features

- Support for `climate.*`, native `fan.*`, and speed `select.*` entities.
- MQTT and ESPHome profiles with a device selector and a preview of entity assignments.
- Four temperature values, fan RPM, fan duty, and temperature-based airflow colors.
- Optional actual airflow, humidity, power, energy, and preheater power measurements.
- Temperature recovery estimates or exchanger effectiveness from separate inlet and outlet sensors.
- Binary or numeric bypass/filter status, with unavailable data identified explicitly.
- Optional airflow direction, operating mode, boost, and filter controls.
- Script-based boost shortcuts for 15, 30, or 60 minutes, plus a timer display and preset buttons.
- Optional history charts for 1 hour, 24 hours, or 7 days.
- Full and compact layouts, selectable status indicators, and configurable telemetry order.
- Static or animated airflows, reduced-motion support, and keyboard-accessible history buttons.
- English, Polish, German, and Dutch labels, with Home Assistant number-format support.

Existing climate configurations remain compatible. New features are optional.
The card does not create device capabilities or install automations.

## Installation

### HACS

1. Select **Open in HACS** above.
2. Download **MQTT Comfoair Card**.

If HACS does not find the repository, add it manually:

1. Open **HACS → ⋮ → Custom repositories**.
2. Enter `https://github.com/wmaciejak/lovelace-comfoair`.
3. Select **Dashboard**, then select **Add**.
4. Download **MQTT Comfoair Card**.

### Manual installation

1. Download `comfoair-card.js` from the [latest release](https://github.com/wmaciejak/lovelace-comfoair/releases/latest).
2. Copy the file to `config/www/lovelace-comfoair/comfoair-card.js`.
3. Add this dashboard resource as a JavaScript module:

```yaml
url: /local/lovelace-comfoair/comfoair-card.js
type: module
```

Use only one ComfoAir resource. This fork and the upstream card register the same custom elements.
Remove the previous resource entry before you add the replacement.
Reload the dashboard after an update. If the Companion app retains old labels, reset its frontend cache.

## Quick start

1. Add **MQTT Comfoair Card** to a dashboard.
2. Select the ventilation entity.
3. For profile-based setup, select **MQTT** or **ESPHome**, then select the device.
4. Review the detected entities and select **Apply detected entities**.
5. Use **Advanced / manual mapping** to adjust individual assignments.

Profile application preserves existing assignments. Automatic detection also runs when you select a different primary entity.
A primary entity change clears the previous sensor assignments before detection.

```yaml
type: custom:mqttcomfoair-card
entity: climate.ca350_climate
language: auto
animation: animated
show_legend: true
```

### Supported primary entities

| Entity | Controls |
| --- | --- |
| `climate.*` | Advertised fan modes and temperature setpoint controls, when supported. |
| `fan.*` | Percentage control, when supported, and advertised preset modes. |
| `select.*` | The entity's advertised speed options. |

The legacy MQTT bridge is [hacomfoairmqtt](https://github.com/adorobis/hacomfoairmqtt), also used by comfoair2mqtt.
For that bridge, enable `HAEnableAutoDiscoveryClimate` in `config.ini` if the climate entity is absent.
Other integrations require their own device setup.
A gateway with sensors alone cannot gain control functions from this card.

## Native ESPHome and AERISnext

The card can use native entities without synthetic climate or binary status helpers, if the integration supplies a suitable primary entity.
Replace these example IDs with your own entities:

```yaml
type: custom:mqttcomfoair-card
entity: select.ventilation_speed
language: auto
layout: full
status_chips: [fan, filter, bypass]
tempSensor1: sensor.ventilation_outdoor_air_temp
tempSensor2: sensor.ventilation_exhaust_air_temp
tempSensor3: sensor.ventilation_extract_air_temp
tempSensor4: sensor.ventilation_post_heater_temp_after
bypass_valve: sensor.ventilation_bypass_state
bypass_mode: positive
filterstatus: sensor.ventilation_days_remaining_filter
filter_mode: nonpositive
airflow_supply: sensor.ventilation_supply_fan_flow
airflow_extract: sensor.ventilation_exhaust_fan_flow
humidity_supply: sensor.ventilation_supply_air_humidity
humidity_extract: sensor.ventilation_extract_air_humidity
power: sensor.ventilation_power_consumption_current
energy: sensor.ventilation_energy_consumption_since_start
```

Use `entity: fan.ventilation` for a native fan. Retain an existing climate wrapper if your gateway has no native fan or speed selector.
Entity names vary with firmware. See the [native ventilation guide](docs/native-ventilation.md) for additional examples.

## Recovery calculations and units

`recovery_mode: temperature` is the default. It estimates temperature recovery from outdoor, extract, and supply temperatures.
Preheaters and post-heaters can influence this value. It is not a measurement of energy savings.

For exchanger effectiveness, select sensors at the exchanger inlet and outlet:

```yaml
recovery_mode: exchanger
exchanger_inlet: sensor.ventilation_pre_heater_temp_after
exchanger_outlet: sensor.ventilation_post_heater_temp_before
# tempSensor3 is the extract air entering the exchanger.
```

Confirm the sensor locations for your installation. A sensor after a post-heater is unsuitable for `exchanger_outlet`.
The calculation supports heat and cooling recovery. It remains hidden for open/unknown bypass, invalid readings, or an insufficient temperature difference.
Results outside 0–100% remain hidden. Use `recovery_mode: hidden` to hide all recovery calculations.

Temperature badges display one decimal and retain each sensor's unit.
Calculations normalize Celsius, Fahrenheit, and Kelvin to Celsius. Color-scale limits and the legend use Celsius.
Actual airflow retains its sensor unit, such as m³/h. Fan duty remains a separate percentage value.

## Status and additional controls

By default, `bypass_valve` and `filterstatus` accept binary states.
Set `bypass_mode: positive` for a numeric bypass percentage: values above zero mean open.
Set `filter_mode: nonpositive` for days remaining: zero or negative values mean the filter service is due.
This counter does not measure filter contamination.

Missing or unavailable status values do not appear as healthy states.
Unsupported climate controls remain hidden. Failed requests display an error, and command controls remain disabled during a request.

Configure optional controls under **Controls** in the visual editor:

```yaml
show_controls: true
airflow_control: select.ca350_fancontrol
operating_mode_control: select.ca350_operating_mode
boost_control: switch.ca350_boost
boost_duration: number.ca350_boost_duration
filter_reset: button.ca350_reset_filter
filter_interval: number.ca350_filter_weeks
```

| Setting | Supported domains | Function |
| --- | --- | --- |
| `airflow_control` | `select`, `input_select` | Select an advertised airflow direction. |
| `operating_mode_control` | `select`, `input_select` | Select an advertised mode. |
| `boost_control` | `switch`, `input_boolean` | Start or stop boost. |
| `boost_duration` | `number`, `input_number` | Set the duration value used by the integration or an automation. |
| `filter_reset` | `button`, `input_button` | Reset the counter after confirmation. |
| `filter_interval` | `number`, `input_number` | Set the interval within the entity's limits. |

Leave unsupported controls unset. `show_controls: false` hides this section.
Numeric changes require **Apply**. Option values reach Home Assistant unchanged, regardless of their translated display labels.
A duration helper alone does not stop a fan. The integration or a server automation must implement that behavior.

## Persistent boost and demand presets

The card can call HA scripts for boost and **Auto**, **Home**, **Away**, and **Quiet** presets:

```yaml
boost_script: script.ventilation_boost
boost_cancel_script: script.ventilation_cancel_boost
boost_timer: timer.ventilation_boost
preset_auto_script: script.ventilation_preset_auto
preset_home_script: script.ventilation_preset_home
preset_away_script: script.ventilation_preset_away
preset_quiet_script: script.ventilation_preset_quiet
manual_override: input_boolean.ventilation_manual_override
```

Boost shortcuts pass `duration` in minutes: 15, 30, or 60. The timer supplies the countdown.
The browser only displays remaining time. The HA backend owns the control deadline and restoration of the previous state.

The optional [package and blueprint](docs/automation-presets.md) provide:

- Boost extension, cancellation, restart reconciliation, and checks before restoration of the previous fan state.
- Manual override priority and detection of fan changes during boost.
- CO₂/humidity demand control with hysteresis and stale-data checks.
- Home, Away, Quiet, Auto, and Manual presets, with optional away/quiet helpers.

**The supplied backend requires a percentage-capable `fan.*` entity.** Adapt its actions and comparisons for a climate or select controller.
The card supports those domains independently of the example backend.
Install the package separately, run HA's configuration check, and validate device behavior before you enable automatic control.
The demand controller starts disabled. Configure sensor thresholds for your installation.

## Telemetry and history

Optional telemetry fields are `airflow_supply`, `airflow_extract`, `humidity_supply`, `humidity_extract`, `power`, `energy`, and `preheater_power`.
Each field accepts a sensor entity. The sensor supplies the value and unit.

```yaml
telemetry_order: [power, airflow_supply, airflow_extract, energy]
history_entities:
  - sensor.ventilation_outdoor_air_temp
  - sensor.ventilation_extract_air_temp
  - sensor.ventilation_power_consumption_current
history_hours: 24
```

`telemetry_order` places those mapped tiles first. Other mapped tiles follow afterward.
History uses the authenticated HA history API and requires Recorder data for the selected entities.
The card supports 1-hour, 24-hour, and 7-day views, plus manual refresh.

Requests contain at most eight entities and 168 hours. Each chart contains at most 240 points, with gaps for unavailable data.
The charts share a time range and use separate value scales and units.

## Layout, animation, and accessibility

```yaml
layout: compact                 # full (default) or compact
status_chips: [fan, filter, bypass]
animation: static              # static (default) or animated
animation_speed_source: fixed  # fixed (default) or level
animation_speed: 50             # 10–200%, for fixed speed
color_scale: auto               # auto (default) or fixed
temp_min: -10                   # Celsius, for a fixed color scale
temp_max: 30
show_legend: false
```

Compact mode removes decorative airflow graphics and retains the controls.
`status_chips` selects visible indicators from `fan`, `filter`, `bypass`, `preheat`, and `season`. An empty list hides all indicators.
Custom CSS is optional. Sections views use 12 columns and automatic height by default.
History buttons support keyboard access.

Reduced-motion preferences stop decorative motion.

Static mode has no airflow or fan animation. State updates concern the configured entities.
An optional boost countdown refreshes its display once per second. History requests follow range changes or manual refresh.

## Languages and number formats

Use `language: auto` to follow the HA user language. Per-card overrides accept `en`, `pl`, `de`, and `nl`.
Existing Norwegian messages remain available, with English fallback for missing translations.
For temperature badges, RPM, and fan duty, the HA profile's number format controls the decimal separator independently of the card language.
Telemetry uses the HA language locale. History charts use the card language locale.
Temperature badges use one decimal to avoid long raw sensor values. RPM and duty values retain the existing decimal-format behavior.

Localization includes work from upstream [PR #3](https://github.com/TimWeyand/lovelace-comfoair/pull/3),
[PR #4](https://github.com/TimWeyand/lovelace-comfoair/pull/4), and [PR #5](https://github.com/TimWeyand/lovelace-comfoair/pull/5).
The additional controls address [upstream issue #2](https://github.com/TimWeyand/lovelace-comfoair/issues/2).

## Gallery

These upstream images illustrate the original full layout. The optional telemetry and history sections extend that layout.

| Theme | Static | Animated |
| --- | --- | --- |
| Light | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-light.png" width="320" alt="Static card, light theme"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-light.gif" width="320" alt="Animated card, light theme"> |
| Dark | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" width="320" alt="Static card, dark theme"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-dark.gif" width="320" alt="Animated card, dark theme"> |

## Validation status

Local tests cover native controls, recovery and unit calculations, status interpretation, history responses, layouts, and localized temperature precision.
Chromium/WebKit tests cover responsive widths, unavailable entities, multiple cards, reloads, and native controls with telemetry.
The backend examples have YAML/Jinja decision-template tests. These tests do not emulate the complete HA automation engine.

Live validation on an AERISnext installation confirmed telemetry, numeric filter/bypass status, exchanger recovery display, history range changes, and compact layout.
That gateway has no native fan or speed selector. Native command execution and backend boost/demand automation remain unverified on that installation.

## Development and releases

```bash
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run test:browser
```

For the backend example tests, follow the [Python environment instructions](docs/automation-presets.md#validation).

CI checks TypeScript, unit tests, the bundle, and Chromium/WebKit tests.
On a push to `master`, the release workflow validates the project and publishes the bundle.
It uses the version in `package.json`, or increments the patch version if that tag exists.
Set the package version for an intentional minor or major release.

## Compatibility

Existing entity keys remain supported. A legacy climate configuration does not require conversion to native fan/select controls.
Legacy devices compatible with the same serial bridge include StorkAir WHR930, Wernig G90-380, and Paul Santos 370 DC.
Native AERISnext support depends on the entities and actions that the installed gateway exposes.
