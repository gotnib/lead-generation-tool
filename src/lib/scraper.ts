import type { ScrapedBusiness } from '@/types';

export async function scrapeGoogleMaps(
  category: string,
  city: string
): Promise<ScrapedBusiness[]> {
  // Dynamic require to avoid bundling issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require('puppeteer-extra');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

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
      // No consent dialog
    }

    // Wait for the results feed
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

    // Extract list-view data
    const businesses: ScrapedBusiness[] = await page.evaluate(
      (cat: string, cty: string) => {
        const results: ScrapedBusiness[] = [];
        const feed = document.querySelector('[role="feed"]');
        if (!feed) return results;

        // Each result is an anchor or a container div
        const anchors = feed.querySelectorAll('a[href*="/maps/place/"]');

        anchors.forEach((anchor: Element) => {
          try {
            const container = anchor.closest('div.Nv2PK') ?? anchor.parentElement;
            if (!container) return;

            // Business name – prefer aria-label on the anchor
            const name =
              anchor.getAttribute('aria-label') ||
              container.querySelector('[class*="fontHeadlineSmall"]')?.textContent?.trim() ||
              container.querySelector('h3')?.textContent?.trim();

            if (!name || name.length < 2) return;

            // Rating
            const ratingEl = container.querySelector('span.MW4etd');
            const rating = ratingEl ? parseFloat(ratingEl.textContent || '0') || null : null;

            // Review count – "(123)"
            const reviewEl = container.querySelector('span.UY7F9');
            const reviewCount = reviewEl
              ? parseInt((reviewEl.textContent || '').replace(/[^0-9]/g, '')) || null
              : null;

            // Address / category lines
            const infoEls = container.querySelectorAll(
              '.Io6YTe, .W4Etje, [class*="fontBodyMedium"] span'
            );
            const infoTexts = Array.from(infoEls)
              .map((el) => el.textContent?.trim())
              .filter(Boolean);

            // Heuristic: last info text is usually an address
            const address = infoTexts.length > 0 ? infoTexts[infoTexts.length - 1] ?? null : null;

            // Phone number pattern
            const phonePattern = /(\+?[\d\s\-().]{7,20})/;
            const phoneMatch = infoTexts.find((t) => phonePattern.test(t ?? '') && !t?.includes(','));

            // Website detection (text containing "." but no spaces and not an address)
            const websiteText = infoTexts.find(
              (t) =>
                t?.includes('.') &&
                !t?.includes(' ') &&
                !t?.match(/^\d/) &&
                t !== address
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

    // De-duplicate by business name
    const seen = new Set<string>();
    const unique = businesses.filter((b) => {
      if (seen.has(b.businessName)) return false;
      seen.add(b.businessName);
      return true;
    });

    return unique.slice(0, 20);
  } finally {
    await browser.close();
  }
}
