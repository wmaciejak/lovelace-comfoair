"""Decision-template regressions for the optional HA packages (not HA runtime tests)."""
from pathlib import Path
import unittest
import yaml
from test_automation_templates import Loader, States, state, render, NOW

ROOT = Path(__file__).resolve().parents[1]


class IntelligenceTemplates(unittest.TestCase):
    def setUp(self):
        self.package = yaml.load((ROOT / 'packages/ventilation.yaml').read_text(), Loader=Loader)

    def test_adapter_rejects_unadvertised_options_and_invalid_percentages(self):
        template = self.package['script']['ventilation_apply']['sequence'][1]['value_template']
        cases = [('fan.test', state('on', {'percentage': 50, 'supported_features': 1}), 75, True),
                 ('fan.test', state('on', {'percentage': 50, 'supported_features': 1}), 101, False),
                 ('climate.test', state('fan_only', {'fan_modes': ['low', 'high'], 'supported_features': 8}), 'high', True),
                 ('climate.test', state('fan_only', {'fan_modes': ['low', 'high'], 'supported_features': 8}), 'turbo', False),
                 ('select.test', state('2', {'options': ['0', '1', '2', '3']}), '3', True),
                 ('select.test', state('2', {'options': ['0', '1', '2', '3']}), 'high', False),
                 ('fan.test', state('on', {'percentage': 50, 'supported_features': 0}), 75, False),
                 ('climate.test', state('fan_only', {'fan_modes':['high'], 'supported_features':0}), 'high', False)]
        for entity, sample, value, expected in cases:
            with self.subTest(entity=entity, value=value):
                self.assertEqual(render(template, States({entity: sample}),
                                        target_entity=entity, requested_value=value,
                                        domain=entity.split('.')[0]), str(expected))

    def test_actual_snapshot_records_target_state_and_setting(self):
        template = self.package['script']['ventilation_capture']['sequence'][0]['variables']['snapshot']
        result = render(template, States({'select.test': state('3')}), target_entity='select.test')
        import json
        self.assertTrue(result.startswith('v1|'))
        value = json.loads(result[3:])
        self.assertEqual(value, {'entity': 'select.test', 'state': '3', 'value': '3', 'preset': ''})

    def test_manual_override_ownership_is_checked_before_restoring(self):
        template = self.package['script']['ventilation_end_boost']['sequence'][2]['variables']['should_restore']
        states = States({'input_boolean.ventilation_manual_override': state('off')})
        variables = dict(restore=True, current_snapshot='{"value":100}', expected_snapshot='{"value":100}')
        self.assertEqual(render(template, states, **variables), 'True')
        variables['current_snapshot'] = '{"value":50}'
        self.assertEqual(render(template, states, **variables), 'False')
        variables['current_snapshot'] = variables['expected_snapshot']
        states['input_boolean.ventilation_manual_override'] = state('on')
        self.assertEqual(render(template, states, **variables), 'False')

    def test_optional_packages_parse_and_no_lighting_control(self):
        for name in ['ventilation_maintenance', 'ventilation_notifications',
                     'ventilation_airflow', 'ventilation_schedule', 'ventilation_energy']:
            text = (ROOT / f'packages/{name}.yaml').read_text()
            data = yaml.load(text, Loader=Loader)
            self.assertIsInstance(data, dict)
            self.assertNotIn('light.', text)
            self.assertNotIn('light.turn', text)


if __name__ == '__main__':
    unittest.main()
