# Card configuration reference

[Return to the README](../README.md)

This reference covers all 84 configuration fields declared by the card. `type` and `entity` define the basic card. Other fields are optional.

Entity IDs are examples of roles. Select the actual entities from your installation. An unset optional feature does not create an entity or a backend automation. The base temperature/status positions can show unavailable values until you map their sensors.

## Basic card and visibility

| Option | Accepted value | Default / behavior |
| --- | --- | --- |
| `type` | `custom:mqttcomfoair-card` | Required card type. |
| `entity` | `climate.*`, `fan.*`, or `select.*` | Primary ventilation control entity. The integration must expose its capabilities. |
| `name` | Text | Localized card title when unset. |
| `language` | `auto`, `en`, `pl`, `de`, `nl` | Follows the HA language when unset or `auto`. Unsupported messages fall back to English. |
| `layout` | `full`, `compact` | `full`. Compact mode removes the decorative airflow graphic. |
| `show_controls` | Boolean | Enabled when unset. Controls the additional device-control section, not the primary or backend script controls. |
| `show_intelligence` | Boolean | Enabled when unset. Set `false` to hide all insight panels. |
| `show_legend` | Boolean | Hidden when unset. Shows the temperature color legend. |

The editor offers MQTT/ESPHome profiles, a device selector, previews, and diagnostics. These are editor actions rather than persistent YAML options.

Profile application fills empty assignments. Explicit repairs can replace an entity ID absent from HA. They preserve live assignments and unavailable-but-registered entities. A primary entity change clears previous sensor assignments before automatic detection.

## Temperature and recovery

| Option | Role / values | Default / behavior |
| --- | --- | --- |
| `tempSensor1` | Outdoor-air temperature sensor | Top-left temperature badge. |
| `tempSensor2` | Exhaust-air temperature sensor | Bottom-left temperature badge. |
| `tempSensor3` | Extract-air temperature sensor | Top-right badge. Use extract air entering the exchanger for exchanger calculations. |
| `tempSensor4` | Supply-air temperature sensor | Bottom-right badge. Default temperature-recovery calculation uses this sensor. |
| `recovery_mode` | `temperature`, `exchanger`, `hidden` | `temperature`. The default estimate can include heater effects. |
| `exchanger_inlet` | Air temperature at the exchanger inlet | Necessary for `exchanger` mode. |
| `exchanger_outlet` | Air temperature at the exchanger outlet | Necessary for `exchanger` mode. Use a sensor before a post-heater. |

Badges retain the sensor unit and show one decimal. Calculations normalize `°C`, `°F`, and `K`. A missing temperature unit uses Celsius in the calculation.

Exchanger mode requires a known closed bypass. It hides invalid readings, differences of 0.5°C or less, and results outside 0–100%. Temperature recovery and exchanger effectiveness do not measure energy savings.

## Fan readings and telemetry

| Option | Entity / data | Display |
| --- | --- | --- |
| `fan_speed_supply` | Sensor | Supply fan RPM. |
| `fan_speed_exhaust` | Sensor | Extract/exhaust fan RPM. |
| `supply_air_level` | Sensor | Supply fan duty in percent. |
| `return_air_level` | Sensor | Extract fan duty in percent. The legacy key name remains supported. |
| `airflow_supply` | Sensor | Actual supply airflow. Also supplies the balance calculation. |
| `airflow_extract` | Sensor | Actual extract airflow. Also supplies the balance calculation. |
| `humidity_supply` | Sensor | Supply relative humidity. |
| `humidity_extract` | Sensor | Extract relative humidity. |
| `power` | Sensor | Electrical power. |
| `energy` | Sensor | Cumulative energy. This field does not create period meters. |
| `preheater_power` | Sensor | Preheater electrical power. |
| `telemetry_order` | List of telemetry keys | Listed tiles appear first. Other mapped telemetry tiles follow. |

`telemetry_order` accepts `airflow_supply`, `airflow_extract`, `humidity_supply`, `humidity_extract`, `power`, `energy`, and `preheater_power`.

Telemetry retains the sensor's unit. Use compatible units for calculations and diagnostics. Actual airflow and fan-duty percentage are separate measurements. Select a temperature badge, fan reading, or telemetry tile to open HA's entity information.

## Status indicators

| Option | Entity / values | Default / behavior |
| --- | --- | --- |
| `filterstatus` | Binary status or numeric counter sensor | `on` means service is due in binary mode. |
| `filter_mode` | `binary`, `nonpositive` | `binary`. In `nonpositive`, zero/negative days mean service is due. |
| `bypass_valve` | Binary status or numeric sensor | `on` means open in binary mode. |
| `bypass_mode` | `binary`, `positive` | `binary`. In `positive`, values greater than zero mean open. |
| `preheat` | Binary status entity | Reports preheater activity. |
| `summer_mode` | Binary status entity | Reports summer/winter mode. |
| `status_chips` | List: `fan`, `filter`, `bypass`, `preheat`, `season` | All five indicators when unset. `[]` hides all indicators. |

Unknown and unavailable values do not appear as healthy states. A remaining-days counter does not measure filter contamination.

## Additional device controls

| Option | Accepted entity domains | Action |
| --- | --- | --- |
| `airflow_control` | `select`, `input_select` | Select an advertised airflow direction. |
| `operating_mode_control` | `select`, `input_select` | Select an advertised operating mode. |
| `boost_control` | `switch`, `input_boolean` | Enable/disable the mapped boost control. |
| `boost_duration` | `number`, `input_number` | Change the integration/helper duration value. |
| `filter_reset` | `button`, `input_button` | Press the reset action after confirmation. |
| `filter_interval` | `number`, `input_number` | Change the filter interval. |

Numeric values must match the entity's minimum, maximum, and step. Select **Apply** to send a numeric change. Translated option labels preserve the raw option value. Failed requests display an error.

A duration value alone does not implement a timer. The integration or a backend automation must own the stop deadline.

## Persistent boost and presets

| Option | Accepted entity | Behavior |
| --- | --- | --- |
| `boost_script` | `script.*` | Offers 15/30/60-minute shortcuts. Passes the selected minutes as `duration`. |
| `boost_cancel_script` | `script.*` | Offers cancellation alongside configured boost shortcuts. |
| `boost_timer` | `timer.*` | Displays the backend timer state/countdown. |
| `preset_auto_script` | `script.*` | Calls the Auto preset. |
| `preset_home_script` | `script.*` | Calls the Home preset. |
| `preset_away_script` | `script.*` | Calls the Away preset. |
| `preset_quiet_script` | `script.*` | Calls the Quiet preset. |
| `manual_override` | `input_boolean.*` | Displays manual override. Native fan/select commands enable this helper before the device command. |

The browser only displays the countdown. The optional backend owns deadlines, state snapshots, restoration checks, manual priority, and restart reconciliation. Configure its target and raw command values separately. See [persistent control](automation-presets.md).

## Filter maintenance

| Option | Entity / data | Behavior |
| --- | --- | --- |
| `filter_days_remaining` | Numeric sensor with `d` or `days` | Remaining days and an estimated due date. |
| `filter_last_service` | Timestamp sensor or recorded `input_datetime` | Last recorded service. HA helper timestamps use the absolute timestamp attribute. |
| `filter_service_script` | `script.*` | Record service after explicit confirmation. |

For the supplied package, use `sensor.ventilation_filter_last_recorded_service`. The sensor stays unavailable until the service count exceeds zero. The raw datetime helper can have an initial value before any service record exists.

Service records do not reset the device counter. The package also supplies a service count, note, reminder lead time, and HA Logbook entries. See [filter maintenance](ventilation-insights.md#3-filter-maintenance).

## Controller source and alerts

| Option | Entity / data | Behavior |
| --- | --- | --- |
| `controller_source` | State: `manual`, `boost`, `schedule`, `demand`, or `device` | Reports the source explicitly. Other values display as unknown. |
| `controller_next_transition` | Timestamp sensor or `input_datetime` | Next transition reported by the current controller. |
| `fault_entity` | `alert.*`, binary status, or a fault sensor | Device/connection alert state. |
| `fault_acknowledged` | Binary status entity | Optional explicit acknowledgement indicator. |
| `fault_ack_script` | `script.*` | Calls the mapped acknowledgement action. |

A controller source does not come from fan speed. Map the next-transition entity only when its timestamp applies to the current source. An old boost deadline is not the next schedule event.

HA alert states are `idle` for clear, `on` for active, and `off` for active/acknowledged. The optional alert package supplies persistent notifications, repeats, and a recovery message. See [alerts](ventilation-insights.md#5-fault-and-connection-alerts).

## Period energy and estimated cost

| Option | Entity / units | Behavior |
| --- | --- | --- |
| `energy_day` | Sensor, `Wh` or `kWh` | Current-day consumption. |
| `energy_previous_day` | Sensor, `Wh` or `kWh` | Previous-day comparison. |
| `energy_month` | Sensor, `Wh` or `kWh` | Current-month consumption. |
| `energy_previous_month` | Sensor, `Wh` or `kWh` | Previous-month comparison. |
| `energy_tariff` | Nonnegative numeric sensor with a unit such as `EUR/kWh` | Current-tariff cost estimate. The currency code has three letters. |

The panel converts Wh to kWh. It displays period differences and multiplies consumption by the current tariff. It does not reconstruct historical tariffs or a bill. First Utility Meter cycles can be partial. See [energy setup](ventilation-insights.md#6-energy-and-cost).

## Airflow balance

| Option | Value / entity | Default / behavior |
| --- | --- | --- |
| `airflow_baseline` | Number, percent | Calculation baseline `0`. Set this field explicitly to show the balance panel without a sustained-fault entity. |
| `airflow_tolerance` | Nonnegative number, percent | `10`. Tolerance for the comparison with the baseline. |
| `airflow_sustained_fault` | Binary status entity | Sustained-deviation state reported by the backend. Also enables the balance panel. |

The calculation uses `airflow_supply` and `airflow_extract`. It accepts `m³/h`, `m3/h`, `L/s`, and `l/s`. Imbalance is `100 × (supply − extract) / extract`. Deviation subtracts the configured baseline. Very low flow and invalid units suppress the result.

The optional package requires ten continuous minutes of deviation. Grace periods, boost, unknown/open bypass, and stale reports suppress its indication. Keep the card and backend baselines consistent. See [airflow balance](ventilation-insights.md#7-airflow-balance).

## Summer advice and bypass

| Option | Entity / value | Default / behavior |
| --- | --- | --- |
| `summer_indoor_temperature` | Indoor/extract temperature sensor | Accepts `°C`, `°F`, or `K`. |
| `summer_outdoor_temperature` | Outdoor temperature sensor | Accepts `°C`, `°F`, or `K`. |
| `summer_indoor_humidity` | Relative-humidity sensor, `%` | Must report a value from 0 to 100. |
| `summer_outdoor_humidity` | Outdoor relative-humidity sensor, `%` | Must report a value from 0 to 100. |
| `summer_minimum_difference` | Nonnegative number, Celsius difference | `2`. Minimum indoor/outdoor difference for the cooler-air advice. |
| `summer_bypass_control` | `select.*` | A real bypass-mode selector. |
| `summer_bypass_open_option` | Text | Exact advertised raw option for a bypass request. |
| `summer_bypass_auto_option` | Text | Exact advertised raw option for automatic bypass mode. |

The advisor compares temperature and absolute humidity in g/m³. It can identify cooler outdoor air that contains more moisture. It sends no automatic command. Buttons appear only for configured options that the live selector advertises. See [summer advice](ventilation-insights.md#8-summer-advice).

## Weekly schedules and temporary override

| Option | Entity | Behavior |
| --- | --- | --- |
| `schedule_entity` | `schedule.*` | Shows the schedule state and opens HA entity information. |
| `schedule_next_transition` | Timestamp sensor or `input_datetime` | Next real schedule transition. |
| `schedule_override_script` | `script.*` | Offers override until the next schedule change. |
| `manual_override_until` | Timestamp sensor or `input_datetime` | Displays the mapped manual-override deadline. |

Create the Schedule helpers in the HA interface. The supplied package requires the main control package and both Quiet/Away helpers. A future `next_event` must exist before a temporary override can start. An explicit Manual preset cancels old boundary ownership. See [weekly schedules](ventilation-insights.md#9-weekly-schedules).

## Interactive history

| Option | Value | Default / behavior |
| --- | --- | --- |
| `history_entities` | List of sensor IDs | Unset hides history. Requests use at most eight valid, unique entity IDs. |
| `history_hours` | `1`, `24`, `168` | `24`. The buttons select 1 hour, 24 hours, or 7 days. |

Recorder must retain the selected entities. Each metric has a separate value scale. Each chart shows at most 240 sampled points. Tooltips and CSV use original readings. Unavailable intervals remain gaps.

Pointer/touch and keyboard inspection show actual observation timestamps. Local zoom stays within the fetched interval. A prior steady state remains visible at the boundary. CSV includes original rows within the selected interval, not synthetic chart-boundary points.

CSV columns contain UTC timestamp, entity ID, current name, state, and current unit. Text uses quote escaping and formula-prefix protection. See [history controls](ventilation-insights.md#10-interactive-history-and-csv).

## Animation and colors

| Option | Value | Default / behavior |
| --- | --- | --- |
| `animation` | `static`, `animated` | `static`. |
| `animation_speed_source` | `fixed`, `level` | `fixed`. `level` uses the supply/extract duty sensors. |
| `animation_speed` | Number, percent | `50`. The editor offers 10–200% for fixed animation speed. |
| `color_scale` | `auto`, `fixed` | `auto`. |
| `temp_min` | Number, Celsius | `-10`. Lower limit for a fixed color scale. |
| `temp_max` | Number, Celsius | `30`. Upper limit for a fixed color scale. |

`show_legend` controls the legend. Reduced-motion preferences stop decorative fan/airflow motion. Static mode does not animate either.
