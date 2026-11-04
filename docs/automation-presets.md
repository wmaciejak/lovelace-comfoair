# Timed boost and ventilation presets

These optional Home Assistant examples run on the server. Closing the card or
phone app does not stop the countdown or demand controller. The card does not
install or enable automations itself.

The supplied backend targets a **fan entity supporting percentage control**.
For a select-only ESPHome controller or a legacy climate entity, adapt the fan
actions and state comparisons to that integration's options before using it.
A fan's motor duty reading is not a writable fan percentage entity.

## Install the timed boost package

1. Download [ventilation.yaml](../blueprints/packages/ventilation.yaml).
2. Replace **every** `fan.ventilation` with the entity ID of the fan you intend to
   control. Use one copy of the package per installation; helper/script names
   must also be renamed if you configure more than one fan.
3. Check that your fan accepts the requested percentages. Some fans quantize
   percentages to discrete steps: choose a valid boost percentage, and use
   valid speeds in the demand blueprint.
4. Save it as `config/packages/ventilation.yaml`. Enable packages if needed:

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

5. Run Home Assistant's configuration check before restarting. Test with your
   actual integration while watching the fan and automation traces.

No changes to a running Home Assistant installation are made by downloading
these examples. They have YAML/Jinja validation and decision-template tests,
but they are not a substitute for testing against the target integration.

## Card/backend contract

| Entity | Purpose |
| --- | --- |
| `script.ventilation_boost` | Start or extend timed boost; receives `duration` in **minutes**, one of 15, 30 or 60. |
| `script.ventilation_cancel_boost` | Cancel boost and restore its snapshot only if it still owns the fan setting. |
| `timer.ventilation_boost` | Authoritative countdown; the card can display its `finishes_at` attribute. |
| `input_boolean.ventilation_boost_active` | Indicates that a snapshot/deadline is armed. |
| `input_boolean.ventilation_manual_override` | Prevent automatic control and prevent boost restoration. Turn it off deliberately to resume. |
| `input_select.ventilation_preset` | Selected Auto, Home, Away, Quiet or Manual preset. |
| `input_boolean.ventilation_automation_enabled` | Opt-in switch for demand control; starts disabled on HA startup. |
| `input_number.ventilation_boost_percentage` | Boost command percentage; defaults to 100. |

Start boost through a standard HA script call:

```yaml
action: script.turn_on
target:
  entity_id: script.ventilation_boost
data:
  variables:
    duration: 30
```

Cancel through `script.ventilation_cancel_boost`. Use the cancel script rather
than calling `timer.cancel` directly, because the script also handles ownership
and snapshot restoration. A direct timer cancellation while boost is armed is
reconciled from the stored deadline on the next minute.

The package saves the original on/off state, percentage and preset. Extending
an existing boost keeps that original snapshot. It restores a supported preset
when one was active, otherwise it restores percentage or the previous off
state. A later fan speed/preset/on-off change relinquishes ownership after a
short settling delay, cancels boost without restoration, and enables manual
override. A wall controller change must be reflected in the HA fan entity to
be detected; choosing the exact same setting is not observable as a change.

The timer has `restore: true`. An absolute deadline and a startup/minute
reconciliation also handle expiry while HA was stopped: HA does not replay a
missed `timer.finished` event. If the gateway is unavailable, reconciliation
waits until valid readings return. The comparison with the fan's current
setting prevents overwriting a different setting made while HA was offline.
The ownership check cannot distinguish an external change back to exactly the
same percentage and preset.

A failed fan request remains visible in the script trace. Its armed deadline
will be reconciled, and restoration is skipped if ownership cannot be proven.
This package assumes the integration reports commanded percentage and preset
accurately; validate that behavior before relying on restoration.

## Demand, away and quiet control

Copy [ventilation_demand.yaml](../blueprints/automation/ventilation_demand.yaml)
to `config/blueprints/automation/comfoair/ventilation_demand.yaml`, then create an
automation from it in **Settings → Automations & scenes → Blueprints**. Select
the same fan used in the boost package and the package's helpers.

The blueprint has optional lists for CO₂ and relative humidity sensors. Leave
an unused list empty. Configure all thresholds for the rooms and sensors you
intend to control; the supplied values are examples, not recommended health
or air-quality limits. CO₂ entities must report ppm and humidity entities %.
Set the maximum reporting age to match the actual sensor update interval.

- **Auto:** raise speed when any selected sensor reaches its high threshold.
  Lower it only after every selected sensor falls to its low threshold. Values
  between thresholds retain the demand state.
- **Home:** use the configured home baseline.
- **Away:** use the configured away speed. In Auto, optional away helpers also
  select this behavior when on.
- **Quiet:** cap the demand-based speed at the configured quiet maximum. In
  Auto, optional quiet helpers also select this behavior when on. Away takes
  priority when both helper sets are on.
- **Manual:** make no automatic fan changes.

The package exposes matching scripts: `script.ventilation_preset_auto`,
`script.ventilation_preset_home`, `script.ventilation_preset_away`,
`script.ventilation_preset_quiet` and `script.ventilation_preset_manual`.
Selecting a preset takes effect on the next eligible controller run. The
manual script also cancels an active boost without restoring its snapshot.

For quiet hours, create a Home Assistant schedule and an automation/template
binary sensor that turns one selected quiet helper on during that schedule.
For presence, update a selected away helper from your presence automation.
The controller uses helper states, so these policies keep running without the
browser. Those additional schedules and presence rules are user-specific.

Automatic control is disabled until you turn on
`input_boolean.ventilation_automation_enabled`. The controller evaluates once
per minute and enforces the configured minimum interval between changes. The
priority order is **disabled/manual override → timed boost → selected preset
or away/quiet helpers → sensor demand**. Direct speed changes outside a boost
need the explicit manual-override helper; otherwise Auto may change the speed
on its next eligible run.

Every selected sensor must exist, be numeric, report the expected unit and
have a recent `last_reported` timestamp. Missing, unknown, stale or unavailable
readings freeze fan commands rather than silently reducing ventilation. The
same applies to missing away/quiet helpers. A stable sensor value remains
valid when the integration continues to report it. Invalid threshold ordering
also prevents commands. With no selected sensors, Auto uses the baseline and
can still follow away/quiet helpers.

## Validation

Run the actual decision-template tests in a temporary Python environment:

```bash
python3 -m venv /tmp/comfoair-automation-validation
/tmp/comfoair-automation-validation/bin/pip install Jinja2 PyYAML
/tmp/comfoair-automation-validation/bin/python blueprints/tests/test_automation_templates.py
```

The tests cover YAML input references, Jinja syntax, ownership checks,
unknown/stale/wrong-unit sensors, hysteresis and preset priority. They do not
emulate the complete HA script engine or real fan devices. Before enabling
control, also run HA's configuration check and exercise start, extension,
cancel, expiry, restart, gateway loss and a manual fan change using automation
traces.

References: [HA timers](https://www.home-assistant.io/integrations/timer/),
[script variables](https://www.home-assistant.io/integrations/script/),
[blueprint schema](https://www.home-assistant.io/docs/blueprint/schema/),
[fan actions](https://www.home-assistant.io/integrations/fan/).
