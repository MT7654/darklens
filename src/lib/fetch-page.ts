import { assessPageAccess, type PageAccessStatus } from "@/lib/page-access";
import type { Page } from "playwright-core";

export type FetchedPage = {
  finalUrl: string;
  pageTitle: string;
  visibleText: string;
  interactiveHtml: string;
  viewportScreenshot: string;
  fullPageScreenshot: string;
  screenshotCapturedAt: Date;
  httpStatus: number;
  access: PageAccessStatus;
};

const FETCH_TIMEOUT_MS = 45_000;
const MAX_STORED_SCREENSHOT_CHARS = 2_000_000;

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const STEALTH_LAUNCH_ARGS = ["--disable-blink-features=AutomationControlled"];

const BOT_CHALLENGE_URL_PATTERNS = [
  /\/\.well-known\/sgcaptcha/i,
  /\/\.well-known\/captcha/i,
];

const BOT_CHALLENGE_RESOLVE_TIMEOUT_MS = 35_000;

const COUNTDOWN_SELECTORS = [
  "[class*='countdown' i]",
  "[id*='countdown' i]",
  "[class*='timer' i]",
  "[id*='timer' i]",
  "[data-countdown]",
  "[data-timer]",
  "[role='timer']",
].join(", ");

function isBotChallengeUrl(url: string): boolean {
  return BOT_CHALLENGE_URL_PATTERNS.some((pattern) => pattern.test(url));
}

async function waitForBotChallengeResolution(page: Page): Promise<void> {
  if (!isBotChallengeUrl(page.url())) {
    return;
  }

  try {
    await page.waitForURL(
      (url) => !isBotChallengeUrl(url.toString()),
      {
        timeout: BOT_CHALLENGE_RESOLVE_TIMEOUT_MS,
        waitUntil: "domcontentloaded",
      },
    );
    await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(2000);
  } catch {
    // The host's bot challenge did not finish within the allowed window.
  }
}

async function getBrowser() {
  const isServerless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
  );

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: playwrightChromium } = await import("playwright-core");

    chromium.setGraphicsMode = false;

    return playwrightChromium.launch({
      args: [...chromium.args, ...STEALTH_LAUNCH_ARGS],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: true,
    args: STEALTH_LAUNCH_ARGS,
  });
}

async function createBrowserContext(
  browser: Awaited<ReturnType<typeof getBrowser>>,
) {
  const context = await browser.newContext({
    userAgent: BROWSER_USER_AGENT,
    viewport: { width: 1366, height: 768 },
    locale: "en-SG",
    timezoneId: "Asia/Singapore",
    extraHTTPHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-SG,en;q=0.9",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-SG", "en"],
    });
  });

  return context;
}

export function trimScreenshotForStorage(base64: string): string | null {
  if (!base64 || base64.length > MAX_STORED_SCREENSHOT_CHARS) {
    return null;
  }
  return base64;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const browser = await getBrowser();

  try {
    const context = await createBrowserContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(FETCH_TIMEOUT_MS);

    let latestDocumentStatus = 0;
    page.on("response", (res) => {
      if (res.request().resourceType() === "document") {
        latestDocumentStatus = res.status();
      }
    });

    let response = await page.goto(url, {
      waitUntil: "load",
      timeout: FETCH_TIMEOUT_MS,
    });

    if (!response || response.status() >= 400) {
      await page.waitForTimeout(1500);
      response = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: FETCH_TIMEOUT_MS,
      });
    }

    const initialStatus = response?.status() ?? latestDocumentStatus;
    if (initialStatus === 202 || isBotChallengeUrl(page.url())) {
      await waitForBotChallengeResolution(page);
    }

    let httpStatus = latestDocumentStatus || (response?.status() ?? 0);
    if (!isBotChallengeUrl(page.url()) && httpStatus === 202) {
      httpStatus = 200;
    }

    // Wait for network to settle (CSS, JS, images loaded)
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);

    // Wait for fonts to be ready so text renders properly
    await page.evaluate(() => document.fonts?.ready?.catch(() => {})).catch(() => undefined);

    // Wait for substantial body content to appear (SPA content rendered)
    // A fully loaded page should have > 2000 chars of visible text
    await page.waitForFunction(
      () => (document.body?.innerText?.length ?? 0) > 2000,
      { timeout: 15_000 },
    ).catch(() => undefined);

    // Wait for images to finish loading (at least the ones in the viewport)
    await page.waitForFunction(
      () => {
        const imgs = Array.from(document.querySelectorAll("img"));
        if (imgs.length === 0) return true;
        return imgs.slice(0, 30).every((img) => img.complete && img.naturalWidth > 0);
      },
      { timeout: 12_000 },
    ).catch(() => undefined);

    // Dismiss auto-opened overlays (search menus, cookie banners, modals)
    await page.keyboard.press("Escape").catch(() => undefined);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      // Click on the body to dismiss click-triggered overlays
      document.body.click();
    }).catch(() => undefined);

    // Scroll to top in case prior scrolling left the viewport elsewhere
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
    await page.waitForTimeout(1000);

    try {
      await page.waitForSelector(COUNTDOWN_SELECTORS, { timeout: 8000 });
    } catch {
      // Dynamic timers may load later or not exist on this page.
    }

    await page.waitForTimeout(2000);

    // PROBE SCREENSHOT with retry: take a screenshot, check if it has enough content.
    // A near-blank/unrendered page produces a tiny screenshot (< 100KB base64).
    // If too small, wait and retry up to 3 times.
    let viewportScreenshot = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      const probe = (
        await page.screenshot({ type: "jpeg", quality: 90, fullPage: false })
      ).toString("base64");

      if (probe.length > 100_000) {
        // Screenshot is substantial enough — page has rendered real content
        viewportScreenshot = probe;
        break;
      }

      // Too small — page hasn't fully rendered yet. Wait and retry.
      await page.waitForTimeout(5000);
      // Re-dismiss any overlays that may have reappeared
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined);
      await page.waitForTimeout(1000);

      if (attempt === 2) {
        // Last attempt — use whatever we got
        viewportScreenshot = probe;
      }
    }

    const fullPageScreenshot = (
      await page.screenshot({ type: "jpeg", quality: 80, fullPage: true })
    ).toString("base64");

    const data = await page.evaluate((countdownSelector) => {
      const interactiveSelectors = [
        "input",
        "button",
        "select",
        "textarea",
        "[role='timer']",
        "[class*='countdown']",
        "[id*='countdown']",
        "[class*='timer']",
        "[class*='popup']",
        "[class*='modal']",
        "[class*='stock']",
        "[class*='urgency']",
      ].join(",");

      const interactiveNodes = Array.from(
        document.querySelectorAll(interactiveSelectors),
      )
        .slice(0, 100)
        .map((node) => {
          const element = node as HTMLElement;
          const tag = element.tagName.toLowerCase();
          const id = element.id ? `#${element.id}` : "";
          const className = element.className
            ? `.${String(element.className).split(" ").slice(0, 3).join(".")}`
            : "";
          const text = element.innerText?.trim().slice(0, 160) ?? "";
          const checked =
            element instanceof HTMLInputElement && element.checked
              ? " checked"
              : "";
          return `<${tag}${id}${className}${checked}>${text}</${tag}>`;
        });

      const countdownNodes = Array.from(
        document.querySelectorAll(countdownSelector),
      )
        .slice(0, 20)
        .map((node) => (node as HTMLElement).innerText?.trim() ?? "")
        .filter(Boolean);

      const bodyText =
        document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";

      return {
        pageTitle: document.title,
        visibleText: bodyText,
        interactiveHtml: [
          ...interactiveNodes,
          ...countdownNodes.map((text) => `<countdown>${text}</countdown>`),
        ].join("\n"),
      };
    }, COUNTDOWN_SELECTORS);

    const access = assessPageAccess({
      httpStatus,
      pageTitle: data.pageTitle,
      visibleText: data.visibleText,
    });

    return {
      finalUrl: page.url(),
      pageTitle: data.pageTitle,
      visibleText: data.visibleText.slice(0, 12_000),
      interactiveHtml: data.interactiveHtml.slice(0, 8_000),
      viewportScreenshot,
      fullPageScreenshot,
      screenshotCapturedAt: new Date(),
      httpStatus,
      access,
    };
  } finally {
    await browser.close();
  }
}
