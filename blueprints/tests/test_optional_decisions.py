from datetime import timedelta
import unittest
from test_automation_templates import ROOT, Loader, States, state, render, NOW
import yaml
import jinja2


def package(name):
    return yaml.load((ROOT / ('packages/' + name + '.yaml')).read_text(), Loader=Loader)


class OptionalDecisions(unittest.TestCase):
    def test_all_optional_template_syntax(self):
        def walk(value):
            if isinstance(value, str) and ('{{' in value or '{%' in value):
                jinja2.Environment().parse(value)
            elif isinstance(value, dict):
                for child in value.values(): walk(child)
            elif isinstance(value, list):
                for child in value: walk(child)
        for name in ['ventilation_maintenance','ventilation_energy','ventilation_airflow','ventilation_schedule','ventilation_notifications']:
            walk(package(name))

    def test_energy_normalizes_wh_and_rejects_unknown_source(self):
        sensor = package('ventilation_energy')['template'][0]['sensor'][0]
        samples = States({'sensor.ventilation_energy_total': state('2500', {'unit_of_measurement':'Wh'})})
        self.assertEqual(render(sensor['availability'], samples), 'True')
        self.assertEqual(float(render(sensor['state'], samples)), 2.5)
        samples['sensor.ventilation_energy_total'] = state('unavailable')
        self.assertEqual(render(sensor['availability'], samples), 'False')
        samples['sensor.ventilation_energy_total'] = state('20', {'unit_of_measurement':'W'})
        self.assertEqual(render(sensor['availability'], samples), 'False')

    def test_filter_reminder_uses_lead_time_without_resetting_counter(self):
        sensor = package('ventilation_maintenance')['template'][0]['binary_sensor'][0]
        samples = States({'sensor.ventilation_filter_days':state('5', {'unit_of_measurement':'days'}), 'input_number.ventilation_filter_reminder_days':state('7')})
        self.assertEqual(render(sensor['availability'], samples), 'True')
        self.assertEqual(render(sensor['state'], samples), 'True')
        samples['sensor.ventilation_filter_days'] = state('20', {'unit_of_measurement':'days'})
        self.assertEqual(render(sensor['state'], samples), 'False')
        samples['sensor.ventilation_filter_days'] = state('5', {'unit_of_measurement':'W'})
        self.assertEqual(render(sensor['availability'], samples), 'False')
        actions = package('ventilation_maintenance')['script']['ventilation_record_filter_service']['sequence']
        self.assertFalse(any(item.get('action','').startswith(('button.','climate.','fan.')) for item in actions))

    def test_first_install_has_no_recorded_service_until_count_increases(self):
        sensors = [sensor for block in package('ventilation_maintenance')['template'] for sensor in block.get('sensor', [])]
        self.assertTrue(sensors, 'Maintenance must expose a service timestamp guarded by a recorded-service count')
        sensor = sensors[0]
        samples = States({'input_number.ventilation_filter_service_count':state('0'),
            'input_datetime.ventilation_filter_last_service':state('2026-11-04 00:00:00', {'timestamp':NOW.timestamp()})})
        self.assertEqual(render(sensor['availability'],samples),'False')
        samples['input_number.ventilation_filter_service_count']=state('1')
        self.assertEqual(render(sensor['availability'],samples),'True')

    def test_balance_suppresses_grace_boost_unknown_bypass_and_stale_reports(self):
        sensor = package('ventilation_airflow')['template'][0]['binary_sensor'][0]
        samples = States({'sensor.ventilation_supply_flow':state(250, {'unit_of_measurement':'m³/h'}), 'sensor.ventilation_extract_flow':state(200, {'unit_of_measurement':'m³/h'}), 'input_number.ventilation_balance_baseline':state(0), 'input_number.ventilation_balance_tolerance':state(10), 'input_number.ventilation_airflow_max_age':state(900), 'input_boolean.ventilation_airflow_monitor_enabled':state('on'), 'input_boolean.ventilation_airflow_grace':state('off'), 'input_boolean.ventilation_boost_active':state('off'), 'binary_sensor.ventilation_bypass_open':state('off')})
        self.assertEqual(render(sensor['state'], samples), 'True')
        for entity, value in [('input_boolean.ventilation_airflow_grace','on'), ('input_boolean.ventilation_boost_active','on'), ('binary_sensor.ventilation_bypass_open','unknown')]:
            old=samples[entity]; samples[entity]=state(value)
            self.assertEqual(render(sensor['state'], samples), 'False')
            samples[entity]=old
        samples['sensor.ventilation_supply_flow']=state(250, {'unit_of_measurement':'m³/h'},age=901)
        self.assertEqual(render(sensor['state'], samples), 'False')

    def test_schedule_uses_actual_next_event_and_requires_future_boundary(self):
        script = package('ventilation_schedule')['script']['ventilation_override_to_next_boundary']['sequence']
        template = script[0]['variables']['transitions']
        samples=States({'schedule.ventilation_quiet':state('off',{'next_event':NOW+timedelta(hours=2)}),'schedule.ventilation_away':state('off',{'next_event':NOW+timedelta(hours=1)})})
        events=render(template,samples)
        self.assertIn(str((NOW+timedelta(hours=1)).timestamp()),events)
        self.assertEqual(render(script[1]['value_template'],samples,transitions=[]),'False')
        self.assertEqual(render(script[1]['value_template'],samples,transitions=[NOW.timestamp()+10]),'True')

    def test_alerts_are_opt_in_and_detect_recovery(self):
        sensor=package('ventilation_notifications')['template'][0]['binary_sensor'][0]
        samples=States({'input_boolean.ventilation_alerts_enabled':state('off')})
        self.assertEqual(render(sensor['state'],samples),'False')
        samples['input_boolean.ventilation_alerts_enabled']=state('on')
        self.assertEqual(render(sensor['state'],samples),'True')
        samples['sensor.ventilation_connection']=state('connected')
        self.assertEqual(render(sensor['state'],samples),'False')

    def test_controller_source_respects_override_and_boost_priority(self):
        sensor=package('ventilation')['template'][0]['sensor'][0]
        samples=States({'input_text.ventilation_control_reason':state('Sensor high demand'),'input_boolean.ventilation_manual_override':state('off'),'input_boolean.ventilation_boost_active':state('off')})
        self.assertEqual(render(sensor['state'],samples),'demand')
        samples['input_boolean.ventilation_boost_active']=state('on')
        self.assertEqual(render(sensor['state'],samples),'boost')
        samples['input_boolean.ventilation_manual_override']=state('on')
        self.assertEqual(render(sensor['state'],samples),'manual')

    def test_schedule_source_survives_a_demand_adapter_command(self):
        sensor=package('ventilation')['template'][0]['sensor'][0]
        samples=States({'input_text.ventilation_control_reason':state('Preset Away'),
            'input_boolean.ventilation_manual_override':state('off'),
            'input_boolean.ventilation_boost_active':state('off'),
            'input_boolean.ventilation_schedule_owned':state('on'),
            'input_boolean.ventilation_schedule_enabled':state('on')})
        self.assertEqual(render(sensor['state'],samples),'schedule')
        samples['input_boolean.ventilation_schedule_owned']=state('off')
        self.assertEqual(render(sensor['state'],samples),'manual')

if __name__ == '__main__': unittest.main()
