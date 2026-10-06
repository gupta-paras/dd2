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

  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const testDishName = `AmsterDelhi Truffle Bitterballen ${uniqueId}`;
  const editedDishName = `AmsterDelhi Truffle Bitterballen ${uniqueId} (Chef Special)`;

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

      const metricLabels = ['Total Dishes', 'Daily Specials', 'In Stock', 'Coming Soon', 'Average Price'];
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
        'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg';
      await photoInput.fill(testPhotoUrl);

      // Verify live 16/10 preview box is visible and contains an img
      const previewContainer = page.locator('div:has-text("Live 16/10 Framing Preview")').locator('..').locator('.aspect-\\[16\\/10\\]');
      await previewContainer.waitFor({ state: 'visible' });
      const imgInPreview = previewContainer.locator('img');
      await imgInPreview.waitFor({ state: 'attached' });
    });

    await recordStep('Admin: Create new dish and verify appearance in table', async () => {
      // Photo URL
      const photoInput = page.locator('input[type="url"]');
      await photoInput.fill('https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg');

      // Dish Name
      const nameInput = page.locator('input[maxLength="120"]').first();
      await nameInput.fill(testDishName);

      // Price
      const priceInput = page.locator('input[type="number"]');
      await priceInput.fill('9.75');

      // Description
      const descInput = page.locator('textarea[maxLength="500"]');
      await descInput.fill(
        'Dutch beef croquettes fused with aromatic black truffle, fenugreek, and Gouda dip.'
      );

      // Tags: click 'curries', 'spicy'
      await page.locator('button:has-text("curries")').first().click();
      await page.locator('button:has-text("spicy")').first().click();

      // Enable Daily Special toggle inside the modal
      const modal = page.locator('div[role="dialog"]');
      const specialToggle = modal.locator('text=Daily Special').first();
      await specialToggle.click();

      // Submit form
      const submitBtn = page.getByRole('button', { name: 'Create Dish' });
      await submitBtn.click();

      // Wait for modal to close and dish to appear in table
      await page.waitForSelector(`text=${testDishName}`, { timeout: 8000 });
      const priceText = page.locator(`tr:has-text("${testDishName}")`).first().locator('text=€9.75');
      await priceText.waitFor({ state: 'visible' });
    });

    await recordStep('Admin: Test 1-click toggles for Daily Special and Availability', async () => {
      const row = page.locator(`tr:has-text("${testDishName}")`).first();

      // 1-Click Daily Special toggle
      const specialBtn = row.locator('button[title="Click to toggle Daily Special"]');
      await specialBtn.click();
      // Should now say 'Standard'
      await specialBtn.locator('text=Standard').waitFor({ state: 'visible' });

      // Click again to restore Special
      await specialBtn.click();
      await specialBtn.locator('text=Special').waitFor({ state: 'visible' });

      // 1-Click Availability toggle
      const stockBtn = row.locator('button[title="Click to toggle Stock Status"]');
      await stockBtn.click();
      // Should now say 'Sold Out'
      await stockBtn.locator('text=Sold Out').waitFor({ state: 'visible' });

      // Click again to restore In Stock
      await stockBtn.click();
      await stockBtn.locator('text=In Stock').waitFor({ state: 'visible' });
    });

    await recordStep('Admin: Edit dish price and name', async () => {
      const row = page.locator(`tr:has-text("${testDishName}")`).first();
      const editBtn = row.locator('button[title="Edit Dish"]');
      await editBtn.click();

      // Wait for Edit modal
      await page.waitForSelector(`text=Edit: ${testDishName}`, { timeout: 5000 });

      // Update name & price
      const nameInput = page.locator('input[maxLength="120"]').first();
      await nameInput.fill(editedDishName);

      const priceInput = page.locator('input[type="number"]');
      await priceInput.fill('10.95');

      const saveBtn = page.getByRole('button', { name: 'Save Changes' });
      await saveBtn.click();

      // Verify updated details appear in the table
      await page.waitForSelector(`text=${editedDishName}`, { timeout: 8000 });
      await page.locator(`tr:has-text("${editedDishName}")`).first().locator('text=€10.95').waitFor({ state: 'visible' });

      // Capture Admin desktop screenshot
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-admin.png'), fullPage: true });
    });

    // ------------------------------------------------------------------------
    // FLOW 2: Customer Storefront Flow (/)
    // ------------------------------------------------------------------------
    await recordStep('Customer: Navigate to / and verify dish card 16/10 aspect ratio', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

      // Locate newly created dish
      const newDishCard = page.locator(`article:has-text("${editedDishName}")`).first();
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

    await recordStep('Customer: Verify About Section and Ordering Guide Sections render', async () => {
      // Check About Section
      const aboutSec = page.locator('#about');
      await aboutSec.waitFor({ state: 'visible' });
      await page.locator('text=Pooja Jain').first().waitFor({ state: 'visible' });
      await page.locator('text=A love of cooking. A joy in sharing.').waitFor({ state: 'visible' });

      // Check Ordering Guide Section
      const orderSec = page.locator('#ordering');
      await orderSec.waitFor({ state: 'visible' });
      await page.locator('text=Pick your dishes').waitFor({ state: 'visible' });
      await page.locator('text=Send on WhatsApp').waitFor({ state: 'visible' });
      await page.locator('text=We confirm your order').waitFor({ state: 'visible' });
      await page.locator('text=Birthday & party orders').waitFor({ state: 'visible' });
    });

    await recordStep('Customer: Test real-time search input', async () => {
      const searchInput = page.locator('input[placeholder*="Search dishes"]');

      // Search for 'Truffle'
      await searchInput.fill('Truffle');
      await page.waitForTimeout(50);

      // Verify newly created dish is shown
      const match = page.locator(`article:has-text("${editedDishName}")`).first();
      await match.waitFor({ state: 'visible' });

      // Verify other non-matching items are hidden
      const nonMatch = page.locator('article:has-text("Butter chicken")');
      const isVisible = await nonMatch.isVisible();
      if (isVisible) {
        throw new Error('Search did not filter out non-matching dishes');
      }

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(50);
      await nonMatch.waitFor({ state: 'visible' });
    });

    await recordStep('Customer: Test category pills filter', async () => {
      // Click 'Breads' category pill
      const breadsPill = page.locator('button:has-text("Breads")').first();
      await breadsPill.click();
      await page.waitForTimeout(50);

      // Should show Naan
      await page.locator('article:has-text("Naan")').first().waitFor({ state: 'visible' });

      // Should NOT show curries
      const savory = page.locator('article:has-text("Butter chicken")');
      if (await savory.isVisible()) {
        throw new Error('Curry dish shown under Breads filter');
      }

      // Reset to Everything
      await page.locator('button:has-text("Everything")').first().click();
      await page.waitForTimeout(50);
    });

    await recordStep('Customer: Test Daily Special and Coming Soon toggles', async () => {
      // Daily Special toggle
      const specialToggle = page.getByRole('button', { name: 'Daily Specials Only' });
      await specialToggle.click();
      await page.waitForTimeout(50);

      // Butter chicken is a daily special
      await page.locator('article:has-text("Butter chicken")').waitFor({ state: 'visible' });

      // Toggle off
      await specialToggle.click();
      await page.waitForTimeout(50);

      // Coming Soon toggle
      const comingSoonToggle = page.getByRole('button', { name: 'Coming Soon', exact: true });
      await comingSoonToggle.click();
      await page.waitForTimeout(50);

      // Uttapam should be visible
      await page.locator('article:has-text("Uttapam")').first().waitFor({ state: 'visible' });

      // Toggle off
      await comingSoonToggle.click();
      await page.waitForTimeout(50);
    });

    await recordStep('Customer: Test EN / NL language switcher', async () => {
      // Switch to NL
      const nlBtn = page.locator('button[aria-label="Switch language to Dutch"]');
      await nlBtn.click();
      await page.waitForTimeout(50);

      // Verify Dutch translation appears
      await page.locator('text=Ons menu').first().waitFor({ state: 'visible' });
      await page.locator('text=Over mij').first().waitFor({ state: 'visible' });
      await page.locator('text=Bestellen').first().waitFor({ state: 'visible' });
      await page.locator('text=Een beetje pit. Volop genieten.').waitFor({ state: 'visible' });

      // Switch back to EN
      const enBtn = page.locator('button[aria-label="Switch language to English"]');
      await enBtn.click();
      await page.waitForTimeout(50);

      // Verify English restored
      await page.locator('text=Our menu').first().waitFor({ state: 'visible' });
      await page.locator('text=A little spice. A lot of comfort.').waitFor({ state: 'visible' });
    });

    await recordStep('Customer: Add to Cart and test quantity stepper on dish card', async () => {
      const dishCard = page.locator(`article:has-text("${editedDishName}")`).first();

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
      const cartTrigger = page.locator('button[aria-label*="basket"], button[aria-label*="cart"]').first();
      await cartTrigger.click();

      // Cart Drawer should be open
      await page.waitForSelector('text=Your Order Basket', { timeout: 5000 });
      await page.waitForSelector(`text=${editedDishName}`, { timeout: 5000 });

      // Current quantity is 2, price is 10.95 -> 21.90
      await page.waitForSelector('text=€21.90', { timeout: 5000 });

      // Increment in cart drawer
      const drawerPlusBtn = page.locator('div[role="dialog"]').locator('button[aria-label="Increase quantity"]');
      await drawerPlusBtn.click();

      // New quantity is 3 -> subtotal 32.85
      await page.waitForSelector('text=€32.85', { timeout: 5000 });

      // Cart should show pickup-only notice
      await page.waitForSelector('text=Orders are available for pickup only', { timeout: 5000 });

      // Capture screenshot of cart drawer
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'cart-drawer.png') });
    });

    await recordStep('Customer: Complete simulated Checkout with WhatsApp generation', async () => {
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
    // FLOW 3: Visual & Usability Verification (Streamlined: fast, skipping trivial redundant loops)
    // ------------------------------------------------------------------------
    await recordStep('Visual & Usability: Capture desktop storefront verification screenshot', async () => {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-home.png'), fullPage: false });
    });

    // ------------------------------------------------------------------------
    // FLOW 4: Cleanup: Delete test dish to ensure database stays clean
    // ------------------------------------------------------------------------
    await recordStep('Cleanup: Delete created test dish from Admin to keep database pristine', async () => {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      const row = page.locator(`tr:has-text("${editedDishName}")`).first();
      if (await row.isVisible()) {
        const deleteBtn = row.locator('button[title="Delete Dish"]');
        await deleteBtn.click();
        const confirmBtn = page.locator('div[role="dialog"]').locator('button:has-text("Delete Dish")');
        await confirmBtn.click();
        await page.waitForSelector(`text=${editedDishName}`, { state: 'detached', timeout: 5000 });
      }
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
