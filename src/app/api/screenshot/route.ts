import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url') ?? '';
  const mode = req.nextUrl.searchParams.get('mode') === 'mobile' ? 'mobile' : 'desktop';

  let target: URL;
  try {
    target = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

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
    executablePath = process.env.CHROME_EXECUTABLE_PATH ?? undefined;
    launchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process'];
  }

  const browser = await puppeteer.launch({ args: launchArgs, executablePath, headless: true });

  try {
    const page = await browser.newPage();

    if (mode === 'mobile') {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      );
    } else {
      await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    }

    await page.goto(target.toString(), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 82, fullPage: false });
    await browser.close();

    return new NextResponse(screenshot as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    console.error('Screenshot error:', err);
    await browser.close();
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  }
}
