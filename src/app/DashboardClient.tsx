'use client';

import { useState, useCallback } from 'react';
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

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Pipeline Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Drag cards between columns to update status</p>
        </div>
        <Link
          href="/scraper"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 self-start"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Find New Leads
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Leads"
          value={stats.total}
          accent="text-zinc-100"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="5" r="3" />
              <path d="M2 13c0-3.3 2.7-6 6-6s6 2.7 6 6" />
            </svg>
          }
        />
        <StatCard
          label="Contacted"
          value={stats.contacted}
          accent="text-amber-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
              <path d="M2 4l6 5 6-5" />
            </svg>
          }
        />
        <StatCard
          label="Interested"
          value={stats.interested}
          accent="text-violet-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1l2 4.5H15L10.5 9l2 4.5L8 11l-4.5 2.5 2-4.5L1 5.5h5L8 1z" fill="none" />
            </svg>
          }
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          accent="text-emerald-400"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l3.5 3.5L13 5" />
            </svg>
          }
        />
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
          <div className="mb-4 rounded-full bg-zinc-800 p-4 text-zinc-500">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="14" cy="10" r="5" />
              <path d="M4 24c0-5.5 4.5-10 10-10s10 4.5 10 10" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-zinc-300">No leads yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Use{' '}
            <Link href="/scraper" className="text-blue-400 hover:underline">
              Find Leads
            </Link>{' '}
            to scrape Google Maps and populate your pipeline.
          </p>
        </div>
      )}

      {/* Kanban board */}
      {leads.length > 0 && (
        <KanbanBoard
          initialLeads={leads}
          onLeadClick={setSelectedLead}
          onLeadUpdate={handleLeadUpdate}
          onLeadDelete={handleLeadDelete}
        />
      )}

      {/* Detail panel */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleLeadUpdate}
        onDelete={handleLeadDelete}
      />
    </div>
  );
}
