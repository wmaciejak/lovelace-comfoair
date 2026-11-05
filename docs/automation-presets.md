# Persistent ventilation control in Home Assistant

The optional backend runs in Home Assistant. Closing a browser or phone app does not control its timers or deadlines. The card never installs packages automatically.

For all configuration examples and feature details, see the [ventilation insights guide](ventilation-insights.md).

## Install and configure

1. Copy `blueprints/packages/ventilation.yaml` to `config/packages/ventilation.yaml`.
2. Enable packages under your existing `homeassistant` section if necessary:

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

3. Run HA's configuration check before a reload or restart.
4. Configure `input_text.ventilation_target` with your real fan, climate, select or input_select entity ID.
5. Configure the Boost, Home, Away and Quiet raw-value helpers for that device.
6. Exercise explicit commands and restoration before enabling automatic control.

For `climate.*`, map actual fan modes such as `low`, `medium` and `high`. For a select, use the exact advertised options. For `fan.*`, supply valid percentages. A motor duty sensor is not a controllable fan. Helpers retain their configured values across restarts; unconfigured helpers do not produce valid commands.

Do not install multiple copies with the same helper names. When upgrading the original fan-only package, configure the new target/value helpers and review obsolete helper references before removing them.

## Card/backend contract

| Entity | Function |
| --- | --- |
| `script.ventilation_boost` | Start or extend boost, with `duration` of 15, 30 or 60 minutes. |
| `script.ventilation_cancel_boost` | Cancel boost and restore the original snapshot only while the backend owns the current setting. |
| `timer.ventilation_boost` | Countdown display for the card. |
| `input_boolean.ventilation_manual_override` | Prevent automatic control and boost restoration. |
| `input_text.ventilation_target` | Actual target entity. |
| `input_text.ventilation_boost_value` | Raw boost command value. |
| `input_text.ventilation_home_value`, `ventilation_away_value`, `ventilation_quiet_value` | Explicit preset values. |
| `input_select.ventilation_preset` | Auto, Home, Away, Quiet, or Manual mode. |
| `input_boolean.ventilation_automation_enabled` | Opt-in demand control, disabled at startup. |
| `sensor.ventilation_controller` | Reported controller source with detail attributes. |

Boost snapshots the original state, value and fan preset. Extension retains the original snapshot. A changed reported setting relinquishes ownership and enables manual override. Startup and 15-second reconciliation handle expired deadlines and device recovery. A different setting made while HA was offline prevents restoration. An external change back to the identical setting is not observable.

The backend uses `fan.set_percentage`, `climate.set_fan_mode`, or the selector's `select_option` action. Climate restoration does not force an HVAC mode. Commands must match advertised capabilities/options. A command that does not reach its reported value produces a script timeout; inspect HA traces.

Home/Away/Quiet buttons explicitly cancel boost without restoration and apply their mapped value. Manual prevents automatic changes and cancels boost. Auto selects the demand-controller mode; the separately installed demand automation must be enabled to execute it.

## Demand controller

Copy `blueprints/automation/ventilation_demand.yaml` to `config/blueprints/automation/comfoair/ventilation_demand.yaml`. Create an automation from it in HA's Blueprints interface.

Select the same target used by the package. Configure Home/Demand/Away/Quiet raw values for a non-percentage device, or percentage values for a fan. Choose optional CO₂ and relative-humidity sensors. Set high/low thresholds, maximum reporting age, and minimum command interval for your installation. The example values are not health recommendations.

Auto raises demand when any sensor reaches its high threshold. It releases demand only after all selected sensors fall to their low thresholds. Home uses the baseline; Away and Quiet use their explicit policies. Away takes priority over Quiet. Missing, stale, wrong-unit and unavailable sensors freeze commands. Sensor freshness uses actual report timestamps, so unchanged but freshly reported values remain valid.

The priority order is disabled/manual override, then boost, then selected preset/helper state, then sensor demand. For direct speed changes outside boost, enable manual override deliberately or use the temporary schedule override. Automatic control remains disabled until you enable `input_boolean.ventilation_automation_enabled`.

## Optional packages

The insights guide explains these separate files:

- `ventilation_maintenance.yaml`: service records and reminder counter.
- `ventilation_notifications.yaml`: persistent alerts, acknowledgement and recovery messages.
- `ventilation_energy.yaml`: normalized energy, daily/monthly meters and estimate tariff.
- `ventilation_airflow.yaml`: sustained deviation with grace, bypass, boost and stale-report checks.
- `ventilation_schedule.yaml`: control from UI-created Quiet/Away schedules and manual override to the next real boundary.

Configure placeholder entities before enabling any package. A schedule alone selects a preset; the enabled demand controller executes automatic changes. None of these files contains lighting automation.

Create `schedule.ventilation_quiet` and `schedule.ventilation_away` through **Settings → Devices & services → Helpers**. The package does not create YAML schedules. This permits changes through the visual schedule editor. See the [schedule setup steps](ventilation-insights.md#9-weekly-schedules).

## Validation

```bash
python3 -m venv /tmp/comfoair-automation-validation
/tmp/comfoair-automation-validation/bin/pip install Jinja2 PyYAML
/tmp/comfoair-automation-validation/bin/python -m unittest discover -s blueprints/tests
```

The tests parse YAML/Jinja and render real decision expressions for adapters, snapshots, priorities, stale data, thresholds, schedules, meters and alerts. They do not emulate the full HA automation engine or hardware. Before unattended use, run HA configuration checks and inspect actual traces for start, extension, cancellation, expiry, manual changes, restart and gateway loss. This branch does not install or activate any live configuration.

References: [HA timers](https://www.home-assistant.io/integrations/timer/), [scripts](https://www.home-assistant.io/integrations/script/), [schedules](https://www.home-assistant.io/integrations/schedule/), [alerts](https://www.home-assistant.io/integrations/alert/), [utility meters](https://www.home-assistant.io/integrations/utility_meter/).
