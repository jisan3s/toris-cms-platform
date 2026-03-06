import { test, expect } from '@playwright/test';

test('login page renders required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.locator('input[formcontrolname="email"]')).toBeVisible();
    await expect(page.locator('input[formcontrolname="password"]')).toBeVisible();
});

test('forgot and reset pages render', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();

    await page.goto('/reset-password?token=dummy-token');
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible();
});
