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

1. RESEARCH HOOK
- Line 1 must reference something specific to this exact business: review count, rating, business name, city, or niche
- Never open with "I hope this email finds you well" or any generic greeting
- Never open with "My name is" or introduce yourself first

2. PROBLEM IDENTIFICATION
- Name 2-3 specific mobile or UX problems their current site likely has based on their business type
- Always connect the problem to a real business consequence (missed calls, lost clients, lower trust)
- Never be insulting — frame problems as missed opportunity not failure

3. PROOF
- Reference what competitors or similar businesses in their city are doing
- Never fabricate specific competitor names or data
- Use phrases like "most [business type] ranking well in [city] right now" to imply market awareness

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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const greeting = lead.contactName ? `Hi ${lead.contactName.split(' ')[0]},` : 'Hi,';
  const ratingLine = lead.rating
    ? `${lead.rating} stars with ${lead.reviewCount ?? 0} reviews`
    : 'no rating data';
  const websiteLine = lead.website ? `Website: ${lead.website}` : 'No website listed';

  const prompt = `Write a cold outreach email using these personalization variables:

business_name: ${lead.businessName}
business_type: ${lead.category}
city: ${lead.city}
review_count: ${lead.reviewCount ?? 'unknown'}
star_rating: ${lead.rating ?? 'unknown'}
has_website: ${lead.website ? 'true' : 'false'}
website_url: ${lead.website ?? 'none'}

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
