import { chromium } from "playwright";

const URL = "https://www.lightinthebox.com";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
      locale: "en-SG",
      timezoneId: "Asia/Singapore",
    });

    const page = await context.newPage();
    page.setDefaultTimeout(45_000);

    console.log("Navigating...");
    const response = await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    console.log("Status:", response?.status());

    // networkidle
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => console.log("networkidle timeout"));
    console.log("Network idle done");

    // fonts
    await page.evaluate(() => document.fonts?.ready?.catch(() => {})).catch(() => {});
    console.log("Fonts ready");

    // images
    await page.waitForFunction(
      () => {
        const imgs = Array.from(document.querySelectorAll("img"));
        if (imgs.length === 0) return true;
        return imgs.slice(0, 30).every((img) => img.complete && img.naturalWidth > 0);
      },
      { timeout: 12_000 },
    ).catch(() => console.log("Image wait timeout"));
    console.log("Images checked");

    // Dismiss overlays
    await page.evaluate(() => {
      const dismissSelectors = [
        "[class*='overlay' i]",
        "[class*='modal' i]",
        "[class*='popup' i]",
        "[class*='drawer' i]",
        "[class*='mask' i]",
        "[class*='search' i]",
        "[class*='dropdown' i]",
        "[class*='sidebar' i]",
        "[class*='menu' i]:not(nav):not([role='navigation'])",
        "[aria-modal='true']",
        "[role='dialog']",
      ];
      for (const sel of dismissSelectors) {
        document.querySelectorAll(sel).forEach((el) => {
          const html = el as HTMLElement;
          const rect = html.getBoundingClientRect();
          if (rect.width > window.innerWidth * 0.3 || rect.height > window.innerHeight * 0.3) {
            html.style.display = "none";
          }
        });
      }
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }).catch(() => {});
    console.log("Overlays dismissed");

    // Scroll
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
    console.log("Scrolled to top, waited 2s");

    // Screenshot
    const screenshot = await page.screenshot({ type: "jpeg", quality: 85, fullPage: false });
    const b64 = screenshot.toString("base64");
    console.log("Screenshot base64 length:", b64.length);
    console.log("Under 2MB limit:", b64.length < 2_000_000);

    // Save to file
    const fs = await import("fs");
    fs.writeFileSync("/tmp/test-full-scan.jpg", screenshot);
    console.log("Saved to /tmp/test-full-scan.jpg");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await browser.close();
  }
}

main();
