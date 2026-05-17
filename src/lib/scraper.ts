import type { ScrapedBusiness } from '@/types';

export async function scrapeGoogleMaps(
  category: string,
  city: string
): Promise<ScrapedBusiness[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require('puppeteer-core');

  let executablePath: string | undefined;
  let launchArgs: string[];

  if (process.env.NODE_ENV === 'production') {
    // @sparticuz/chromium-min downloads Chromium from GitHub into /tmp at runtime.
    // The binary is cached for the lifetime of the warm Lambda instance.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium = require('@sparticuz/chromium-min');
    const CHROMIUM_URL =
      'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar';
    executablePath = await chromium.executablePath(CHROMIUM_URL);
    launchArgs = [...chromium.args, '--disable-gpu', '--single-process'];
  } else {
    executablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;
    launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ];
  }

  const browser = await puppeteer.launch({
    args: launchArgs,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Basic bot-detection evasion without puppeteer-extra-plugin-stealth
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // @ts-expect-error window.chrome is not typed
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    const searchQuery = `${category} in ${city}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Dismiss cookie consent if present
    try {
      const acceptBtn = await page.$('button[aria-label="Accept all"]');
      if (acceptBtn) {
        await acceptBtn.click();
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch {
      // No consent dialog — continue
    }

    await page.waitForSelector('[role="feed"]', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to load more results
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');
        if (feed) feed.scrollBy(0, 800);
      });
      await new Promise((r) => setTimeout(r, 800));
    }

    const businesses: ScrapedBusiness[] = await page.evaluate(
      (cat: string, cty: string) => {
        const results: ScrapedBusiness[] = [];
        const feed = document.querySelector('[role="feed"]');
        if (!feed) return results;

        const anchors = feed.querySelectorAll('a[href*="/maps/place/"]');

        anchors.forEach((anchor: Element) => {
          try {
            const container = anchor.closest('div.Nv2PK') ?? anchor.parentElement;
            if (!container) return;

            const name =
              anchor.getAttribute('aria-label') ||
              container.querySelector('[class*="fontHeadlineSmall"]')?.textContent?.trim() ||
              container.querySelector('h3')?.textContent?.trim();

            if (!name || name.length < 2) return;

            const ratingEl = container.querySelector('span.MW4etd');
            const rating = ratingEl ? parseFloat(ratingEl.textContent || '0') || null : null;

            const reviewEl = container.querySelector('span.UY7F9');
            const reviewCount = reviewEl
              ? parseInt((reviewEl.textContent || '').replace(/[^0-9]/g, '')) || null
              : null;

            const infoEls = container.querySelectorAll(
              '.Io6YTe, .W4Etje, [class*="fontBodyMedium"] span'
            );
            const infoTexts = Array.from(infoEls)
              .map((el) => el.textContent?.trim())
              .filter(Boolean);

            const address = infoTexts.length > 0 ? infoTexts[infoTexts.length - 1] ?? null : null;

            const phoneMatch = infoTexts.find(
              (t) => /(\+?[\d\s\-().]{7,20})/.test(t ?? '') && !t?.includes(',')
            );

            const websiteText = infoTexts.find(
              (t) =>
                t?.includes('.') && !t?.includes(' ') && !t?.match(/^\d/) && t !== address
            );

            results.push({
              businessName: name,
              category: cat,
              city: cty,
              address: address || null,
              phone: phoneMatch || null,
              website: websiteText || null,
              rating: isNaN(rating as number) ? null : rating,
              reviewCount,
            });
          } catch {
            // Skip malformed items
          }
        });

        return results;
      },
      category,
      city
    );

    const seen = new Set<string>();
    return businesses
      .filter((b) => {
        if (seen.has(b.businessName)) return false;
        seen.add(b.businessName);
        return true;
      })
      .slice(0, 20);
  } finally {
    await browser.close();
  }
}
