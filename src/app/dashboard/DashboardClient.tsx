'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Lead } from '@/types';
import StatCard from '@/components/StatCard';
import KanbanBoard from '@/components/KanbanBoard';
import LeadDetailPanel from '@/components/LeadDetailPanel';
import Link from 'next/link';

interface Props {
  initialLeads: Lead[];
}

export default function DashboardClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const stats = {
    total:      leads.length,
    contacted:  leads.filter((l) => l.status === 'contacted').length,
    interested: leads.filter((l) => l.status === 'interested').length,
    closed:     leads.filter((l) => l.status === 'closed').length,
  };

  const handleLeadUpdate = useCallback((updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const handleLeadDelete = useCallback((leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  }, []);

  useEffect(() => {
    const sync = () => {
      fetch('/api/sync-all-emails', { method: 'POST' })
        .then((r) => r.json())
        .then((data: { updatedIds?: string[] }) => {
          if (data.updatedIds && data.updatedIds.length > 0) {
            setLeads((prev) =>
              prev.map((l) =>
                data.updatedIds!.includes(l.id) ? { ...l, hasUnreadReply: true } : l
              )
            );
          }
        })
        .catch(() => {});
    };
    sync();
    const id = setInterval(sync, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Pipeline Dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">Drag cards between columns to update status</p>
        </div>
        <Link
          href="/dashboard/scraper"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 self-start"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Find New Leads
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} accent="text-stone-900"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 13c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>} />
        <StatCard label="Contacted" value={stats.contacted} accent="text-amber-600"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" /><path d="M2 4l6 5 6-5" /></svg>} />
        <StatCard label="Interested" value={stats.interested} accent="text-violet-600"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l2 4.5H15L10.5 9l2 4.5L8 11l-4.5 2.5 2-4.5L1 5.5h5L8 1z" /></svg>} />
        <StatCard label="Closed" value={stats.closed} accent="text-emerald-600"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5L13 5" /></svg>} />
      </div>

      {leads.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
          <div className="mb-4 rounded-full bg-stone-100 p-4 text-stone-400">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="14" cy="10" r="5" /><path d="M4 24c0-5.5 4.5-10 10-10s10 4.5 10 10" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-stone-700">No leads yet</h3>
          <p className="mt-1 text-sm text-stone-500">
            Use <Link href="/dashboard/scraper" className="text-amber-600 hover:underline">Find Leads</Link> to populate your pipeline.
          </p>
        </div>
      )}

      {leads.length > 0 && (
        <KanbanBoard initialLeads={leads} onLeadClick={setSelectedLead} onLeadUpdate={handleLeadUpdate} onLeadDelete={handleLeadDelete} />
      )}

      <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleLeadUpdate} onDelete={handleLeadDelete} />
    </div>
  );
}
