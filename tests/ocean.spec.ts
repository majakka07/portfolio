import { test, expect } from '@playwright/test';

// Protect the renderer lifecycle regression: intentional disposal must not be
// mistaken for WebGL failure, otherwise the visitor cannot resume the journey.
test('seabed camera renders and 3D can be paused and resumed', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?t=1');
  await expect(page.locator('body')).toHaveClass(/ocean-live/);
  await expect(page.locator('[data-depth]')).toHaveText('09 m');
  await expect(page.locator('#contact-title')).toBeInViewport();
  await page.getByRole('button', { name: 'Animation pausieren' }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: '3D aktivieren' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: '3D aktivieren' }).click();
  await expect(page.locator('body')).toHaveClass(/ocean-live/);
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('reduced motion skips the model and keeps content usable at every breakpoint', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const modelRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) modelRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/ocean-static/);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.dive-project-link')).toHaveCount(4);
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    // The shared dock remeasures on ResizeObserver's next animation frame.
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  expect(modelRequests).toEqual([]);
  await page.getByRole('link', { name: /Unter der Oberfläche/ }).click();
  await expect(page.locator('#intro-title')).toBeInViewport();
});

test('a failed model request leaves a static, navigable portfolio', async ({
  page,
}) => {
  await page.route('**/models/underwater.glb', (route) => route.abort());
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Statische Ansicht' }),
  ).toBeDisabled();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('.surface-logo')).toBeVisible();
  await page.locator('.dive-project-link[href="schatzkistevr.html"]').click();
  await expect(page).toHaveURL(/schatzkistevr.html/);
  await expect(page.locator('.case-hero h1')).toHaveText('SchatzkisteVR');
});

test('the reading and navigation layer works without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.locator('#home-title')).toHaveText('Sara Fricker');
  await expect(page.locator('.dive-project-link')).toHaveCount(4);
  await page.getByRole('link', { name: /Unter der Oberfläche/ }).click();
  await expect(page.locator('#intro-title')).toBeInViewport();
  await context.close();
});

test('the complete model renders inside the hero and releases its canvas offscreen', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/hero-model-ready/);
  await expect(page.locator('#home #hero-model-root canvas')).toHaveCount(1);
  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  await expect(page.locator('#hero-model-root canvas')).toHaveCount(0);
  await expect(page.locator('#ocean-root canvas')).toHaveCount(1);
});
