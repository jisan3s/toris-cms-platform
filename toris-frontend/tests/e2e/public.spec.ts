import { test, expect } from '@playwright/test';

test('home page and contact page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-header')).toBeVisible();

    await page.goto('/contact');
    await expect(page.locator('input[formcontrolname="name"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
});
