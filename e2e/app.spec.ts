import { test, expect, type Page } from '@playwright/test';

async function createProfile(page: Page, name = 'سارة') {
  await page.goto('/');
  const text = await page.getByTestId('gate-question').textContent();
  const [a, b] = text!.match(/\d+/g)!.map(Number);
  await page.getByTestId('gate-answer').fill(String(a * b));
  await page.getByTestId('gate-submit').click();
  await page.getByTestId('profile-name').fill(name);
  await page.getByTestId('profile-save').click();
  await page.getByTestId('profile-card-0').click();
  await expect(page.getByTestId('map')).toBeVisible();
}

async function playColorStage(page: Page) {
  await page.getByTestId('stage-color-0').click();
  for (let i = 0; i < 3; i++) await page.getByTestId('learn-next').click();
  for (const id of ['red', 'blue', 'yellow']) {
    await page.getByTestId(`left-${id}`).click();
    await page.getByTestId(`right-${id}`).click();
  }
  for (let i = 0; i < 5; i++) {
    await page.getByTestId('balloon-correct').first().click();
    await page.waitForTimeout(350);
  }
  await expect(page.getByTestId('celebration')).toBeVisible();
}

async function backToMap(page: Page) {
  await page.getByTestId('celebration-done').click();
  await page.getByTestId('companion-back').click();
}

test('full flow and persistence', async ({ page }) => {
  await createProfile(page);
  await playColorStage(page);
  await backToMap(page);
  await expect(page.getByTestId('stars')).toContainText('3');
  await page.reload();
  await page.getByTestId('profile-card-0').click();
  await expect(page.getByTestId('stars')).toContainText('3');
  await expect(page.getByTestId('stage-color-1')).toBeEnabled();
});

test('leaving mid stage restarts it, stars kept', async ({ page }) => {
  await createProfile(page);
  await playColorStage(page);
  await backToMap(page);
  await page.getByTestId('stage-color-1').click();
  await page.getByTestId('learn-next').click();
  await page.reload();
  await page.getByTestId('profile-card-0').click();
  await expect(page.getByTestId('stars')).toContainText('3');
  await page.getByTestId('stage-color-1').click();
  await expect(page.getByTestId('learn-card')).toHaveAttribute('data-item', 'green');
});

test('tracing a stroke with a finger path advances', async ({ page }) => {
  await createProfile(page);
  await page.getByTestId('stage-ar-0').click();
  for (let i = 0; i < 3; i++) await page.getByTestId('learn-next').click();
  const pad = page.getByTestId('trace-pad');
  const box = (await pad.boundingBox())!;
  const before = await pad.getAttribute('data-stroke');
  const stroke: { x: number; y: number }[] = JSON.parse(before!);
  const at = (p: { x: number; y: number }) => [box.x + (p.x / 100) * box.width, box.y + (p.y / 100) * box.height] as const;
  await page.mouse.move(...at(stroke[0]));
  await page.mouse.down();
  for (const p of stroke.slice(1)) await page.mouse.move(...at(p), { steps: 8 });
  await page.mouse.up();
  await expect(pad).not.toHaveAttribute('data-stroke', before!);
});

test('works offline after first load', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
    }
    return reg.active?.state;
  });
  await context.setOffline(true);
  await page.reload();
  await createProfile(page);
  await playColorStage(page);
  const loaded = await page.evaluate(async () => (await fetch('/art/apple.svg')).ok);
  expect(loaded).toBe(true);
});

test('no external requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173')) external.push(r.url()); });
  await createProfile(page);
  await playColorStage(page);
  expect(external).toEqual([]);
});

for (const size of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
  test(`no horizontal scroll, targets at least 64px at ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await createProfile(page);
    const check = async () => {
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        small: [...document.querySelectorAll('button')]
          .map((b) => b.getBoundingClientRect())
          .filter((b) => b.width < 64 || b.height < 64).length,
      }));
      expect(r).toEqual({ overflow: false, small: 0 });
    };
    await check();
    await page.getByTestId('stage-num-0').click();
    await check();
    await page.getByTestId('stage-exit').click();
    await page.getByTestId('stage-color-0').click();
    for (let i = 0; i < 3; i++) await page.getByTestId('learn-next').click();
    await check();
    await page.getByTestId('stage-exit').click();
    await page.getByTestId('open-companion').click();
    await check();
  });
}

test('hints stay visible in reduced motion', async ({ page }) => {
  await createProfile(page);
  await page.getByTestId('stage-color-0').click();
  for (let i = 0; i < 3; i++) await page.getByTestId('learn-next').click();
  for (let i = 0; i < 2; i++) {
    await page.getByTestId('left-red').click();
    await page.getByTestId('right-blue').click();
  }
  const width = await page.getByTestId('right-red').evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
  expect(width).toBeGreaterThanOrEqual(4);
});

test.describe('with motion on', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('a stage can be completed with animations running', async ({ page }) => {
    await createProfile(page);
    await page.getByTestId('stage-color-0').click({ force: true });
    for (let i = 0; i < 3; i++) await page.getByTestId('learn-next').click();
    for (const id of ['red', 'blue', 'yellow']) {
      await page.getByTestId(`left-${id}`).click();
      await page.getByTestId(`right-${id}`).click();
    }
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('balloon-correct').first().click({ force: true });
      await page.waitForTimeout(350);
    }
    await expect(page.getByTestId('celebration')).toBeVisible();
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
