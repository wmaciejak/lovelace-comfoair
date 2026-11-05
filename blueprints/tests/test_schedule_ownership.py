"""Exercise helper ownership transitions from the real package action lists.

Only helper actions and conditions are interpreted here, not HA's script engine.
Device scripts are outside these ownership scenarios and are not invoked.
"""
import unittest
import yaml
from test_automation_templates import ROOT, Loader, States, state, render, NOW


def package(name):
    return yaml.load((ROOT / ('packages/' + name + '.yaml')).read_text(), Loader=Loader)


def matches(condition, samples, variables):
    if isinstance(condition, str):
        return render(condition, samples, **variables) == 'True'
    if condition['condition'] == 'state':
        return samples(condition['entity_id']) == condition['state']
    return render(condition['value_template'], samples, **variables) == 'True'


def helpers(sequence, samples, variables=None):
    variables = {} if variables is None else variables
    for item in sequence:
        if 'condition' in item:
            if not matches(item, samples, variables):
                return
        elif 'if' in item:
            if all(matches(part, samples, variables) for part in item['if']):
                helpers(item['then'], samples, variables)
        elif 'variables' in item:
            for name, template in item['variables'].items():
                variables[name] = render(template, samples, **variables)
        elif item.get('action', '').startswith('input_'):
            action = item['action']
            targets = item['target']['entity_id']
            for target in targets if isinstance(targets, list) else [targets]:
                if action.startswith('input_boolean.'):
                    samples[target] = state('on' if action.endswith('turn_on') else 'off')
                else:
                    value = next(iter(item['data'].values()))
                    samples[target] = state(render(value, samples, **variables))


def reconcile(samples):
    automation = package('ventilation_schedule')['automation'][0]
    if all(matches(item, samples, {}) for item in automation.get('conditions', [])):
        helpers(automation['actions'], samples)


class ScheduleOwnership(unittest.TestCase):
    def samples(self, enabled='on'):
        return States({
            'input_boolean.ventilation_schedule_enabled': state(enabled),
            'input_boolean.ventilation_override_until_boundary': state('on'),
            'input_boolean.ventilation_manual_override': state('on'),
            'input_boolean.ventilation_boost_active': state('off'),
            'input_datetime.ventilation_override_until': state('expired', {'timestamp': NOW.timestamp() - 1}),
            'schedule.ventilation_quiet': state('off'),
            'schedule.ventilation_away': state('off'),
            'input_select.ventilation_preset': state('Home'),
        })

    def test_indefinite_manual_choice_survives_old_temporary_deadline(self):
        samples = self.samples()
        helpers(package('ventilation')['script']['ventilation_preset_manual']['sequence'], samples)
        reconcile(samples)
        self.assertEqual(samples('input_boolean.ventilation_manual_override'), 'on')
        self.assertEqual(samples('input_select.ventilation_preset'), 'Manual')
        self.assertEqual(samples('input_boolean.ventilation_override_until_boundary'), 'off')

    def test_temporary_override_expires_even_if_schedule_control_is_disabled(self):
        samples = self.samples(enabled='off')
        reconcile(samples)
        self.assertEqual(samples('input_boolean.ventilation_manual_override'), 'off')
        self.assertEqual(samples('input_boolean.ventilation_override_until_boundary'), 'off')
        self.assertEqual(samples('input_select.ventilation_preset'), 'Home')


if __name__ == '__main__':
    unittest.main()
