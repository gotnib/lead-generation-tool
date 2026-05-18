'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Lead, LeadLink } from '@/types';
import StatCard from '@/components/StatCard';
import KanbanBoard from '@/components/KanbanBoard';
import LeadDetailPanel from '@/components/LeadDetailPanel';
import Link from 'next/link';

interface Props {
  initialLeads: Lead[];
}

const EMPTY_FORM = {
  businessName: '',
  category: '',
  city: '',
  phone: '',
  website: '',
  address: '',
  notes: '',
  contactName: '',
  contactEmail: '',
};

const inputClass = 'w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20';
const labelClass = 'mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-500';

export default function DashboardClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

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

  const setField = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAddForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.businessName.trim() || !addForm.category.trim() || !addForm.city.trim()) {
      setAddError('Business name, category, and city are required.');
      return;
    }
    setIsAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: addForm.businessName.trim(),
          category: addForm.category.trim(),
          city: addForm.city.trim(),
          phone: addForm.phone.trim() || null,
          website: addForm.website.trim() || null,
          address: addForm.address.trim() || null,
          notes: addForm.notes.trim() || null,
          contactName: addForm.contactName.trim() || null,
          contactEmail: addForm.contactEmail.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create lead');
      const created = await res.json() as Lead & { createdAt: string; updatedAt: string };
      const newLead: Lead = {
        ...created,
        links: Array.isArray((created as { links?: LeadLink[] | null }).links)
          ? (created as { links: LeadLink[] }).links
          : null,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      setLeads((prev) => [newLead, ...prev]);
      setShowAddModal(false);
      setAddForm(EMPTY_FORM);
    } catch {
      setAddError('Something went wrong. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setAddForm(EMPTY_FORM);
    setAddError('');
  };

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
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/30"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Add Manually
          </button>
          <Link
            href="/dashboard/scraper"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="4.5" /><path d="M10 10l2.5 2.5" />
            </svg>
            Find New Leads
          </Link>
        </div>
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
            Use <Link href="/dashboard/scraper" className="text-amber-600 hover:underline">Find Leads</Link> or{' '}
            <button onClick={() => setShowAddModal(true)} className="text-amber-600 hover:underline focus:outline-none">add one manually</button>.
          </p>
        </div>
      )}

      {leads.length > 0 && (
        <KanbanBoard initialLeads={leads} onLeadClick={setSelectedLead} onLeadUpdate={handleLeadUpdate} onLeadDelete={handleLeadDelete} />
      )}

      <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleLeadUpdate} onDelete={handleLeadDelete} />

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <h2 className="text-base font-semibold text-stone-900">Add Lead Manually</h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 focus:outline-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddLead} className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {/* Row 1 */}
                <div>
                  <label className={labelClass}>Business Name <span className="text-red-400">*</span></label>
                  <input autoFocus type="text" value={addForm.businessName} onChange={setField('businessName')} placeholder="Acme Plumbing Co." className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Category <span className="text-red-400">*</span></label>
                    <input type="text" value={addForm.category} onChange={setField('category')} placeholder="plumbers" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City <span className="text-red-400">*</span></label>
                    <input type="text" value={addForm.city} onChange={setField('city')} placeholder="Austin TX" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="text" value={addForm.phone} onChange={setField('phone')} placeholder="(555) 000-0000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input type="text" value={addForm.website} onChange={setField('website')} placeholder="example.com" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <input type="text" value={addForm.address} onChange={setField('address')} placeholder="123 Main St…" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Contact Name</label>
                    <input type="text" value={addForm.contactName} onChange={setField('contactName')} placeholder="Owner / Manager" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="text" value={addForm.contactEmail} onChange={setField('contactEmail')} placeholder="email@business.com" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={addForm.notes} onChange={setField('notes')} rows={3} placeholder="Anything relevant about this lead…" className={`${inputClass} resize-none`} />
                </div>

                {addError && <p className="text-xs text-red-600">{addError}</p>}
              </div>

              {/* Footer */}
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={closeModal} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 focus:outline-none">
                  Cancel
                </button>
                <button type="submit" disabled={isAdding} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-60 focus:outline-none">
                  {isAdding ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Adding…</>
                  ) : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
