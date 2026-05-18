import Anthropic from '@anthropic-ai/sdk';
import type { ScrapedBusiness } from '@/types';

// --- Google Places API (production) -----------------------------------

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

// --- AI lead qualifier ------------------------------------------------
// Filters raw results down to businesses that look like good prospects:
// small operations, no/weak website, low review count.

async function filterLeadsWithAI(businesses: ScrapedBusiness[]): Promise<ScrapedBusiness[]> {
  if (businesses.length === 0) return businesses;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Rule-based fallback when no API key
    return businesses
      .filter((b) => !b.website || (b.reviewCount !== null && b.reviewCount < 50))
      .map((b) => ({
        ...b,
        reason: !b.website ? 'No website listed' : `Only ${b.reviewCount} reviews — small operation`,
      }));
  }

  try {
    const client = new Anthropic({ apiKey });

    const list = businesses
      .map(
        (b, i) =>
          `[${i}] ${b.businessName} | website: ${b.website ?? 'none'} | reviews: ${b.reviewCount ?? 'unknown'} | rating: ${b.rating ?? 'unknown'}`
      )
      .join('\n');

    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are filtering local businesses for a web design / digital marketing agency looking for prospects who need help with their online presence.

Select businesses that show clear signs of needing web help: no website, very few reviews (under 50), missing contact info, or appear to be small independent operations. Skip large chains, franchises (McDonald's, Subway, national brands), and businesses that obviously have a strong web presence.

Businesses:
${list}

Return a JSON array for each selected business:
[{"index": 0, "reason": "No website listed and only 8 reviews — small local shop with no web presence"}, ...]

Keep each reason to one short sentence focusing on the specific signal that makes them a good prospect. Return only the JSON array, nothing else.`,
        },
      ],
    });

    const textBlock = msg.content.find((b) => b.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text.trim() : '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return businesses;

    const selected: { index: number; reason: string }[] = JSON.parse(jsonMatch[0]);
    return selected
      .filter((s) => s.index >= 0 && s.index < businesses.length)
      .map((s) => ({ ...businesses[s.index], reason: s.reason }));
  } catch {
    // If AI call fails, fall back to simple rule-based filter
    return businesses
      .filter((b) => !b.website || (b.reviewCount !== null && b.reviewCount < 100))
      .map((b) => ({
        ...b,
        reason: !b.website ? 'No website listed' : `Low review count (${b.reviewCount}) suggests small operation`,
      }));
  }
}

// --- Public entry point -----------------------------------------------

export async function scrapeGoogleMaps(
  category: string,
  city: string
): Promise<ScrapedBusiness[]> {
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  const raw = placesKey
    ? await scrapeViaPlacesAPI(category, city, placesKey)
    : await scrapeViaPuppeteer(category, city);

  return filterLeadsWithAI(raw);
}
