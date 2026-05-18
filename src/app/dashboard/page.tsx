import { prisma } from '@/lib/prisma';
import type { Lead, LeadLink } from '@/types';
import DashboardClient from './DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  const serialized: Lead[] = leads.map((l) => ({
    ...l,
    status: l.status as Lead['status'],
    links: Array.isArray(l.links) ? (l.links as unknown as LeadLink[]) : null,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return <DashboardClient initialLeads={serialized} />;
}
