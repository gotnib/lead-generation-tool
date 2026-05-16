import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scraper';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { category, city } = await req.json();

    if (!category?.trim() || !city?.trim()) {
      return NextResponse.json({ error: 'Category and city are required' }, { status: 400 });
    }

    const businesses = await scrapeGoogleMaps(category.trim(), city.trim());

    return NextResponse.json({ businesses });
  } catch (err) {
    console.error('Scrape error:', err);
    return NextResponse.json(
      { error: 'Scraping failed. Make sure Chromium is available.' },
      { status: 500 }
    );
  }
}
