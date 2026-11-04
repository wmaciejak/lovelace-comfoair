import { test, expect } from '@playwright/test';

for (const width of [320, 390, 768]) {
  test(`renders controls and values within a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/e2e/fixture.html');
    await page.evaluate(async () => {
      await customElements.whenDefined('mqttcomfoair-card');
      const card = document.createElement('mqttcomfoair-card') as any;
      card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: 'pl',
        tempSensor1: 'sensor.outdoor', tempSensor2: 'sensor.exhaust', tempSensor3: 'sensor.extract', tempSensor4: 'sensor.supply' });
      card.hass = { language: 'pl', states: {
        'climate.test': { entity_id: 'climate.test', state: 'fan_only', attributes: { supported_features: 9, temperature: 20, fan_modes: ['off','low','medium','high'], fan_mode: 'low' } },
        'sensor.outdoor': { entity_id: 'sensor.outdoor', state: '5.5', attributes: {} },
        'sensor.exhaust': { entity_id: 'sensor.exhaust', state: '11.2', attributes: {} },
        'sensor.extract': { entity_id: 'sensor.extract', state: '23.1', attributes: {} },
        'sensor.supply': { entity_id: 'sensor.supply', state: '19.9', attributes: {} },
      }, callService: () => Promise.resolve() };
      document.getElementById('cards')!.append(card);
      await card.updateComplete;
    });
    const result = await page.evaluate(() => {
      const card = document.querySelector('mqttcomfoair-card')!;
      const frame = card.getBoundingClientRect();
      const elements = [...card.shadowRoot!.querySelectorAll('.tempbadge, .corehub, .chip')];
      return elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { name: element.className, left: rect.left - frame.left, right: rect.right - frame.right };
      });
    });
    expect(result.length).toBeGreaterThan(4);
    for (const item of result) {
      expect(item.left, String(item.name)).toBeGreaterThanOrEqual(-1);
      expect(item.right, String(item.name)).toBeLessThanOrEqual(1);
    }
    await expect(page.locator('mqttcomfoair-card').getByRole('button', { name: 'Bieg 3' })).toBeVisible();
  });
}

test('renders independent card instances, including an offline climate entity', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/e2e/fixture.html');
  await page.evaluate(async () => {
    await customElements.whenDefined('mqttcomfoair-card');
    const hass = { language: 'en', states: {
      'climate.online': { entity_id: 'climate.online', state: 'fan_only', attributes: { supported_features: 8, fan_modes: ['low', 'high'], fan_mode: 'low' } },
      'climate.offline': { entity_id: 'climate.offline', state: 'unavailable', attributes: { supported_features: 9, temperature: 20, fan_modes: ['low'], fan_mode: 'low' } },
    }, callService: () => Promise.resolve() };
    for (const id of ['online', 'offline']) {
      const card = document.createElement('mqttcomfoair-card') as any;
      card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.' + id, language: 'en' });
      card.hass = hass; document.getElementById('cards')!.append(card); await card.updateComplete;
    }
  });
  const cards = page.locator('mqttcomfoair-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0).getByRole('button', { name: 'Speed 1' })).toBeVisible();
  await expect(cards.nth(1).getByRole('button')).toHaveCount(0);
  await expect(cards.nth(1)).toContainText('Unavailable');
});

test('renders translated controls and retains card functionality after a page reload', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/e2e/fixture.html');
  for (const language of ['en', 'pl', 'de', 'nl']) {
    const result = await page.evaluate(async (lang) => {
      await customElements.whenDefined('mqttcomfoair-card');
      const calls: unknown[] = [];
      const card = document.createElement('mqttcomfoair-card') as any;
      card.setConfig({ type: 'custom:mqttcomfoair-card', entity: 'climate.test', language: lang });
      card.hass = { language: lang, states: { 'climate.test': {
        entity_id: 'climate.test', state: 'fan_only', attributes: { supported_features: 8, fan_modes: ['high'], fan_mode: 'high' },
      } }, callService: (...args: unknown[]) => { calls.push(args); return Promise.resolve(); } };
      document.getElementById('cards')!.replaceChildren(card); await card.updateComplete;
      const button = card.shadowRoot!.querySelector('.fanrow button') as HTMLButtonElement;
      const label = button.getAttribute('aria-label');
      button.click();
      return { label, calls };
    }, language);
    expect(result.label).toBeTruthy();
    expect(result.calls).toEqual([['climate', 'set_fan_mode', { entity_id: 'climate.test', fan_mode: 'high' }]]);
  }
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!customElements.get('mqttcomfoair-card'))).toBe(true);
});
