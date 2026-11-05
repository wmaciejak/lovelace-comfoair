# Ventilation insights and persistent control

These features extend the existing card without changing old configurations. They do not install or enable automations in Home Assistant. New control and alert packages start disabled where they operate automatically. Configure actual entities and supported values before enabling them. No lighting automations are part of these packages.

The new insight panels provide English and Polish text. Other languages use English panel text. History controls also provide German and Dutch labels.

## 1. Fan, climate and select backend adapters

The optional `blueprints/packages/ventilation.yaml` package now supports `fan.*` percentages, `climate.*` fan modes, and `select.*` or `input_select.*` options. Configure the target and command values after installation. Unconfigured helpers do not produce valid commands:

| Helper | Example for a climate controller |
| --- | --- |
| `input_text.ventilation_target` | `climate.your_ventilation` |
| `input_text.ventilation_boost_value` | `high` |
| `input_text.ventilation_home_value` | `medium` |
| `input_text.ventilation_away_value` | `low` |
| `input_text.ventilation_quiet_value` | `low` |

Use the actual raw advertised values. A select with options `0`, `1`, `2`, `3` needs those values instead of fan-mode names. The controller does not invent a percentage conversion.

The generic apply script checks capabilities and waits for the reported value. The boost adapter stores the exact original state/value/preset. It restores the original state only while the expected snapshot still matches. Manual changes, unavailable devices, and changed ownership prevent restoration. Climate restoration changes fan mode, not HVAC mode.

Home/Away/Quiet scripts cancel an active boost without restoration and apply the corresponding raw value. Auto selects the demand-controller mode. Install and enable the demand blueprint separately for automatic commands. The blueprint accepts the same target domains, with explicit Home/Demand/Away/Quiet values for non-percentage devices. Manual override takes priority.

Existing installations of the previous example package need migration: configure the new target/value helpers and remove obsolete percentage/snapshot helpers only after checking their references. Do not install two versions of the same package or duplicate helper names. This backend is an example requiring HA configuration checks and hardware tests, not a ready-tested configuration for every gateway.

## 2. Diagnostics and repairs

The editor's **Setup diagnostics** panel lists absent or unavailable entities and incompatible measurement units. Select an integration profile and device to inspect missing and ambiguous role matches. Proposed repairs only fill empty assignments or replace IDs absent from HA. Repairs retain an unavailable but registered entity. Live manual assignments remain intact.

Select **Apply repairs** to change the assignments. Save the card separately.

Profiles recognize common ESPHome names for flow, power and total energy. Detection cannot recover arbitrary renamed sensor roles with certainty. Use manual assignments when the preview has no unambiguous candidate.

## 3. Filter maintenance

Install `blueprints/packages/ventilation_maintenance.yaml`. Replace `sensor.ventilation_filter_days` with the actual counter in days. The package supplies a last-service timestamp, service count, note, logbook record, and a configurable reminder lead time. Recording service does not reset the device counter.

```yaml
filter_days_remaining: sensor.your_filter_days
filter_last_service: sensor.ventilation_filter_last_recorded_service
filter_service_script: script.ventilation_record_filter_service
```

The estimated due date comes from the remaining-days counter. It does not measure contamination. The last-service sensor stays unavailable until the service count exceeds zero. This prevents a new datetime helper from appearing as a recorded service. Consult the service history in HA Logbook. Device counter reset remains a separate confirmed control.

## 4. Why ventilation is running

```yaml
controller_source: sensor.ventilation_controller
controller_next_transition: input_datetime.ventilation_boost_deadline
```

The backend publishes `manual`, `boost`, `schedule`, `demand` or `unknown`, plus a descriptive `detail` attribute. The panel displays this source. It does not derive the source from fan speed. Map a next-transition timestamp only when it applies. An old boost deadline is not the next schedule event.

External firmware causes can use a separate source sensor with state `device`. A wall-controller action that HA does not expose remains unknown.

## 5. Fault and connection alerts

Install `blueprints/packages/ventilation_notifications.yaml` and replace the connection, fault and filter entity placeholders. The alert uses persistent HA notifications, acknowledgement, repeat intervals, and a recovery message. It also incorporates the optional sustained airflow indicator. Enable `input_boolean.ventilation_alerts_enabled` only after confirming the mappings. The first notification waits five minutes to reduce startup/offline noise.

```yaml
fault_entity: alert.ventilation_attention
fault_ack_script: script.ventilation_acknowledge_alert
```

HA alert states are `idle` (clear), `on` (active), and `off` (active but acknowledged). The panel displays the underlying state. Acknowledgement silences repeats until the condition clears. To use mobile notifications, configure the desired notifier in the package yourself.

## 6. Energy and cost

Install `blueprints/packages/ventilation_energy.yaml`. Replace `sensor.ventilation_energy_total` with a cumulative Wh/kWh energy sensor. The package normalizes Wh to kWh, creates persistent daily/monthly Utility Meters and previous-period sensors, and supplies a configurable estimate tariff.

```yaml
energy_day: sensor.ventilation_energy_day
energy_previous_day: sensor.ventilation_previous_day_energy
energy_month: sensor.ventilation_energy_month
energy_previous_month: sensor.ventilation_previous_month_energy
energy_tariff: sensor.ventilation_estimate_tariff
```

Configure the price helper and currency unit, such as `PLN/kWh` or `EUR/kWh`. The card multiplies period consumption by the current tariff. It labels this as an estimate, not historical tariff accounting or a bill. First meter cycles and previous-period comparisons can be partial. Missing or wrong-unit data remains unknown. You can map existing tariff/energy helpers instead of installing this package.

## 7. Airflow balance

```yaml
airflow_supply: sensor.your_supply_flow
airflow_extract: sensor.your_extract_flow
airflow_baseline: 0
airflow_tolerance: 10
airflow_sustained_fault: binary_sensor.ventilation_sustained_airflow_deviation
```

Instant imbalance is `100 × (supply − extract) / extract`. Deviation subtracts the configured baseline. The calculations accept m³/h, m3/h, and L/s. Very low flow and invalid units suppress the result.

For a persistent indication, install `blueprints/packages/ventilation_airflow.yaml`. Map supply/extract sensors and a real bypass state. Configure the baseline, tolerance and report-age helpers. The monitor requires ten continuous minutes of deviation. It suppresses the condition during boost, explicit grace periods, unknown/open bypass, or stale reports.

Keep the card and backend baseline values consistent. Enable the monitor only after you confirm the expected balance for your installation. A deviation is not a diagnosis of a dirty filter or failed motor.

## 8. Summer advice

```yaml
summer_indoor_temperature: sensor.your_extract_temperature
summer_outdoor_temperature: sensor.your_outdoor_temperature
summer_indoor_humidity: sensor.your_extract_relative_humidity
summer_outdoor_humidity: sensor.your_outdoor_relative_humidity
summer_minimum_difference: 2
# Optional; use the exact advertised options of a real bypass selector:
summer_bypass_control: select.your_bypass_mode
summer_bypass_open_option: activated
summer_bypass_auto_option: auto
```

The advisor converts temperatures to Celsius and compares absolute humidity in g/m³. Relative humidity must be 0–100%. It distinguishes cooler/drier outdoor air from cooler but wetter outdoor air and insufficient temperature difference. This is advisory information, not a comfort guarantee or an automatic cooling policy.

Only mapped, advertised bypass options produce buttons. No action occurs just because advice changes. Sensor freshness and placement must be appropriate for the intended comparison.

## 9. Weekly schedules

Install `blueprints/packages/ventilation_schedule.yaml` with the main control package. The package requires two Schedule helpers that you create in the HA interface. YAML schedules cannot use the visual editor. See the [HA schedule documentation](https://www.home-assistant.io/integrations/schedule/#configuration).

1. Open **Settings → Devices & services → Helpers → Create helper → Schedule**.
2. Create a Quiet schedule and an Away schedule.
3. Set their entity IDs to `schedule.ventilation_quiet` and `schedule.ventilation_away`.
4. Set the weekly time blocks in each helper editor.
5. Check the package configuration before a reload or restart.
6. Enable `input_boolean.ventilation_schedule_enabled` after setup.

If you use other entity IDs, replace both IDs throughout the package. Do not create duplicate helpers from YAML. Away takes priority over Quiet. Neither active selects Auto. The enabled demand blueprint executes the selected mode. Home/Away/Quiet buttons can also make explicit commands separately.

```yaml
schedule_entity: schedule.ventilation_quiet
schedule_next_transition: sensor.ventilation_schedule_next_transition
manual_override_until: input_datetime.ventilation_override_until
schedule_override_script: script.ventilation_override_to_next_boundary
```

The card provides **Open schedule** and **Override until next schedule change** buttons. A real future `next_event` is necessary before a temporary override can start. Select the override button before you choose a manual speed.

The backend releases only an override that it owns at its stored boundary. The Manual preset cancels the previous boundary ownership. An indefinite Manual choice therefore survives the old deadline. Expired temporary overrides release even if you disable schedule control. The backend checks deadlines at restart and each minute. Timed boost has priority over a schedule.

## 10. Interactive history and CSV

Configure the history entities in the card:

```yaml
history_entities:
  - sensor.your_supply_flow
  - sensor.your_extract_flow
  - sensor.your_power
history_hours: 24
```

The card requests at most eight entities over 1 hour, 24 hours, or 7 days. Each chart shows at most 240 sampled points. Unavailable values produce gaps. Tooltips use the original readings, not averages of chart points.

1. Point at a chart or touch it to inspect a sample.
2. Focus the chart and use the arrow keys to inspect samples with the keyboard.
3. Use **Home** and **End** to select the first and last samples.
4. Use **Escape** to clear the sample selection.
5. Select **Zoom in**, **Zoom out**, or **Reset zoom** to change the visible interval.
6. Use the series checkboxes to select the charts for display and export.
7. Select **Export CSV** to download the visible series and time interval.

Zoom stays inside the fetched interval and does not request more history. CSV exports original rows rather than the 240 chart points. Columns contain the UTC timestamp, entity ID, name, state, and unit. Names and units reflect current entity metadata. A historical change in units requires a separate check of the source data.

CSV cells use quote escaping and UTF-8 text. Formula-like text gets an apostrophe prefix for spreadsheet safety. Numeric readings retain their numeric text. Missing values remain missing.

## Validation and installation

Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:browser`. Use the Python environment described in `automation-presets.md` to run `python -m unittest discover -s blueprints/tests` for all backend decisions. These tests render actual Jinja expressions, but do not emulate HA's full automation engine. Run HA configuration checks before package reload/restart, and validate start, cancellation, restoration, manual intervention and restart against your device before enabling any unattended control. This update does not install anything in a live HA instance.
