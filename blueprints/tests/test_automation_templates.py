"""Validate example YAML and exercise its actual Jinja decision templates.

Run in a Python environment with PyYAML and Jinja2 installed. This is not a
substitute for Home Assistant's configuration check or integration testing.
"""
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
import unittest
import json

import jinja2
import yaml

ROOT = Path(__file__).resolve().parents[1]


class Input(str):
    pass


class Loader(yaml.SafeLoader):
    pass


Loader.add_constructor('!input', lambda loader, node: Input(loader.construct_scalar(node)))
PACKAGE = yaml.load((ROOT / 'packages/ventilation.yaml').read_text(), Loader=Loader)
BLUEPRINT = yaml.load((ROOT / 'automation/ventilation_demand.yaml').read_text(), Loader=Loader)
NOW = datetime(2026, 11, 4, 12, tzinfo=timezone.utc)


class States(dict):
    def __getitem__(self, key):
        return self.get(key)

    def __call__(self, key):
        state = self.get(key)
        return state.state if state else 'unknown'


def state(value, attributes=None, age=0):
    return SimpleNamespace(state=str(value), attributes=attributes or {},
                           last_reported=NOW - timedelta(seconds=age))


def render(template, states, **variables):
    def attr(entity_id, key):
        entity = states.get(entity_id)
        return entity.attributes.get(key) if entity else None

    def timestamp(value, default=0):
        if isinstance(value, datetime):
            return value.timestamp()
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def boolean(value):
        return value is True or str(value).lower() in ('true', 'on', 'yes', '1')

    env = jinja2.Environment(undefined=jinja2.StrictUndefined)
    env.filters['bool'] = boolean
    env.filters['to_json'] = json.dumps
    def from_json(text, default=None):
        try:
            return json.loads(text)
        except (TypeError, ValueError):
            return default
    env.filters['from_json'] = from_json
    env.filters['bitwise_and'] = lambda value, mask: int(value or 0) & int(mask)
    env.globals.update(states=states, is_state=lambda e, s: states(e) == s,
                       state_attr=attr, now=lambda: NOW, as_timestamp=timestamp,
                       is_number=lambda v: str(v).replace('.', '', 1).lstrip('-').isdigit(),
                       expand=lambda ids: [states[id] for id in dict.fromkeys(ids) if states[id]])
    return env.from_string(template).render(**variables).strip()


class AutomationTemplates(unittest.TestCase):
    def test_every_blueprint_input_reference_exists(self):
        references = []

        def walk(value):
            if isinstance(value, Input):
                references.append(str(value))
            elif isinstance(value, dict):
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(BLUEPRINT)
        self.assertTrue(references)
        self.assertFalse(set(references) - set(BLUEPRINT['blueprint']['input']))

    def test_all_jinja_templates_parse(self):
        count = 0

        def walk(value):
            nonlocal count
            if isinstance(value, str) and ('{{' in value or '{%' in value):
                jinja2.Environment().parse(value)
                count += 1
            elif isinstance(value, dict):
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(PACKAGE)
        walk(BLUEPRINT)
        self.assertGreater(count, 20)

    def test_restore_requires_ownership_and_no_manual_override(self):
        template = PACKAGE['script']['ventilation_end_boost']['sequence'][2]['variables']['should_restore']
        states = States({'input_boolean.ventilation_manual_override': state('off')})
        variables = {'current_snapshot': 'v1|{"value":100}', 'expected_snapshot': 'v1|{"value":100}'}
        self.assertEqual(render(template, states, **variables), 'True')
        variables['current_snapshot'] = 'v1|{"value":50}'
        self.assertEqual(render(template, states, **variables), 'False')
        variables['current_snapshot'] = variables['expected_snapshot']
        states['input_boolean.ventilation_manual_override'] = state('on')
        self.assertEqual(render(template, states, **variables), 'False')
        states['input_boolean.ventilation_manual_override'] = state('off')
        self.assertEqual(render(template, states, restore=False, **variables), 'False')

    def test_no_sensor_data_is_treated_as_safe_to_reduce(self):
        template = BLUEPRINT['conditions'][2]['value_template']
        variables = dict(co2_ids=['sensor.co2'], humidity_ids=[], max_age=900)
        for sample in [None, state('unavailable'), state(500, {'unit_of_measurement': 'ppm'}, age=901),
                       state(500, {'unit_of_measurement': 'percent'})]:
            states = States({'sensor.co2': sample})
            self.assertEqual(render(template, states, **variables), 'False')
        self.assertEqual(render(template, States({'sensor.co2': state(500, {'unit_of_measurement': 'ppm'})}),
                                **variables), 'True')
        self.assertEqual(render(template, States(), co2_ids=[], humidity_ids=[], max_age=900), 'True')

    def test_hysteresis_retains_state_between_thresholds(self):
        variables = dict(co2_ids=['sensor.co2'], humidity_ids=['sensor.rh'],
                         co2_high=1200, co2_low=900, humidity_high=70, humidity_low=60)
        templates = BLUEPRINT['actions'][0]['variables']
        for co2, humidity, high, low in [(1300, 55, True, False), (700, 80, True, False),
                                        (1000, 65, False, False), (800, 55, False, True)]:
            states = States({'sensor.co2': state(co2), 'sensor.rh': state(humidity)})
            self.assertEqual(render(templates['high_demand'], states, **variables), str(high))
            self.assertEqual(render(templates['low_demand'], states, **variables), str(low))

    def test_preset_priority_and_quiet_cap(self):
        template = BLUEPRINT['actions'][2]['variables']['target_percentage']
        variables = dict(preset_entity='input_select.mode', demand_entity='input_boolean.demand',
                         away_ids=['input_boolean.away'], quiet_ids=['input_boolean.quiet'],
                         base_speed=50, demand_speed=100, away_speed=25, quiet_speed=40)
        states = States({'input_select.mode': state('Auto'), 'input_boolean.demand': state('on'),
                         'input_boolean.away': state('off'), 'input_boolean.quiet': state('off')})
        self.assertEqual(render(template, states, **variables), '100')
        states['input_boolean.quiet'] = state('on')
        self.assertEqual(render(template, states, **variables), '40')
        states['input_boolean.away'] = state('on')
        self.assertEqual(render(template, states, **variables), '25')
        states['input_select.mode'] = state('Home')
        self.assertEqual(render(template, states, **variables), '50')

    def test_command_gate_respects_manual_boost_and_minimum_interval(self):
        variables = dict(enabled_entity='input_boolean.enabled', override_entity='input_boolean.override',
                         boost_entity='input_boolean.boost', preset_entity='input_select.mode',
                         demand_entity='input_boolean.demand', fan_entity='fan.ventilation',
                         last_change_entity='input_datetime.last', co2_low=900, co2_high=1200,
                         humidity_low=60, humidity_high=70, base_speed=50, demand_speed=100,
                         min_interval=300, target_percentage=100, target_value=100)
        states = States({'input_boolean.enabled': state('on'), 'input_boolean.override': state('off'),
                         'input_boolean.boost': state('off'), 'input_select.mode': state('Auto'),
                         'input_boolean.demand': state('on'),
                         'input_datetime.last': state('2026-11-04', {'timestamp': NOW.timestamp() - 400}),
                         'fan.ventilation': state('on', {'percentage': 50})})
        first_gate = BLUEPRINT['conditions'][0]['value_template']
        command_gate = BLUEPRINT['actions'][3]['value_template']
        self.assertEqual(render(first_gate, states, **variables), 'True')
        self.assertEqual(render(command_gate, states, **variables), 'True')
        states['fan.ventilation'].attributes['percentage'] = 100
        self.assertEqual(render(command_gate, states, **variables), 'False')
        states['input_boolean.override'] = state('on')
        self.assertEqual(render(first_gate, states, **variables), 'False')
        states['input_boolean.override'] = state('off')
        states['input_boolean.boost'] = state('on')
        self.assertEqual(render(command_gate, states, **variables), 'False')
        states['input_boolean.boost'] = state('off')
        states['input_datetime.last'].attributes['timestamp'] = NOW.timestamp() - 100
        self.assertEqual(render(first_gate, states, **variables), 'False')

    def test_missing_optional_helper_freezes_controller(self):
        template = BLUEPRINT['conditions'][1]['value_template']
        self.assertEqual(render(template, States(), away_ids=[], quiet_ids=[]), 'True')
        self.assertEqual(render(template, States(), away_ids=['input_boolean.away'], quiet_ids=[]), 'False')
        self.assertEqual(render(template, States({'input_boolean.away': state('unknown')}),
                                away_ids=['input_boolean.away'], quiet_ids=[]), 'False')
        self.assertEqual(render(template, States({'input_boolean.away': state('off')}),
                                away_ids=['input_boolean.away'], quiet_ids=[]), 'True')

    def test_restart_retry_and_manual_priority_are_present(self):
        reconcile = PACKAGE['automation'][0]
        self.assertTrue(PACKAGE['timer']['ventilation_boost']['restore'])
        self.assertIn('homeassistant', [trigger['trigger'] for trigger in reconcile['triggers']])
        self.assertIn('time_pattern', [trigger['trigger'] for trigger in reconcile['triggers']])
        self.assertIn('manual_override', BLUEPRINT['conditions'][0]['value_template'].replace('override_entity', 'manual_override'))
        self.assertIn('boost_entity', BLUEPRINT['actions'][3]['value_template'])


if __name__ == '__main__':
    unittest.main()
