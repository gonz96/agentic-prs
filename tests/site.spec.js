// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('carga la página con el título esperado', async ({ page }) => {
  await expect(page).toHaveTitle(/agentic-prs/);
  await expect(page.locator('h1')).toHaveText('Gonzalo');
});

test('el contador incrementa al pulsar el botón', async ({ page }) => {
  const count = page.locator('#count');
  await expect(count).toHaveText('0');

  await page.locator('#inc').click();
  await expect(count).toHaveText('1');

  await page.locator('#inc').click();
  await expect(count).toHaveText('2');
});

test('el perro salta al pulsar el botón', async ({ page }) => {
  const dog = page.locator('#dog');
  await page.locator('#jump').click();
  await expect(dog).toHaveClass(/jump/);
});

test('la lista muestra los elementos esperados', async ({ page }) => {
  const items = page.locator('#items li');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toHaveText('Primer elemento');
});
