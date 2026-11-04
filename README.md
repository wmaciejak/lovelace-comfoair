## Localization and number formatting (fork)

This fork provides complete **English**, **Polish**, **German**, and **Dutch** translations for the card,
status indicators, accessible button labels, tooltips, and visual configuration editor.
Existing Norwegian messages remain available; missing translations fall back to English.

The language defaults to the Home Assistant user language. You can override it per card:

```yaml
type: custom:mqttcomfoair-card
entity: climate.your_ventilation
language: pl  # auto (default), en, pl, de, nl
```

Choose **Language / Język** in the visual editor. `auto` follows language changes in Home
Assistant without requiring sensor updates. Temperature, fan RPM and percentage values
follow the **number format** selected in the Home Assistant profile, independently of the card language.
The formatter preserves the original precision and does not add thousands separators.
Supported formats include language, system, comma_decimal, decimal_comma, space_comma,
quote_decimal and none. Without locale information, it keeps the original comma fallback.
Entity IDs, fan modes, and service calls remain unchanged.
Install this fork instead of the upstream JavaScript resource, since both
register the same custom element. After replacing the resource, reset the Companion app
frontend cache if old labels or configuration errors remain.

This implementation consolidates the English localization covered by
[upstream PR #3](https://github.com/TimWeyand/lovelace-comfoair/pull/3),
adapts the Dutch translations from [PR #4](https://github.com/TimWeyand/lovelace-comfoair/pull/4),
and incorporates the number-format helpers and regression tests from
[PR #5](https://github.com/TimWeyand/lovelace-comfoair/pull/5), while keeping Polish and
per-card language selection in the same localization system.

---

# Home Assistant Lovelace MQTT Comfoair Card

## Extended controls

The optional controls section brings airflow direction, operating mode, boost,
boost duration, filter reset and filter interval into the same card. All labels
are available in English, Polish, German and Dutch.

```yaml
type: custom:mqttcomfoair-card
entity: climate.ca350_climate
language: auto
show_controls: true
airflow_control: select.ca350_fancontrol
operating_mode_control: select.ca350_operating_mode
boost_control: switch.ca350_boost
boost_duration: number.ca350_boost_duration
filter_reset: button.ca350_reset_filter
filter_interval: number.ca350_filter_weeks
```

These are example entity IDs. Map the actual entities from your integration in
the visual editor under **Controls**. Leave unsupported controls unset; the card
only displays configured controls. `show_controls: false` hides the whole section.
Unambiguous matching entities on the same HA device are detected when creating
a card or changing the selected climate entity. For existing cards, map the new
controls manually in the editor. Missing or unavailable entities appear disabled.

| Setting | Supported entity domains | Behavior |
| --- | --- | --- |
| `airflow_control` | `select`, `input_select` | Choose an advertised option. `Both`, `In` and `Out` have translated display labels; raw values are sent unchanged. |
| `operating_mode_control` | `select`, `input_select` | Choose a supported operating mode, including auto/manual where provided. |
| `boost_control` | `switch`, `input_boolean` | Start or stop boost using explicit turn-on/turn-off actions. |
| `boost_duration` | `number`, `input_number` | Apply runtime using the entity unit, minimum, maximum and step. |
| `filter_reset` | `button`, `input_button` | Reset the filter counter after inline confirmation. |
| `filter_interval` | `number`, `input_number` | Apply the filter interval using the entity unit and limits. |

The card uses standard Home Assistant services. The integration must expose the
requested capabilities, or you can provide helpers connected to HA automations.
For example, hacomfoairmqtt exposes airflow selection, filter weeks and filter
reset; boost and auto/manual availability depend on the integration/version.
Map `boost_duration` to a number entity that the integration or an automation
uses for runtime. Timing is not implemented with a browser timer, so it must be
handled by the integration or Home Assistant. A standalone helper without an
automation only changes its own state.

Numeric changes require **Apply**, filter resets require confirmation, and
controls remain disabled while a request is pending. Failed service requests show
an error and allow retrying. Controls do not send actions during rendering or
when the dashboard is opened.

This section addresses the additional controls requested in
[upstream issue #2](https://github.com/TimWeyand/lovelace-comfoair/issues/2).

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=TimWeyand&repository=lovelace-comfoair&category=plugin)

Lovelace-Karte zur Visualisierung und Steuerung einer **ComfoAir CA350/550** Lüftungsanlage,
angebunden über **[hacomfoairmqtt](https://github.com/adorobis/hacomfoairmqtt)** (adorobis) bzw. das
darauf basierende **comfoair2mqtt**-Add-on (MQTT Autodiscovery).

<img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" alt="MQTT Comfoair Card" width="440">

## Features

- **Ein-Klick-Konfiguration:** nur die climate-Entity wählen — alle Sensoren werden automatisch erkannt.
- Gekreuzte Luftströme (Außen-/Ab-/Fort-/Zuluft) mit **temperaturbasierter Farbskala** (OKLCH, Blau→Dunkelrot).
- **Wärmerückgewinnungs-%** live aus den Temperaturen berechnet.
- Sollwert-Steuerung (− / +) und Lüfterstufen (Aus / 1 / 2 / 3) mit hervorgehobener aktiver Stufe.
- Status-Leiste (Lüfter, Filter, Bypass, Vorheizen, Sommer/Winter) — beschriftet und farblich nach Zustand.
- **Statisch oder animiert** (Luftströme + rotierende Lüfter), Tempo fest **oder** an die Luftmenge gekoppelt.
- Optional einblendbare **Temperatur-Legende**.
- Klick auf einen Wert (Temperatur / Drehzahl / Luftmenge) öffnet den **Verlauf** (HA More-Info-Dialog).

## Galerie

| | Statisch (Standard) | Animiert (`animation: animated`) |
|---|---|---|
| **Hell** | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-light.png" width="320" alt="Statisch hell"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-light.gif" width="320" alt="Animiert hell"> |
| **Dunkel** | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/static-dark.png" width="320" alt="Statisch dunkel"> | <img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/animated-dark.gif" width="320" alt="Animiert dunkel"> |

## Installation

### HACS
**Schnellster Weg:** auf den **„Open in HACS"-Button** oben klicken → öffnet das Repo in deinem
HACS, dort **Download** wählen.

Falls dein HACS das Repo nicht direkt übernimmt, einmalig als Custom Repository hinzufügen:
1. HACS → oben rechts **⋮** → **Custom repositories**
2. Repository `https://github.com/TimWeyand/lovelace-comfoair`, Kategorie **Dashboard** → **Add**
3. „MQTT Comfoair Card" → **Download**

### Manuell
`comfoair-card.js` aus dem **[letzten Release](../../releases/latest)** (oder aus dem Repo) laden
und nach `config/www/lovelace-comfoair/comfoair-card.js` kopieren, dann als Ressource registrieren:
```yaml
url: /local/lovelace-comfoair/comfoair-card.js
type: module
```

## Konfiguration

1. Dashboard → Karte hinzufügen → „MQTT Comfoair Card".
2. **Nur die climate-Entity auswählen** (z. B. `climate.ca350_climate`) — die übrigen Entities
   werden automatisch erkannt. Unter „Erweitert / manuelle Zuordnung" überschreibbar.

<img src="https://raw.githubusercontent.com/TimWeyand/lovelace-comfoair/master/images/settings.png" alt="Karten-Editor mit allen Optionen" width="460">

### Optionen

| Option | Werte | Default | Beschreibung |
|--------|-------|---------|--------------|
| `entity` | climate-Entity | – | **Pflicht.** Die ComfoAir climate-Entity. |
| `name` | Text | „Wohnraumlüftung" | Titel im Kopf der Karte. |
| `animation` | `static` / `animated` | `static` | Animierte Luftströme + rotierende Lüfter. |
| `animation_speed_source` | `fixed` / `level` | `fixed` | Tempo fest (%) oder proportional zur Luftmenge (Supply/Return Air Level). |
| `animation_speed` | `10`–`200` (%) | `50` | Festes Tempo (nur bei `fixed`). 100 % = Basistempo. |
| `color_scale` | `auto` / `fixed` | `auto` | `auto` spreizt über die aktuellen vier Temperaturen; `fixed` nutzt `temp_min`/`temp_max`. |
| `temp_min` | °C | `-10` | Untere Grenze der festen Skala. |
| `temp_max` | °C | `30` | Obere Grenze der festen Skala. |
| `show_legend` | bool | `false` | Kleine Temperatur-Farbskala unten einblenden. |
| `tempSensor1..4`, `filterstatus`, `bypass_valve`, `summer_mode`, `preheat`, `fan_speed_supply`, `fan_speed_exhaust`, `return_air_level`, `supply_air_level` | Entity | auto-erkannt | Einzeln überschreibbar. |

### Performance
Im Default (`static`) läuft **keine** Animation — kein SMIL, keine CSS-Rotation. Die Karte
rendert nur neu, wenn sich eine der konfigurierten Entities ändert.

## Abwärtskompatibilität
Konfigurationen früherer Versionen funktionieren **unverändert** weiter — die Konfig-Schlüssel
sind gleich geblieben. Neue Optionen sind optional. Wer auf der alten Karte bleiben möchte,
kann in HACS gezielt die alte Version (`v0.15.0`) installiert lassen.

## Entwicklung & Release

```bash
npm install
npm run typecheck   # TypeScript (strict)
npm test            # Unit-Tests (Vitest)
npm run build       # erzeugt comfoair-card.js (im CI gebaut + committet)
```

Releases laufen automatisch: Bei jedem Push auf `master` baut/testet die GitHub-Action, **committet
das frisch gebaute `comfoair-card.js` ins Repo** (für die HACS-Auflösung) und erstellt ein Release
inkl. angehängtem Bundle. Die Release-Version ist die `version` aus `package.json` (Tag `vX.Y.Z`);
existiert dieser Tag schon, wird automatisch die **Patch**-Version erhöht. Für gezielte
minor/major-Sprünge die `version` in `package.json` setzen. Das Bundle muss nicht von Hand gebaut/committet werden.

## Hinweise
- Erwartet die von hacomfoairmqtt publizierten Entitäten (`…_outside/supply/return/exhaust_temperature`,
  `…_supply/return_air_level`, `…_supply/exhaust_fan_speed`, `binary_sensor.…_filter_status`/`_bypass_valve`/
  `_summer_mode`/`_preheating_status`). Der Geräte-Präfix (`ca350`, …) ist egal — erkannt wird primär über das HA-Gerät.
- **Voraussetzung:** Die `climate`-Entity muss von der Bridge publiziert werden — dafür in der
  Bridge-Konfiguration (`config.ini`) `HAEnableAutoDiscoveryClimate` aktivieren. Sie liefert die
  Lüfterstufen (off/low/medium/high) und den Sollwert (15–27 °C).
- Gilt auch für kompatible Geräte über dieselbe Bridge (StorkAir WHR930, Wernig G90-380, Paul Santos 370 DC).
