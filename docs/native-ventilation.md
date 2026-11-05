# Native ventilation, telemetry and history

Existing `climate.*` configurations remain supported. The primary `entity` can now also be a native `fan.*` entity (percentage/preset controls) or `select.*` entity (advertised speed options). The card uses normal Home Assistant actions and does not create entities, translate bus protocols, or bypass integration capabilities.

## Native AERIS/ESPHome example

Replace the example IDs with entities exposed by your device. Select the device in the profile editor for a preview; existing mappings are preserved.

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
airflow_supply: sensor.ventilation_supply_air_flow
airflow_extract: sensor.ventilation_exhaust_air_flow
humidity_supply: sensor.ventilation_supply_air_humidity
humidity_extract: sensor.ventilation_extract_air_humidity
power: sensor.ventilation_power_usage
energy: sensor.ventilation_power_total
preheater_power: sensor.ventilation_preheater_power_usage
history_entities:
  - sensor.ventilation_outdoor_air_temp
  - sensor.ventilation_extract_air_temp
  - sensor.ventilation_supply_air_flow
history_hours: 24
```

A native fan can instead use `entity: fan.ventilation`. Percentage control is shown only when supported; preset options come from the fan entity. Select control options are sent unchanged. No synthetic climate or binary status helpers are required for this example. Availability and the precise entities depend on your firmware; a telemetry-only CAN gateway cannot gain write support from a dashboard card.

## Recovery and units

Temperature badges display one localized decimal and each entity's original unit. Calculations retain the full sensor precision. Color calculations convert Celsius, Fahrenheit and Kelvin to Celsius. Values must be finite numbers. Fan duty remains `%`; actual airflow and energy use the units reported by their sensor entities.

Default `recovery_mode: temperature` retains the legacy supply-temperature recovery estimate and labels it as temperature recovery. It may include pre/post-heater influence and is not an energy-saving measurement. To calculate exchanger effectiveness, use sensors physically at the exchanger inlet/outlet:

```yaml
recovery_mode: exchanger
exchanger_inlet: sensor.ventilation_pre_heater_temp_after
exchanger_outlet: sensor.ventilation_post_heater_temp_before
# tempSensor3 must be the extract air entering the exchanger
```

Confirm sensor locations against your installation. Do not use a sensor after a post-heater as `exchanger_outlet`. Effectiveness is hidden when bypass is open/unknown, readings are missing/invalid, the temperature difference is too small, or the result is outside 0–100%. Heating and cooling calculations are supported. `recovery_mode: hidden` hides the calculation entirely.

`bypass_mode: binary` (default) expects `on`/`off`. `positive` treats a numeric value greater than zero as open. `filter_mode: binary` expects `on` for due; `nonpositive` treats zero or negative days remaining as due. Missing states remain unavailable.

## History

History is optional and uses your existing authenticated Home Assistant history API. Recorder must retain the selected entities. Requests are capped at eight entities and 168 hours; series are reduced to at most 240 points. Unavailable intervals remain gaps. Each metric has its own scale and unit; the time range is aligned across charts. Use 1 hour, 24 hours, 7 days, or Refresh to request a new view. Unrelated HA state changes do not fetch history repeatedly. No external chart library or service is required.

## Boost and presets

Install and configure the [backend package/blueprint examples](automation-presets.md) separately. The card never implements the control timer in the browser.

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

Boost shortcuts call the configured script with `duration` equal to 15, 30 or 60 minutes. The optional timer supplies remaining time. The browser interval only redraws this display; it does not stop the fan. Presets call scripts, which own persistent changes. When a manual fan/select action is taken through the card and `manual_override` is configured, the card enables that helper before sending the command.

The updated backend supports native fan percentages, climate fan modes, and raw select options. Configure the target and explicit raw values before installation. See the [controller adapter and insights guide](ventilation-insights.md).

## Layout and accessibility

`telemetry_order: [power, airflow_supply, airflow_extract, energy]` orders the mapped telemetry tiles; omitted mapped tiles follow afterward. `layout: compact` removes decorative airflow graphics while keeping controls available. `layout: full` is the default. `status_chips` selects the visible indicators from `fan`, `filter`, `bypass`, `preheat`, `season`; an empty list hides all. Native Sections sizing defaults to 12 columns and automatic height. History values are keyboard-accessible buttons. Reduced-motion preferences stop fan rotation and moving airflow effects. Existing custom CSS remains optional.
