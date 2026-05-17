import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findContact } from '@/lib/contactFinder';

export const maxDuration = 30;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const { contactName, contactEmail } = await findContact(lead);

    const updated = await prisma.lead.update({
      where: { id },
      data: { contactName, contactEmail },
    });

    return NextResponse.json({
      contactName: updated.contactName,
      contactEmail: updated.contactEmail,
    });
  } catch (err) {
    console.error('Contact finder error:', err);
    return NextResponse.json({ error: 'Failed to find contact' }, { status: 500 });
  }
}
