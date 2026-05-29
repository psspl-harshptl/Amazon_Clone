import { test, expect, Page } from '@playwright/test';

const SELLER_USER = {
  id: 99,
  name: 'Test Seller',
  email: 'seller@test.com',
  role: 'seller',
  sellerStatus: 'approved',
};

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', slug: 'electronics' },
  { id: 2, name: 'Fashion', slug: 'fashion' },
];

async function setupSellerAuth(page: Page) {
  // Inject seller auth token before navigation so AuthContext hydrates correctly
  await page.addInitScript((user) => {
    localStorage.setItem('amazon_token', 'mock-seller-jwt-token');
    localStorage.setItem('amazon_user', JSON.stringify(user));
  }, SELLER_USER);

  // Mock /auth/me so AuthContext confirms the session is valid
  await page.route('**/api/v1/auth/me', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: SELLER_USER }),
    })
  );
}

async function mockCategoriesAPI(page: Page, categories = MOCK_CATEGORIES) {
  await page.route('**/api/v1/products/categories', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: categories }),
    })
  );
}

test.describe('Seller ListingForm — Category "Other" flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupSellerAuth(page);
    await mockCategoriesAPI(page);
    await page.goto('/seller/listings/new');
    await page.waitForLoadState('networkidle');
  });

  test('"Other (Request new category)" appears as the last dropdown option', async ({ page }) => {
    const select = page.getByTestId('category-select');
    await expect(select).toBeVisible();

    const options = await select.locator('option').allTextContents();
    expect(options.at(-1)).toBe('Other (Request new category)');

    // Real categories appear before Other
    expect(options).toContain('Electronics');
    expect(options).toContain('Fashion');
    const otherIdx = options.indexOf('Other (Request new category)');
    const electronicsIdx = options.indexOf('Electronics');
    expect(otherIdx).toBeGreaterThan(electronicsIdx);
  });

  test('Category request box is hidden when no category is selected', async ({ page }) => {
    await expect(page.getByTestId('category-request-box')).not.toBeVisible();
  });

  test('Category request box is hidden when a real category is selected', async ({ page }) => {
    await page.getByTestId('category-select').selectOption({ label: 'Electronics' });
    await expect(page.getByTestId('category-request-box')).not.toBeVisible();
  });

  test('Category request box appears when "Other" is selected', async ({ page }) => {
    await page.getByTestId('category-select').selectOption('other');
    await expect(page.getByTestId('category-request-box')).toBeVisible();
    await expect(page.getByTestId('category-request-input')).toBeVisible();
    await expect(page.getByTestId('category-request-submit')).toBeVisible();
  });

  test('Category request box hides when switching from Other back to a real category', async ({ page }) => {
    await page.getByTestId('category-select').selectOption('other');
    await expect(page.getByTestId('category-request-box')).toBeVisible();

    await page.getByTestId('category-select').selectOption({ label: 'Fashion' });
    await expect(page.getByTestId('category-request-box')).not.toBeVisible();
  });

  test('Form submission blocked when "Other" is selected — shows helpful error', async ({ page }) => {
    // Fill required fields
    await page.getByPlaceholder('Enter product name').fill('Test Product');
    await page.getByPlaceholder('0.00').first().fill('199');
    await page.getByTestId('category-select').selectOption('other');

    await page.getByRole('button', { name: 'Submit for Approval' }).click();

    const error = page.locator('.bg-red-50');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Select a valid category');
    await expect(error).toContainText('request');
  });

  test('Form submits successfully when a real category is selected', async ({ page }) => {
    // Mock the product creation endpoint
    await page.route('**/api/v1/seller/products', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 1, name: 'Test Product' } }),
      })
    );

    await page.getByPlaceholder('Enter product name').fill('Test Product');
    await page.getByPlaceholder('0.00').first().fill('299');
    await page.getByTestId('category-select').selectOption({ label: 'Electronics' });

    // No error for category
    await page.getByRole('button', { name: 'Submit for Approval' }).click();
    await expect(page.locator('.bg-red-50')).not.toBeVisible();
  });

  test('Category request Send Request button is disabled when input is empty', async ({ page }) => {
    await page.getByTestId('category-select').selectOption('other');
    const btn = page.getByTestId('category-request-submit');
    await expect(btn).toBeDisabled();
  });

  test('Category request Send Request button enables when input has text', async ({ page }) => {
    await page.getByTestId('category-select').selectOption('other');
    await page.getByTestId('category-request-input').fill('Sports Equipment');
    await expect(page.getByTestId('category-request-submit')).toBeEnabled();
  });

  test('Category request submission shows success message', async ({ page }) => {
    await page.route('**/api/v1/seller/category-requests', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 10, name: 'Sports Equipment', status: 'pending' }, message: 'Category request submitted' }),
      })
    );

    await page.getByTestId('category-select').selectOption('other');
    await page.getByTestId('category-request-input').fill('Sports Equipment');
    await page.getByTestId('category-request-submit').click();

    await expect(page.getByTestId('category-request-success')).toBeVisible();
    await expect(page.getByTestId('category-request-success')).toContainText('Request submitted');
    // Input clears after submit
    await expect(page.getByTestId('category-request-input')).toHaveValue('');
  });

  test('Category request shows error message on duplicate/failure', async ({ page }) => {
    await page.route('**/api/v1/seller/category-requests', route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'A pending request for this category already exists' }),
      })
    );

    await page.getByTestId('category-select').selectOption('other');
    await page.getByTestId('category-request-input').fill('Electronics');
    await page.getByTestId('category-request-submit').click();

    await expect(page.getByTestId('category-request-error')).toBeVisible();
    await expect(page.getByTestId('category-request-error')).toContainText('pending request');
  });

  test('Switching away from Other resets category request status', async ({ page }) => {
    await page.route('**/api/v1/seller/category-requests', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {}, message: 'Category request submitted' }),
      })
    );

    await page.getByTestId('category-select').selectOption('other');
    await page.getByTestId('category-request-input').fill('Garden Tools');
    await page.getByTestId('category-request-submit').click();
    await expect(page.getByTestId('category-request-success')).toBeVisible();

    // Switch to a real category then back — success message should be gone
    await page.getByTestId('category-select').selectOption({ label: 'Electronics' });
    await page.getByTestId('category-select').selectOption('other');
    await expect(page.getByTestId('category-request-success')).not.toBeVisible();
  });
});
