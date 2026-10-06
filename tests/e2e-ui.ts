import { chromium, Browser, Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'tests', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

interface TestResult {
  step: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function recordStep(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  console.log(`\n⏳ Running: ${name}...`);
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ step: name, status: 'PASS', durationMs: duration });
    console.log(`✅ [PASS] ${name} (${duration}ms)`);
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({
      step: name,
      status: 'FAIL',
      details: errorMessage,
      durationMs: duration,
    });
    console.error(`❌ [FAIL] ${name} (${duration}ms):`, error);
    throw error;
  }
}

async function run() {
  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page: Page = await context.newPage();

  page.on('console', (msg) => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`[BROWSER ERROR]:`, err));

  try {
    // ------------------------------------------------------------------------
    // FLOW 1: Admin Flow (/admin)
    // ------------------------------------------------------------------------
    await recordStep('Admin: Load /admin and verify metrics cards', async () => {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      await page.waitForSelector('table', { timeout: 10000 });

      // Verify Metrics
      const metricsSection = page.locator('section[aria-label="Kitchen Key Metrics"]');
      await metricsSection.waitFor({ state: 'visible' });

      const metricLabels = ['Total Dishes', 'Daily Specials', 'In Stock', 'Out of Stock', 'Average Price'];
      for (const label of metricLabels) {
        const card = page.locator(`text=${label}`);
        const count = await card.count();
        if (count === 0) {
          throw new Error(`Metric card '${label}' not found`);
        }
      }
    });

    await recordStep('Admin: Open Add Dish modal and check live 16/10 image preview', async () => {
      const addDishBtn = page.getByRole('button', { name: 'Add New Dish' });
      await addDishBtn.click();

      // Check modal opened
      await page.waitForSelector('text=Add New Desi Dutch Dish', { timeout: 5000 });

      // Check URL input & live preview
      const photoInput = page.locator('input[type="url"]');
      const testPhotoUrl =
        'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80';
      await photoInput.fill(testPhotoUrl);

      // Verify live 16/10 preview box is visible and contains an img
      const previewContainer = page.locator('div:has-text("Live 16/10 Framing Preview")').locator('..').locator('.aspect-\\[16\\/10\\]');
      await previewContainer.waitFor({ state: 'visible' });
      const imgInPreview = previewContainer.locator('img');
      await imgInPreview.waitFor({ state: 'attached' });
    });

    await recordStep('Admin: Create new dish and verify appearance in table', async () => {
      // Dish Name
      const nameInput = page.locator('input[placeholder*="Keema Bitterballen"]');
      await nameInput.fill('AmsterDelhi Truffle Bitterballen');

      // Price
      const priceInput = page.locator('input[type="number"]');
      await priceInput.fill('9.75');

      // Description
      const descInput = page.locator('textarea[placeholder*="Describe the aromatic"]');
      await descInput.fill(
        'Dutch beef croquettes fused with aromatic black truffle, fenugreek, and Gouda dip.'
      );

      // Tags: click 'fusion', 'snack'
      await page.locator('button:has-text("fusion")').first().click();
      await page.locator('button:has-text("snack")').first().click();

      // Enable Daily Special toggle inside the modal
      const modal = page.locator('div[role="dialog"]');
      const specialToggle = modal.locator('text=Daily Special').first();
      await specialToggle.click();

      // Submit form
      const submitBtn = page.getByRole('button', { name: 'Create Dish' });
      await submitBtn.click();

      // Wait for modal to close and dish to appear in table
      await page.waitForSelector('text=AmsterDelhi Truffle Bitterballen', { timeout: 8000 });
      const priceText = page.locator('tr:has-text("AmsterDelhi Truffle Bitterballen")').locator('text=€9.75');
      await priceText.waitFor({ state: 'visible' });
    });

    await recordStep('Admin: Test 1-click toggles for Daily Special and Availability', async () => {
      const row = page.locator('tr:has-text("AmsterDelhi Truffle Bitterballen")');

      // 1-Click Daily Special toggle
      const specialBtn = row.locator('button[title="Click to toggle Daily Special"]');
      await specialBtn.click();
      // Should now say 'Standard'
      await row.locator('text=Standard').waitFor({ state: 'visible' });

      // Click again to restore Special
      await specialBtn.click();
      await row.locator('text=Special').waitFor({ state: 'visible' });

      // 1-Click Availability toggle
      const stockBtn = row.locator('button[title="Click to toggle Stock Status"]');
      await stockBtn.click();
      // Should now say 'Sold Out'
      await row.locator('text=Sold Out').waitFor({ state: 'visible' });

      // Click again to restore In Stock
      await stockBtn.click();
      await row.locator('text=In Stock').waitFor({ state: 'visible' });
    });

    await recordStep('Admin: Edit dish price and name', async () => {
      const row = page.locator('tr:has-text("AmsterDelhi Truffle Bitterballen")');
      const editBtn = row.locator('button[title="Edit Dish"]');
      await editBtn.click();

      // Wait for Edit modal
      await page.waitForSelector('text=Edit: AmsterDelhi Truffle Bitterballen', { timeout: 5000 });

      // Update name & price
      const nameInput = page.locator('input[maxLength="120"]');
      await nameInput.fill('AmsterDelhi Truffle Bitterballen (Chef Special)');

      const priceInput = page.locator('input[type="number"]');
      await priceInput.fill('10.95');

      const saveBtn = page.getByRole('button', { name: 'Save Changes' });
      await saveBtn.click();

      // Verify updated details appear in the table
      await page.waitForSelector('text=AmsterDelhi Truffle Bitterballen (Chef Special)', { timeout: 8000 });
      await page.locator('tr:has-text("AmsterDelhi Truffle Bitterballen (Chef Special)")').locator('text=€10.95').waitFor({ state: 'visible' });

      // Capture Admin desktop screenshot
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-admin.png'), fullPage: true });
    });

    // ------------------------------------------------------------------------
    // FLOW 2: Customer Flow (/)
    // ------------------------------------------------------------------------
    await recordStep('Customer: Navigate to / and verify dish card 16/10 aspect ratio', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Locate newly created dish
      const newDishCard = page.locator('article:has-text("AmsterDelhi Truffle Bitterballen (Chef Special)")');
      await newDishCard.waitFor({ state: 'visible', timeout: 8000 });

      // Check aspect ratio framing container
      const imageContainer = newDishCard.locator('.aspect-\\[16\\/10\\]');
      await imageContainer.waitFor({ state: 'visible' });

      const box = await imageContainer.boundingBox();
      if (!box) throw new Error('Image container bounding box not found');

      const ratio = box.width / box.height;
      const expectedRatio = 16 / 10;
      const diff = Math.abs(ratio - expectedRatio);
      console.log(`Measured 16/10 Container: width=${box.width.toFixed(1)}px, height=${box.height.toFixed(1)}px, ratio=${ratio.toFixed(3)} (expected=${expectedRatio})`);

      if (diff > 0.08) {
        throw new Error(`Aspect ratio ${ratio.toFixed(2)} deviates too much from 1.6`);
      }

      // Save screenshot of dish framing
      await newDishCard.screenshot({ path: path.join(SCREENSHOTS_DIR, 'dish-framing.png') });
    });

    await recordStep('Customer: Test real-time search input', async () => {
      const searchInput = page.locator('input[placeholder*="Search dishes by name"]');

      // Search for 'Truffle'
      await searchInput.fill('Truffle');
      await page.waitForTimeout(300);

      // Verify newly created dish is shown
      const match = page.locator('article:has-text("AmsterDelhi Truffle Bitterballen (Chef Special)")');
      await match.waitFor({ state: 'visible' });

      // Verify other non-matching items are hidden
      const nonMatch = page.locator('article:has-text("Masala Stroopwafel")');
      const isVisible = await nonMatch.isVisible();
      if (isVisible) {
        throw new Error('Search did not filter out non-matching dishes');
      }

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(300);
      await nonMatch.waitFor({ state: 'visible' });
    });

    await recordStep('Customer: Test tag pills filter', async () => {
      // Click 'Dessert' tag pill
      const dessertPill = page.locator('button:has-text("Dessert")').first();
      await dessertPill.click();
      await page.waitForTimeout(300);

      // Should show Stroopwafel and Poffertjes
      await page.locator('article:has-text("Masala Stroopwafel")').waitFor({ state: 'visible' });
      await page.locator('article:has-text("Gulab Jamun Poffertjes")').waitFor({ state: 'visible' });

      // Should NOT show savory snacks
      const savory = page.locator('article:has-text("Kapsalon Chicken Tikka")');
      if (await savory.isVisible()) {
        throw new Error('Savory dish shown under Dessert filter');
      }

      // Reset to All
      await page.locator('button:has-text("All")').first().click();
      await page.waitForTimeout(300);
    });

    await recordStep('Customer: Test Daily Special and In-Stock toggles', async () => {
      // Daily Special toggle
      const specialToggle = page.locator('button:has-text("Daily Specials Only")');
      await specialToggle.click();
      await page.waitForTimeout(300);

      // Keema Bitterballen is a daily special
      await page.locator('article:has-text("Keema Bitterballen")').waitFor({ state: 'visible' });

      // Masala Stroopwafel is NOT a daily special
      if (await page.locator('article:has-text("Masala Stroopwafel")').isVisible()) {
        throw new Error('Non-special dish visible with Daily Specials Only active');
      }

      // Toggle off
      await specialToggle.click();
      await page.waitForTimeout(300);

      // In-Stock toggle
      const inStockToggle = page.locator('button:has-text("In Stock Only")');
      await inStockToggle.click();
      await page.waitForTimeout(300);

      // Sold out dish 'Tandoori Haring Slider' should NOT be visible
      const soldOutDish = page.locator('article:has-text("Tandoori Haring Slider")');
      if (await soldOutDish.isVisible()) {
        throw new Error('Sold-out dish visible when In Stock Only filter is active');
      }

      // Toggle off
      await inStockToggle.click();
      await page.waitForTimeout(300);
    });

    await recordStep('Customer: Add to Cart and test quantity stepper on dish card', async () => {
      const dishCard = page.locator('article:has-text("AmsterDelhi Truffle Bitterballen (Chef Special)")');

      // Click Add button
      const addBtn = dishCard.locator('button:has-text("Add")');
      await addBtn.click();

      // Stepper should now be visible on the card
      const stepper = dishCard.locator('button[aria-label="Increase quantity"]');
      await stepper.waitFor({ state: 'visible' });

      // Initial quantity should be 1
      const qty = dishCard.locator('span.text-xs.font-bold:has-text("1")');
      await qty.waitFor({ state: 'visible' });

      // Increment to 2
      await stepper.click();
      await dishCard.locator('span.text-xs.font-bold:has-text("2")').waitFor({ state: 'visible' });
    });

    await recordStep('Customer: Open Cart Drawer, increment quantity, verify subtotal recalculation', async () => {
      // Click Cart trigger in Navbar
      const cartTrigger = page.locator('button[aria-label*="Open shopping cart"]');
      await cartTrigger.click();

      // Cart Drawer should be open
      await page.waitForSelector('text=Your Order Basket', { timeout: 5000 });
      await page.waitForSelector('text=AmsterDelhi Truffle Bitterballen (Chef Special)', { timeout: 5000 });

      // Current quantity is 2, price is 10.95 -> 21.90
      await page.waitForSelector('text=€21.90', { timeout: 5000 });

      // Increment in cart drawer
      const drawerPlusBtn = page.locator('div[role="dialog"]').locator('button[aria-label="Increase quantity"]');
      await drawerPlusBtn.click();

      // New quantity is 3 -> subtotal 32.85
      await page.waitForSelector('text=€32.85', { timeout: 5000 });

      // Delivery progress bar should show free delivery unlocked (€32.85 > €25 threshold)
      await page.waitForSelector('text=Free Amsterdam Delivery', { timeout: 5000 });

      // Capture screenshot of cart drawer
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'cart-drawer.png') });
    });

    await recordStep('Customer: Complete simulated Checkout with order confirmation', async () => {
      // Click Proceed to Checkout
      const checkoutBtn = page.locator('button:has-text("Proceed to Checkout")');
      await checkoutBtn.click();

      // Wait for Checkout modal
      await page.waitForSelector('text=Checkout & WhatsApp Transmission', { timeout: 5000 });

      // Verify WhatsApp hotline is displayed on checkout form
      const hotlineNotice = page.locator('text=+1-555-555-555-5').first();
      await hotlineNotice.waitFor({ state: 'visible' });

      // Submit Order via WhatsApp CTA
      const placeOrderBtn = page.getByRole('button', { name: /Place & Send on WhatsApp/i });
      await placeOrderBtn.click();

      // Wait for WhatsApp order confirmation screen
      await page.waitForSelector('text=Ready to Send on WhatsApp!', { timeout: 8000 });
      await page.waitForSelector('text=Order #DD-', { timeout: 5000 });

      // Verify WhatsApp Link is present and formatted correctly
      const waLinkEl = page.locator('a:has-text("Open & Send on WhatsApp")');
      await waLinkEl.waitFor({ state: 'visible' });
      const waHref = await waLinkEl.getAttribute('href');
      console.log(`Verified Generated WhatsApp Link: ${waHref}`);
      if (!waHref?.startsWith('https://wa.me/15555555555?text=')) {
        throw new Error(`Invalid WhatsApp URL generated: ${waHref}`);
      }

      // Check order number is displayed
      const orderNumEl = page.locator('div:has-text("Order #DD-")').first();
      await orderNumEl.waitFor({ state: 'visible' });

      // Capture checkout success screenshot showing WhatsApp button
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'checkout-success.png') });

      // Close modal
      const backToMenuBtn = page.getByRole('button', { name: /Back to Menu/i });
      await backToMenuBtn.click();
    });

    // ------------------------------------------------------------------------
    // FLOW 3: Responsiveness & Visual Audit
    // ------------------------------------------------------------------------
    await recordStep('Responsiveness: Desktop (1280x800) Viewport audit & screenshot', async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-home.png'), fullPage: false });
    });

    await recordStep('Responsiveness: Tablet (768x1024) Viewport audit & screenshot', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#street-menu', { timeout: 5000 });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tablet-home.png'), fullPage: false });
    });

    await recordStep('Responsiveness: Mobile (375x667) Viewport audit & screenshot', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#street-menu', { timeout: 5000 });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-home.png'), fullPage: false });

      // Admin mobile view
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Total Dishes', { timeout: 5000 });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-admin.png'), fullPage: false });
    });

    await recordStep('Visual & Usability Audit: Touch targets, typography & color contrast checks', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      const evaluation = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const smallTargets: string[] = [];
        for (const btn of buttons) {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            // Flag if interactive area is too small (< 28px)
            if (rect.width < 28 || rect.height < 28) {
              smallTargets.push(`${btn.innerText.slice(0, 20)} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
            }
          }
        }

        // Typography Hierarchy
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const h3 = document.querySelector('h3');

        const h1Size = h1 ? window.getComputedStyle(h1).fontSize : 'none';
        const h2Size = h2 ? window.getComputedStyle(h2).fontSize : 'none';
        const h3Size = h3 ? window.getComputedStyle(h3).fontSize : 'none';

        // Font color contrast sample checks
        const heroHeading = document.querySelector('h1');
        const heroColor = heroHeading ? window.getComputedStyle(heroHeading).color : '';
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;

        const cardHeading = document.querySelector('article h3');
        const cardColor = cardHeading ? window.getComputedStyle(cardHeading).color : '';

        return {
          totalButtons: buttons.length,
          smallTargets,
          typography: { h1Size, h2Size, h3Size },
          contrast: { heroColor, bodyBg, cardColor },
        };
      });

      console.log(`Evaluated ${evaluation.totalButtons} interactive buttons. Undersized targets: ${evaluation.smallTargets.length}`);
      console.log(`Typography Hierarchy: H1=${evaluation.typography.h1Size}, H2=${evaluation.typography.h2Size}, H3=${evaluation.typography.h3Size}`);
      console.log(`Color Palette Audit: HeroText=${evaluation.contrast.heroColor}, CardTitle=${evaluation.contrast.cardColor}, BodyBackground=${evaluation.contrast.bodyBg}`);
    });

  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('E2E PLAYWRIGHT TEST SUMMARY:');
  console.log('========================================');
  let passCount = 0;
  for (const res of results) {
    console.log(`${res.status === 'PASS' ? '✅' : '❌'} ${res.step} - ${res.durationMs}ms`);
    if (res.status === 'PASS') passCount++;
  }
  console.log(`\nTOTAL: ${results.length} | PASSED: ${passCount} | FAILED: ${results.length - passCount}`);
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
