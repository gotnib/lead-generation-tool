import { prisma } from '@/lib/prisma';
import type { Lead } from '@/types';
import DashboardClient from './DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  const serialized: Lead[] = leads.map((l) => ({
    ...l,
    status: l.status as Lead['status'],
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return <DashboardClient initialLeads={serialized} />;
}
