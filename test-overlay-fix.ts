import { chromium } from "playwright";

async function test() {
  const browser = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"] });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "en-SG",
    timezoneId: "Asia/Singapore",
  });

  const page = await context.newPage();
  console.log("Navigating...");
  await page.goto("https://www.lightinthebox.com/", { waitUntil: "load", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => undefined);
  await page.evaluate(() => document.fonts?.ready?.catch(() => {})).catch(() => undefined);

  // Scroll to trigger lazy loading
  const scrollHeight = await page.evaluate(() => document.body?.scrollHeight ?? 0);
  if (scrollHeight > 800) {
    await page.evaluate((h) => window.scrollTo(0, Math.floor(h / 2)), scrollHeight);
    await page.waitForTimeout(3000);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);

  // === NEW: Dismiss overlays ===
  // 1. Blur any focused element (prevents search dropdown from staying open)
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur?.(); }).catch(() => undefined);
  // 2. Press Escape to close dropdowns/modals
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(500);
  // 3. Click on body to dismiss hover-triggered overlays
  await page.mouse.click(10, 400).catch(() => undefined);
  await page.waitForTimeout(1000);
  // 4. Hide known overlay elements
  await page.evaluate(() => {
    const overlaySelectors = [
      ".searchInstantNew", ".recent-mask", ".search-dropdown",
      "[class*='search-dropdown']", "[class*='search-popup']",
      "[class*='country-selector']", "[class*='currency-selector']",
      "[class*='recent-search']", "[class*='search-suggest']",
    ];
    for (const sel of overlaySelectors) {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }
  }).catch(() => undefined);
  await page.waitForTimeout(1000);
  // 5. Press Escape again
  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(500);

  // Take screenshot
  const screenshot = await page.screenshot({ type: "jpeg", quality: 90, fullPage: false });
  const screenshotPath = "/home/.z/workspaces/con_V31OwkUric6hurdV/test-overlay-fix.jpg";
  require("fs").writeFileSync(screenshotPath, screenshot);
  console.log(`Screenshot saved: ${screenshotPath} (${screenshot.length} bytes)`);
  await browser.close();
}

test().catch(console.error);
