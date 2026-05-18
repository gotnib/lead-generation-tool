import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Jason Davis, owner of Clearsite (clearsite.online), writing a follow-up reply to a local business owner.

CONTEXT:
- You offer mobile-first website rebuilds for local businesses
- Price: $299 one-time, optional $49/month maintenance
- Tone: confident, peer-to-peer, conversational — like texting a colleague

YOUR JOB:
Read the conversation thread provided and write Jason's next reply. The reply should directly respond to what the prospect said in their last message.

STRICT RULES:
- Respond to the specific thing they said — do not ignore their message
- If they asked a question, answer it directly first
- Keep it short: 3–6 sentences max
- No bullet points, no headers, no bold text — plain conversational prose
- Never use "just", "I wanted to reach out", "I specialize in", exclamation points, "solutions"
- Never use hyphens (-) or em dashes (—)
- Contractions are fine and preferred
- Do not re-introduce yourself or re-pitch from scratch
- Do not sign off with a formal signature block — the email client handles that
- End with a single clear next step or question if appropriate
- Write only the reply body — no subject line, no preamble`;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { thread } = await req.json() as {
    thread: { direction: string; subject: string; body: string; createdAt: string }[];
  };

  if (!thread?.length) {
    return NextResponse.json({ error: 'Thread is required' }, { status: 400 });
  }

  const threadText = thread
    .map((msg) => {
      const speaker = msg.direction === 'sent' ? 'Jason (you)' : lead.businessName;
      const date = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `[${date}] ${speaker}:\n${msg.body.trim()}`;
    })
    .join('\n\n---\n\n');

  const prompt = `Business: ${lead.businessName} (${lead.category}, ${lead.city})
Contact: ${lead.contactName ?? 'the owner'}

Conversation so far:
${threadText}

Write Jason's reply to the most recent message above.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const draft = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    return NextResponse.json({ draft });
  } catch (err) {
    console.error('Reply draft error:', err);
    return NextResponse.json({ error: 'Failed to generate reply draft' }, { status: 500 });
  }
}
