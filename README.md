# Home Assistant Lovelace MQTT Comfoair Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=wmaciejak&repository=lovelace-comfoair&category=plugin)

A Lovelace card for visualizing and controlling a **ComfoAir CA350/550** ventilation system
connected through **[hacomfoairmqtt](https://github.com/adorobis/hacomfoairmqtt)** or the
based-on-it **comfoair2mqtt** add-on, using MQTT discovery.

<img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" alt="MQTT Comfoair Card" width="440">

## Features

- **Quick configuration:** select the climate entity to automatically detect associated sensors.
- Crossed outdoor, extract, exhaust and supply airflows with a **temperature-based color scale** (OKLCH, blue to dark red).
- **Heat recovery percentage** calculated from the current temperatures.
- Temperature setpoint controls (− / +) and fan speeds (off / 1 / 2 / 3), with the active speed highlighted.
- A labeled, color-coded status bar for the fan, filter, bypass, preheating and summer/winter mode.
- **Static or animated** airflows and fans, with fixed animation speed or speed linked to airflow.
- An optional **temperature legend**.
- Click a temperature, fan speed or airflow value to open its history in the Home Assistant more-info dialog.

## Gallery

| | Static (default) | Animated (`animation: animated`) |
|---|---|---|
| **Light** | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-light.png" width="320" alt="Static card, light theme"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-light.gif" width="320" alt="Animated card, light theme"> |
| **Dark** | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" width="320" alt="Static card, dark theme"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-dark.gif" width="320" alt="Animated card, dark theme"> |

## Installation

### HACS

The quickest way is to click **Open in HACS** above and select **Download**.

If HACS does not add the repository directly, add it as a custom repository:

1. In HACS, open **⋮ → Custom repositories**.
2. Enter `https://github.com/wmaciejak/lovelace-comfoair`, select **Dashboard**, and click **Add**.
3. Find **MQTT Comfoair Card** and select **Download**.

### Manual installation

Download `comfoair-card.js` from the [latest release](../../releases/latest) or the repository,
copy it to `config/www/lovelace-comfoair/comfoair-card.js`, and register it as a dashboard resource:

```yaml
url: /local/lovelace-comfoair/comfoair-card.js
type: module
```

## Configuration

1. In a dashboard, select **Add card → MQTT Comfoair Card**.
2. Select the climate entity, for example `climate.ca350_climate`. The card attempts to detect
   associated entities automatically. Override individual mappings under **Advanced / manual mapping**.

<img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/settings.png" alt="Card editor showing configuration options" width="460">

### Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `entity` | climate entity | – | **Required.** The ComfoAir climate entity. |
| `name` | text | “Home ventilation” | Title displayed in the card header. |
| `animation` | `static` / `animated` | `static` | Animate airflows and rotating fans. |
| `animation_speed_source` | `fixed` / `level` | `fixed` | Use a fixed speed (%) or a speed proportional to supply/return air level. |
| `animation_speed` | `10`–`200` (%) | `50` | Fixed speed, used only with `fixed`. 100% is the base speed. |
| `color_scale` | `auto` / `fixed` | `auto` | `auto` spans the current four temperatures; `fixed` uses `temp_min` and `temp_max`. |
| `temp_min` | °C | `-10` | Lower limit of the fixed scale. |
| `temp_max` | °C | `30` | Upper limit of the fixed scale. |
| `show_legend` | boolean | `false` | Show a small temperature color scale at the bottom of the card. |
| `tempSensor1..4`, `filterstatus`, `bypass_valve`, `summer_mode`, `preheat`, `fan_speed_supply`, `fan_speed_exhaust`, `return_air_level`, `supply_air_level` | entity | automatically detected | Each mapping can be overridden individually. |

### Performance

In the default `static` mode, there are **no animations**: no SMIL or CSS rotation. The card
re-renders only when a configured entity changes.

## Backward compatibility

Configurations from earlier versions continue to work without changes: configuration keys have
stayed the same, and new options are optional. To keep the old card, you can leave the older
version (`v0.15.0`) installed in HACS.

## Development and releases

```bash
npm install
npm run typecheck   # TypeScript (strict)
npm test            # Unit tests (Vitest)
npm run build       # Generate comfoair-card.js (built and committed by CI)
```

Releases run automatically. On each push to `master`, the GitHub Action builds and tests the
project, commits the freshly built `comfoair-card.js` to the repository for HACS, and creates a
release with the bundle attached. The release version comes from `version` in `package.json`
(tag `vX.Y.Z`); if that tag already exists, the patch version is incremented automatically.
Set `version` in `package.json` for an intentional minor or major version increase. You do not
need to build or commit the bundle manually.

## Notes

- The card expects the entities published by hacomfoairmqtt: `…_outside/supply/return/exhaust_temperature`,
  `…_supply/return_air_level`, `…_supply/exhaust_fan_speed`, and
  `binary_sensor.…_filter_status` / `_bypass_valve` / `_summer_mode` / `_preheating_status`.
  The device prefix, such as `ca350`, does not matter; detection primarily uses the Home Assistant device.
- **Prerequisite:** the bridge must publish the climate entity. Enable `HAEnableAutoDiscoveryClimate`
  in its `config.ini`. This entity provides fan speeds (off/low/medium/high) and the setpoint (15–27 °C).
- Compatible devices using the same bridge include StorkAir WHR930, Wernig G90-380 and Paul Santos 370 DC.
