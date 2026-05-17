import type { ScrapedBusiness } from '@/types';

// --- Google Places API (production) -----------------------------------
// Fast (~1 s), reliable, no browser needed. Requires GOOGLE_PLACES_API_KEY.
// Google gives $200/month free credit — ~1 000 text searches for a single user.
//
// Setup: console.cloud.google.com → new project → enable "Places API (New)"
//        → Credentials → Create API key → add to Vercel env vars.

async function scrapeViaPlacesAPI(
  category: string,
  city: string,
  apiKey: string
): Promise<ScrapedBusiness[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.websiteUri',
        'places.rating',
        'places.userRatingCount',
      ].join(','),
    },
    body: JSON.stringify({ textQuery: `${category} in ${city}`, maxResultCount: 20 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Places API ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const places: Record<string, unknown>[] = data.places ?? [];

  return places
    .map((p) => ({
      businessName: (p.displayName as { text: string } | undefined)?.text ?? '',
      category,
      city,
      address: (p.formattedAddress as string | undefined) ?? null,
      phone: (p.nationalPhoneNumber as string | undefined) ?? null,
      website: (p.websiteUri as string | undefined) ?? null,
      rating: (p.rating as number | undefined) ?? null,
      reviewCount: (p.userRatingCount as number | undefined) ?? null,
    }))
    .filter((b) => b.businessName.length > 0);
}

// --- Puppeteer fallback (local dev without GOOGLE_PLACES_API_KEY) -----

async function scrapeViaPuppeteer(
  category: string,
  city: string
): Promise<ScrapedBusiness[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require('puppeteer-core');

  let executablePath: string | undefined;
  let launchArgs: string[];

  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium = require('@sparticuz/chromium');
    executablePath = await chromium.executablePath();
    launchArgs = [...chromium.args, '--disable-gpu', '--single-process'];
  } else {
    executablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;
    launchArgs = [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process',
    ];
  }

  const browser = await puppeteer.launch({ args: launchArgs, executablePath, headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // @ts-expect-error window.chrome is not typed
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    const url = `https://www.google.com/maps/search/${encodeURIComponent(`${category} in ${city}`)}?hl=en`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    for (const sel of ['button[aria-label="Accept all"]', '#L2AGLb', 'button.tHlp8d']) {
      try {
        const btn = await page.$(sel);
        if (btn) { await btn.click(); await new Promise((r) => setTimeout(r, 1500)); break; }
      } catch { /* try next */ }
    }

    await page.waitForSelector('[role="feed"]', { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1500));

    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => document.querySelector('[role="feed"]')?.scrollBy(0, 800));
      await new Promise((r) => setTimeout(r, 600));
    }

    const businesses: ScrapedBusiness[] = await page.evaluate((cat: string, cty: string) => {
      const results: ScrapedBusiness[] = [];
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return results;
      feed.querySelectorAll('a[href*="/maps/place/"]').forEach((anchor: Element) => {
        try {
          const container = anchor.closest('div.Nv2PK') ?? anchor.parentElement;
          if (!container) return;
          const name = anchor.getAttribute('aria-label') ||
            container.querySelector('[class*="fontHeadlineSmall"]')?.textContent?.trim() || '';
          if (!name || name.length < 2) return;
          const rating = parseFloat(container.querySelector('span.MW4etd')?.textContent || '') || null;
          const reviewCount = parseInt(
            (container.querySelector('span.UY7F9')?.textContent || '').replace(/\D/g, '')
          ) || null;
          const infoTexts = Array.from(container.querySelectorAll('.Io6YTe, .W4Etje'))
            .map((el) => el.textContent?.trim()).filter(Boolean);
          results.push({
            businessName: name, category: cat, city: cty,
            address: infoTexts[infoTexts.length - 1] ?? null,
            phone: null, website: null,
            rating: isNaN(rating as number) ? null : rating, reviewCount,
          });
        } catch { /* skip */ }
      });
      return results;
    }, category, city);

    const seen = new Set<string>();
    return businesses.filter((b) => {
      if (seen.has(b.businessName)) return false;
      seen.add(b.businessName);
      return true;
    }).slice(0, 20);
  } finally {
    await browser.close();
  }
}

// --- Public entry point -----------------------------------------------

export async function scrapeGoogleMaps(
  category: string,
  city: string
): Promise<ScrapedBusiness[]> {
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  if (placesKey) {
    return scrapeViaPlacesAPI(category, city, placesKey);
  }
  return scrapeViaPuppeteer(category, city);
}
