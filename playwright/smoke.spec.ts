import { test, expect } from '@playwright/test';

test('Homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*login/);
});
