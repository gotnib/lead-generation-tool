'use client';

import { useState, useEffect } from 'react';
import type { Lead } from '@/types';
import { PIPELINE_STAGES } from '@/types';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}

interface FormState {
  status: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  contactName: string;
  contactEmail: string;
}

export default function LeadDetailPanel({ lead, onClose, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState<FormState>({
    status: 'new',
    phone: '',
    website: '',
    address: '',
    notes: '',
  });
  const [pitchEmail, setPitchEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFindingContact, setIsFindingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactEmailCopied, setContactEmailCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pitchError, setPitchError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        status: lead.status,
        phone: lead.phone ?? '',
        website: lead.website ?? '',
        address: lead.address ?? '',
        notes: lead.notes ?? '',
        contactName: lead.contactName ?? '',
        contactEmail: lead.contactEmail ?? '',
      });
      setPitchEmail(lead.pitchEmail ?? '');
      setPitchError('');
      setContactError('');
      setSaveSuccess(false);
    }
  }, [lead]);

  if (!lead) return null;

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          phone: form.phone || null,
          website: form.website || null,
          address: form.address || null,
          notes: form.notes || null,
          contactName: form.contactName || null,
          contactEmail: form.contactEmail || null,
        }),
      });
      const updated = await res.json();
      onUpdate(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${lead.businessName}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
    onDelete(lead.id);
    onClose();
  };

  const handleFindContact = async () => {
    setIsFindingContact(true);
    setContactError('');
    try {
      const res = await fetch(`/api/leads/${lead.id}/contact`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setForm((prev) => ({
        ...prev,
        contactName: data.contactName ?? '',
        contactEmail: data.contactEmail ?? '',
      }));
    } catch (err: unknown) {
      setContactError(err instanceof Error ? err.message : 'Failed to find contact');
    } finally {
      setIsFindingContact(false);
    }
  };

  const handleCopyContactEmail = async () => {
    if (!form.contactEmail) return;
    await navigator.clipboard.writeText(form.contactEmail);
    setContactEmailCopied(true);
    setTimeout(() => setContactEmailCopied(false), 2000);
  };

  const handleGeneratePitch = async () => {
    setIsGenerating(true);
    setPitchError('');
    try {
      const res = await fetch(`/api/leads/${lead.id}/pitch`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPitchEmail(data.pitchEmail);
    } catch (err: unknown) {
      setPitchError(err instanceof Error ? err.message : 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pitchEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-zinc-800 bg-zinc-900 shadow-2xl"
        role="dialog"
        aria-label="Lead detail"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2 className="truncate text-base font-semibold text-zinc-100">
              {lead.businessName}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {lead.category} · {lead.city}
            </p>
            {lead.rating && (
              <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 0l1.12 3.44H9.5L6.69 5.56l1.07 3.44L5 7.06l-2.76 1.94 1.07-3.44L.5 3.44H3.88L5 0z" />
                </svg>
                {lead.rating.toFixed(1)}
                {lead.reviewCount != null && (
                  <span className="text-zinc-500">({lead.reviewCount} reviews)</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Pipeline Status
            </label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                { key: 'phone',   label: 'Phone',        placeholder: '+1 (555) 000-0000', span: 1 },
                { key: 'website', label: 'Website',       placeholder: 'example.com',       span: 1 },
                { key: 'address', label: 'Address',       placeholder: '123 Main St…',      span: 2 },
              ] as const
            ).map(({ key, label, placeholder, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key as keyof FormState]}
                  onChange={set(key as keyof FormState)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            ))}
          </div>

          {/* Contact person */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Contact Person
              </span>
              <button
                onClick={handleFindContact}
                disabled={isFindingContact}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-violet-400 transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                {isFindingContact ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                    Searching…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" />
                    </svg>
                    Find with AI
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Name
                </label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={set('contactName')}
                  placeholder="Owner / Manager"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Email
                  {form.contactEmail && (
                    <button
                      onClick={handleCopyContactEmail}
                      className="normal-case tracking-normal text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {contactEmailCopied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={form.contactEmail}
                  onChange={set('contactEmail')}
                  placeholder="email@business.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {contactError && (
              <p className="mt-2 text-xs text-red-400">{contactError}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={4}
              placeholder="Call notes, follow-up reminders, context…"
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Pitch email section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Cold Pitch Email
              </span>
              {pitchEmail && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="4" width="7" height="7" rx="1.5" />
                        <path d="M8 4V2.5A1.5 1.5 0 006.5 1H2.5A1.5 1.5 0 001 2.5v4A1.5 1.5 0 002.5 8H4" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              onClick={handleGeneratePitch}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating email…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="white" />
                  </svg>
                  Generate Pitch Email
                </>
              )}
            </button>

            {pitchError && (
              <p className="mt-2 text-xs text-red-400">{pitchError}</p>
            )}

            {pitchEmail && (
              <textarea
                readOnly
                value={pitchEmail}
                rows={12}
                className="mt-3 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 font-mono text-xs text-zinc-300 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            {isSaving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-700" />
                Saving…
              </>
            ) : saveSuccess ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                  <path d="M2 7l4 4 6-6" />
                </svg>
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
