import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.use({ hasTouch: true });

test('history supports precise inspection, bounded zoom, series selection and an actual CSV download', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/e2e/fixture.html');
  await page.evaluate(async () => {
    await customElements.whenDefined('mqttcomfoair-history');
    const history = document.createElement('mqttcomfoair-history') as any;
    history.entities = ['sensor.temperature', 'sensor.power'];
    history.language = 'pl';
    let requests = 0;
    history.hass = { states: {
      'sensor.temperature': { attributes: { friendly_name: 'Temperatura', unit_of_measurement: '°C' } },
      'sensor.power': { attributes: { friendly_name: '=unsafe,label', unit_of_measurement: 'W' } },
    }, callApi: () => {
      requests++;
      history.setAttribute('data-request-count', String(requests));
      return Promise.resolve(history.entities.map((entity_id: string) => Array.from({ length: 500 }, (_, i) => ({
        entity_id, state: i === 1 ? 'unknown' : String(i / 10), last_changed: new Date(Date.now() - 600000 + i * 1000).toISOString(),
      }))));
    } };
    document.getElementById('cards')!.replaceChildren(history);
    await history.updateComplete;
  });
  const history = page.locator('mqttcomfoair-history');
  const chart = history.locator('svg').first();
  await expect(chart).toBeVisible();
  await chart.focus();
  await chart.press('Home');
  await expect(history.locator('[data-tooltip]')).toContainText('0 °C');
  await chart.press('ArrowRight');
  await expect(history.locator('[data-tooltip]')).toContainText('Niedostępne');
  await chart.press('ArrowRight');
  await expect(history.locator('[data-tooltip]')).toContainText('0.2 °C');
  await expect(chart.locator('circle')).toHaveCount(1);
  await chart.tap();
  await expect(history.locator('[data-tooltip] time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
  const startBefore = await history.locator('.times time').first().getAttribute('datetime');
  await history.getByRole('button', { name: 'Powiększ', exact: true }).click();
  await expect(history).toHaveAttribute('data-request-count', '1');
  await expect(history.getByRole('button', { name: 'Resetuj powiększenie' })).toBeEnabled();
  await history.getByRole('button', { name: 'Resetuj powiększenie' }).click();
  await expect(history.locator('.times time').first()).toHaveAttribute('datetime', startBefore!);
  await history.locator('input[data-series="sensor.power"]').uncheck();
  await expect(history.locator('svg')).toHaveCount(1);
  const downloadPromise = page.waitForEvent('download');
  await history.getByRole('button', { name: 'Eksportuj CSV' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const csv = await readFile(path!, 'utf8');
  expect(csv.split('\r\n')).toHaveLength(502);
  expect(csv).toContain('"49.9"');
  expect(csv).toContain('"unknown"');
  expect(csv).not.toContain('sensor.power');
  await history.locator('input[data-series="sensor.power"]').check();
  const allDownloadPromise = page.waitForEvent('download');
  await history.getByRole('button', { name: 'Eksportuj CSV' }).click();
  const allDownload = await allDownloadPromise;
  const allCsv = await readFile((await allDownload.path())!, 'utf8');
  expect(allCsv).toContain('"\'=unsafe,label"');
  expect(allCsv.split('\r\n')).toHaveLength(1002);
  expect(await chart.evaluate(el => el.querySelector('polyline')?.namespaceURI)).toBe('http://www.w3.org/2000/svg');
  expect(await history.evaluate(el => el.scrollWidth <= el.getBoundingClientRect().width)).toBe(true);
});

test('pointer inspection uses the rendered plot position on a wide chart', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/e2e/fixture.html');
  await page.evaluate(async () => {
    await customElements.whenDefined('mqttcomfoair-history');
    const history = document.createElement('mqttcomfoair-history') as any;
    history.entities = ['sensor.test'];
    history.hass = { states: { 'sensor.test': { attributes: { friendly_name: 'Test', unit_of_measurement: 'W' } } },
      callApi: (_method: string, path: string) => {
        const url = new URL(path, 'http://ha');
        const end = Date.parse(url.searchParams.get('end_time')!);
        const start = Date.parse(url.pathname.split('/').pop()!);
        return Promise.resolve([[0.1, 0.3, 0.8].map(fraction => ({ entity_id: 'sensor.test', state: String(fraction * 100), last_changed: new Date(start + (end - start) * fraction).toISOString() }))]);
      },
    };
    document.getElementById('cards')!.replaceChildren(history);
  });
  const history = page.locator('mqttcomfoair-history');
  const chart = history.locator('svg');
  await expect(chart).toBeVisible();
  const point = await chart.evaluate(el => {
    const svg = el as SVGSVGElement;
    const point = svg.createSVGPoint(); point.x = 60; point.y = 30;
    const screen = point.matrixTransform(svg.getScreenCTM()!);
    return { x: screen.x, y: screen.y };
  });
  await page.mouse.click(point.x, point.y);
  await expect(history.locator('[data-tooltip]')).toContainText('10 W');
});
