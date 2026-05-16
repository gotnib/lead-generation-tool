import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Bulk insert from scraper
  if (Array.isArray(body.leads)) {
    const created = await prisma.$transaction(
      body.leads.map((lead: {
        businessName: string;
        category: string;
        city: string;
        address?: string | null;
        phone?: string | null;
        website?: string | null;
        rating?: number | null;
        reviewCount?: number | null;
      }) =>
        prisma.lead.create({
          data: {
            businessName: lead.businessName,
            category: lead.category,
            city: lead.city,
            address: lead.address ?? null,
            phone: lead.phone ?? null,
            website: lead.website ?? null,
            rating: lead.rating ?? null,
            reviewCount: lead.reviewCount ?? null,
            status: 'new',
          },
        })
      )
    );
    return NextResponse.json(created, { status: 201 });
  }

  // Single lead
  const lead = await prisma.lead.create({
    data: {
      businessName: body.businessName,
      category: body.category,
      city: body.city,
      address: body.address ?? null,
      phone: body.phone ?? null,
      website: body.website ?? null,
      rating: body.rating ?? null,
      reviewCount: body.reviewCount ?? null,
      status: body.status ?? 'new',
    },
  });
  return NextResponse.json(lead, { status: 201 });
}
