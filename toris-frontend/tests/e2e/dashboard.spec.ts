import { test, expect } from '@playwright/test';

test('owner login page loads', async ({ page }) => {
    await page.goto('/owner/login');
    await expect(page.locator('input[formcontrolname="email"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="password"]')).toBeVisible();
});
