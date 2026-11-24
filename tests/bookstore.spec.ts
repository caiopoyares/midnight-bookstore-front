import { test, expect, type Locator, type Page } from '@playwright/test';
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 100; i++) {
    if (await target.evaluate((el) => document.activeElement === el)) return;
    await page.keyboard.press('Tab');
  }
  throw Error('Keyboard could not reach ' + (await target.textContent()));
}
test('browse, search by author and filter editions', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'The Haunting of Hill House' }).first(),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath('desktop.png') });
  await page.getByRole('button', { name: 'Cosmic horror' }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await expect(page.locator('.book-card')).toContainText('The King in Yellow');
  await page.getByRole('button', { name: 'Search books' }).click();
  await page
    .getByRole('textbox', { name: 'Search the shelves' })
    .fill('Mary Shelley');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await expect(page.locator('.book-card')).toContainText('Frankenstein');
  await page
    .getByRole('combobox', { name: 'Edition', exact: true })
    .selectOption('Hardcover');
  await page.getByLabel('In stock only').check();
  await expect(page.getByText('No books on this shelf')).toBeVisible();
});
test('mobile keyboard-only guest purchase and receipt', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath('mobile.png') });
  await tabTo(page, page.getByRole('link', { name: 'Explore the book' }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/books\/hill-house$/);
  await expect(
    page.getByRole('heading', { name: 'The Haunting of Hill House', level: 1 }),
  ).toBeVisible();
  const add = page.getByRole('button', { name: 'Add to bag' });
  await tabTo(page, add);
  await page.keyboard.press('Enter');
  await tabTo(page, page.getByRole('link', { name: 'View bag (1)' }));
  await page.keyboard.press('Enter');
  for (const [name, value] of [
    ['Email', 'reader@example.test'],
    ['Recipient name', 'Sample Reader'],
    ['Street address and unit', '12 Example Lane'],
    ['City', 'Salem'],
    ['State or region', 'MA'],
    ['Postal code', '01970'],
  ]) {
    await tabTo(page, page.getByRole('textbox', { name, exact: true }));
    await page.keyboard.type(value);
  }
  await tabTo(page, page.getByRole('button', { name: 'Continue to payment' }));
  await page.keyboard.press('Enter');
  const demo = page.getByRole('button', { name: 'Complete demo payment' });
  await expect(demo).toBeVisible();
  await tabTo(page, demo);
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Order confirmed' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Order confirmed' }),
  ).toBeVisible();
  await page.goto('/bag');
  await expect(page.getByText('Your bag is empty')).toBeVisible();
});
test('staff can receive inventory and review the audit entry', async ({
  page,
}) => {
  await page.goto('/staff');
  await page.getByLabel('Staff access key').fill(process.env.QA_STAFF_KEY!);
  await page.getByRole('button', { name: 'Open staff desk' }).click();
  await page
    .getByRole('combobox', { name: 'Edition', exact: true })
    .selectOption('CARM-HC');
  await page.getByLabel('Quantity change').fill('2');
  await page.getByLabel('Reason').fill('Browser rehearsal delivery');
  await page.getByRole('button', { name: 'Save adjustment' }).click();
  await expect(page.getByText('Stock adjustment recorded.')).toBeVisible();
  await expect(
    page.getByText(/CARM-HC · \+2 · Browser rehearsal delivery/),
  ).toBeVisible();
});
