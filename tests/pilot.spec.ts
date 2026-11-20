import { test, expect } from '@playwright/test';

test.describe('MathsFunda Pilot Tests', () => {
  const baseURL = 'http://127.0.0.1:5173';

  test('index.html loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(new Error(msg.text()));
    });

    await page.goto(`${baseURL}/index.html`);
    await expect(page).toHaveTitle(/MathsFunda/);

    // Check key elements exist
    await expect(page.locator('#hero-continue')).toBeVisible();
    await expect(page.locator('#nav-continue')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('learn.html?stage=foundations loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/learn.html?stage=foundations`);
    await expect(page).toHaveTitle(/Learning Roadmap/);

    // Check key elements exist
    await expect(page.locator('#stage-continue')).toBeVisible();
    await expect(page.locator('#stage-title')).toContainText('Foundations');

    expect(pageErrors).toEqual([]);
  });

  test('reader.html?ch=foundation-1-numbers-and-signs loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/reader.html?ch=foundation-1-numbers-and-signs`);
    await expect(page).toHaveTitle(/Learning Roadmap/);

    // Check reader elements exist
    await expect(page.locator('#reader-title')).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('study-plan-personalized.html loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/study-plan-personalized.html`);
    await expect(page).toHaveTitle(/Learning Roadmap/);

    expect(pageErrors).toEqual([]);
  });

  test('reader.html?ch=geometry-basics loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/reader.html?ch=geometry-basics`);
    await expect(page).toHaveTitle(/Learning Roadmap/);

    expect(pageErrors).toEqual([]);
  });

  test('formulas.html loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/formulas.html`);
    await expect(page).toHaveTitle(/Formula Vault/);

    expect(pageErrors).toEqual([]);
  });

  test('flashcards.html loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/flashcards.html`);
    await expect(page).toHaveTitle(/Flashcards/);

    expect(pageErrors).toEqual([]);
  });

  test('pilottest.html loads without errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err));
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(err.message);
    });

    await page.goto(`${baseURL}/pilottest.html`);
    await expect(page).toHaveTitle(/MathsFunda — Human Pilot Test/);

    expect(pageErrors).toEqual([]);
  });
});
