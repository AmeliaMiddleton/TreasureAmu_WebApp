import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SNAP_DIR = './snapshots';
mkdirSync(SNAP_DIR, { recursive: true });

const consoleMessages = [];
const consoleErrors   = [];

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();

page.on('console', msg => {
  const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
  consoleMessages.push(text);
  if (msg.type() === 'error') consoleErrors.push(text);
});

page.on('pageerror', err => {
  consoleErrors.push(`[PAGE ERROR] ${err.message}`);
});

// ── 1. Landing page ───────────────────────────────────────────────────────────
console.log('\n=== 1. Landing page ===');
await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${SNAP_DIR}/01-landing.png`, fullPage: true });
console.log('Screenshot: 01-landing.png');
console.log('Title:', await page.title());
console.log('Visible headings:');
for (const h of await page.$$eval('h1, h2, h3', els => els.map(e => e.innerText.trim()))) {
  if (h) console.log(' -', h);
}

// ── 2. Scroll to form ─────────────────────────────────────────────────────────
console.log('\n=== 2. Signup form (idle state) ===');
await page.evaluate(() => document.querySelector('form')?.scrollIntoView());
await page.waitForTimeout(400);
await page.screenshot({ path: `${SNAP_DIR}/02-form-idle.png`, fullPage: true });
console.log('Screenshot: 02-form-idle.png');

// ── 3. Submit empty form (validation) ────────────────────────────────────────
console.log('\n=== 3. Submit empty → validation errors ===');
await page.click('button[type="submit"]');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SNAP_DIR}/03-form-validation.png`, fullPage: true });
console.log('Screenshot: 03-form-validation.png');
const validationErrors = await page.$$eval('[class*="error"],[class*="invalid"]', els =>
  els.map(e => e.innerText?.trim()).filter(Boolean)
);
console.log('Validation messages:', validationErrors);

// ── 4. Fill valid personal member form ───────────────────────────────────────
console.log('\n=== 4. Fill personal member form ===');
await page.fill('input[formControlName="firstName"]', 'Playwright');
await page.fill('input[formControlName="lastName"]',  'Tester');
await page.fill('input[formControlName="email"]',     'playwright@snaptest.com');
await page.fill('input[formControlName="zipCode"]',   '30301');
await page.screenshot({ path: `${SNAP_DIR}/04-form-filled.png`, fullPage: true });
console.log('Screenshot: 04-form-filled.png');

// ── 5. Submit and wait for success ───────────────────────────────────────────
console.log('\n=== 5. Submit form → success ===');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
await page.screenshot({ path: `${SNAP_DIR}/05-form-success.png`, fullPage: true });
console.log('Screenshot: 05-form-success.png');
const successText = await page.$eval('body', el => el.innerText);
const hasSuccess  = successText.includes('received') || successText.includes('Welcome') || successText.includes('thank');
console.log('Success message visible:', hasSuccess);

// ── 6. Duplicate email ───────────────────────────────────────────────────────
console.log('\n=== 6. Duplicate email → 409 error ===');
// Reset and try same email again
const resetBtn = await page.$('button:has-text("Another"), button:has-text("Reset"), button:has-text("Submit another")');
if (resetBtn) await resetBtn.click();
else await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
await page.evaluate(() => document.querySelector('form')?.scrollIntoView());
await page.waitForTimeout(300);
await page.fill('input[formControlName="firstName"]', 'Playwright');
await page.fill('input[formControlName="lastName"]',  'Tester');
await page.fill('input[formControlName="email"]',     'playwright@snaptest.com');
await page.fill('input[formControlName="zipCode"]',   '30301');
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
await page.screenshot({ path: `${SNAP_DIR}/06-duplicate-email.png`, fullPage: true });
console.log('Screenshot: 06-duplicate-email.png');
const errorText = await page.$eval('body', el => el.innerText);
const hasDupeError = errorText.includes('already registered') || errorText.includes('already exists');
console.log('Duplicate email error shown:', hasDupeError);

// ── 7. Business member — org name field ─────────────────────────────────────
console.log('\n=== 7. Business member type → org name required ===');
await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
await page.evaluate(() => document.querySelector('form')?.scrollIntoView());
await page.waitForTimeout(300);
// Org name field should NOT be visible on default (Personal)
const orgBeforeSelect = await page.$('#organizationName');
console.log('Org name field visible before selecting Business:', orgBeforeSelect !== null);
// Select Business via the <select> dropdown
await page.selectOption('#memberType', 'business');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SNAP_DIR}/07-business-org-field.png`, fullPage: true });
console.log('Screenshot: 07-business-org-field.png');
const orgAfterBusiness = await page.$('#organizationName');
console.log('Org name field visible after selecting Business:', orgAfterBusiness !== null);
// Also test Nonprofit
await page.selectOption('#memberType', 'nonprofit');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SNAP_DIR}/07b-nonprofit-org-field.png`, fullPage: true });
console.log('Screenshot: 07b-nonprofit-org-field.png');
const orgAfterNonprofit = await page.$('#organizationName');
console.log('Org name field visible after selecting Nonprofit:', orgAfterNonprofit !== null);
// Switch back to Personal — field should disappear
await page.selectOption('#memberType', 'personal');
await page.waitForTimeout(300);
const orgAfterPersonal = await page.$('#organizationName');
console.log('Org name field hidden again after switching back to Personal:', orgAfterPersonal === null);

// ── Console summary ───────────────────────────────────────────────────────────
console.log('\n=== Console log summary ===');
if (consoleErrors.length === 0) {
  console.log('No console errors.');
} else {
  console.log('ERRORS FOUND:');
  consoleErrors.forEach(e => console.log(' ', e));
}
const nonTrivial = consoleMessages.filter(m =>
  !m.includes('Download the React') && !m.includes('[LOG]')
);
if (nonTrivial.length) {
  console.log('\nAll console messages:');
  nonTrivial.forEach(m => console.log(' ', m));
}

await browser.close();
console.log(`\nSnapshots saved to ./${SNAP_DIR}/`);
