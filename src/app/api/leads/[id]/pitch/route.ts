import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior direct-response copywriter specializing in cold outreach for local business web design services. Your job is to write one cold email per lead that feels personally researched, not mass-generated.

BUSINESS CONTEXT:
- Sender: Jason Davis, Clearsite (clearsite.online)
- Service: Mobile-first website rebuilds for local businesses
- Price point: $299 one-time, optional $49/month maintenance
- Tone: Confident, peer-to-peer, never salesy or desperate

STRICT RULES:

1. FACTUAL ACCURACY — THIS IS THE MOST IMPORTANT RULE
- NEVER invent, assume, or guess anything about the business or their website
- ONLY reference website issues, design choices, or content that you can directly observe in the website_content_excerpt provided
- If the site could not be fetched or the excerpt gives you nothing concrete to work with, write about the category/city in general terms — do NOT invent specifics about their particular site
- If sales_notes exist, you may use those facts directly

2. RESEARCH HOOK
- Line 1 must reference something specific to this exact business: review count, rating, business name, city, or niche
- Never open with "I hope this email finds you well" or any generic greeting
- Never open with "My name is" or introduce yourself first

3. PROBLEM IDENTIFICATION
- Only name website problems you actually observed in the provided website content
- If you have no site content, name 1-2 common problems for this business type/city without claiming you saw them on their specific site
- Always connect the problem to a real business consequence (missed calls, lost clients, lower trust)
- Never be insulting — frame problems as missed opportunity not failure

4. PAYOFF
- Describe the outcome not the service
- Focus on what the client's customer experiences after the fix, not the technical details of what you'll build
- One sentence maximum

5. THE ASK
- Always one single low-friction question
- Never ask for a call on the first email
- Never mention price in the first email
- Acceptable asks: "Worth a quick look if I put some ideas together?" or "Would a few specific suggestions be useful?"
- Never use more than one ask

6. SIGNATURE
Always end with exactly this format:
Jason Davis
Clearsite — Mobile-first websites for local businesses
clearsite.online

7. LENGTH
- 150 words maximum
- No bullet points, no headers, no bold text
- Plain text only — this is an email not a brochure
- Every sentence must earn its place
- If a sentence doesn't move the reader forward, cut it

8. TONE RULES
- Write peer-to-peer — you are talking to a business owner as an equal, not pitching up to them
- Never use the word "just" (weakens authority)
- Never use "I wanted to reach out"
- Never use "I specialize in"
- Never use exclamation points
- Never use the word "solutions"
- Never use hyphens (-) or em dashes (—) anywhere in the email
- Contractions are fine and preferred

9. OUTPUT FORMAT
Write the email body first — no subject line, no preamble, no explanation.
Then on its own line write exactly: ---SUBJECTS---
Then write 3 subject line options following these rules:
- Under 8 words each
- No clickbait or false urgency
- No questions
- Reference their business name or city in at least one
- Plain text, no punctuation tricks
Output: 3 subject lines, numbered, nothing else.`;

interface SiteData {
  title?: string;
  metaDescription?: string;
  headings: string[];
  ctaButtons: string[];
  nav?: string;
  bodyExcerpt: string;
  hasPhone: boolean;
}

async function skimWebsite(url: string): Promise<SiteData | null> {
  try {
    const base = url.startsWith('http') ? url : `https://${url}`;
    const res = await fetch(base, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();

    const metaDescription =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{5,}?)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']{5,}?)["'][^>]+name=["']description["']/i)?.[1];

    const headings: string[] = [];
    for (const m of html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 2 && text.length < 120) headings.push(text);
    }

    const hasPhone = /(?:tel:|href="tel:)|(?:\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4})/.test(html);

    const ctaButtons: string[] = [];
    for (const m of html.matchAll(/<(?:button|a\b)[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)) {
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text.length >= 3 && text.length <= 50 && /contact|call|book|schedule|quote|get|free|start|now|request|today/i.test(text)) {
        ctaButtons.push(text);
      }
    }

    const navMatch = html.match(/<nav[\s\S]*?<\/nav>/i);
    const nav = navMatch
      ? navMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
      : undefined;

    const bodyExcerpt = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 1200);

    return {
      title,
      metaDescription,
      headings: headings.slice(0, 10),
      ctaButtons: [...new Set(ctaButtons)].slice(0, 6),
      nav,
      bodyExcerpt,
      hasPhone,
    };
  } catch {
    return null;
  }
}

function formatSiteData(data: SiteData): string {
  const lines: string[] = [];
  if (data.title) lines.push(`Page title: ${data.title}`);
  if (data.metaDescription) lines.push(`Meta description: ${data.metaDescription}`);
  if (data.headings.length) lines.push(`Headings found: ${data.headings.join(' | ')}`);
  if (data.nav) lines.push(`Navigation items: ${data.nav}`);
  lines.push(`Has visible phone number on page: ${data.hasPhone ? 'yes' : 'no'}`);
  if (data.ctaButtons.length) lines.push(`CTA buttons/links: ${data.ctaButtons.join(' | ')}`);
  if (data.bodyExcerpt) lines.push(`Body text excerpt:\n${data.bodyExcerpt}`);
  return lines.join('\n');
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const greeting = lead.contactName ? `Hi ${lead.contactName.split(' ')[0]},` : 'Hi,';

  const siteData = lead.website ? await skimWebsite(lead.website) : null;
  const websiteContext = lead.website
    ? `website_url: ${lead.website}\n${siteData ? formatSiteData(siteData) : 'website_fetch_result: could not fetch the site'}`
    : 'has_website: false — no website on file';

  const notesContext = lead.notes?.trim()
    ? `\nsales_notes (use these facts directly): ${lead.notes.trim()}`
    : '';

  const prompt = `Write a cold outreach email using ONLY the verified data below. Do not invent or assume anything not listed here.

business_name: ${lead.businessName}
business_type: ${lead.category}
city: ${lead.city}
review_count: ${lead.reviewCount ?? 'unknown'}
star_rating: ${lead.rating ?? 'unknown'}
${websiteContext}${notesContext}

REMINDER: Every specific claim in the email must come from the data above. If the website could not be fetched or gives no useful details, write in general category/city terms — do not invent details about their specific site.

Start the email with: ${greeting}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const raw = textBlock?.type === 'text' ? textBlock.text : '';
    const [bodyPart, subjectPart] = raw.split(/\n---SUBJECTS---\n/);
    const pitchEmail = bodyPart.trim();
    const subjectLines = (subjectPart ?? '')
      .trim()
      .split('\n')
      .filter((l) => /^\d+\./.test(l))
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    await prisma.lead.update({ where: { id }, data: { pitchEmail } });

    return NextResponse.json({ pitchEmail, subjectLines });
  } catch (err) {
    console.error('Anthropic error:', err);
    return NextResponse.json(
      { error: 'Failed to generate email. Check your ANTHROPIC_API_KEY.' },
      { status: 500 }
    );
  }
}
