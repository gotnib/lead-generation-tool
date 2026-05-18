'use client';

import { useState, useEffect } from 'react';
import type { Lead, EmailMessage } from '@/types';
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function LeadDetailPanel({ lead, onClose, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState<FormState>({
    status: 'new', phone: '', website: '', address: '', notes: '',
    contactName: '', contactEmail: '',
  });
  const [pitchEmail, setPitchEmail] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFindingContact, setIsFindingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pitchError, setPitchError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

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
      const pitch = lead.pitchEmail ?? '';
      setPitchEmail(pitch);
      if (pitch) {
        const subjectMatch = pitch.match(/^Subject:\s*(.+?)$/m);
        setEmailSubject(subjectMatch ? subjectMatch[1].trim() : '');
        setEmailBody(pitch.replace(/^Subject:[^\n]*\n\n?/, '').trim());
      } else {
        setEmailSubject('');
        setEmailBody('');
      }
      setPitchError('');
      setContactError('');
      setSaveSuccess(false);
      setSendError('');
      setSendSuccess(false);
    }
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    setIsLoadingEmails(true);
    fetch(`/api/leads/${lead.id}/emails`)
      .then((r) => r.json())
      .then((data) => setEmails(Array.isArray(data) ? data : []))
      .catch(() => setEmails([]))
      .finally(() => setIsLoadingEmails(false));
  }, [lead?.id]);

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

  const handleGeneratePitch = async () => {
    setIsGenerating(true);
    setPitchError('');
    try {
      const res = await fetch(`/api/leads/${lead.id}/pitch`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      const pitch: string = data.pitchEmail;
      setPitchEmail(pitch);
      const subjectMatch = pitch.match(/^Subject:\s*(.+?)$/m);
      if (subjectMatch) setEmailSubject(subjectMatch[1].trim());
      setEmailBody(pitch.replace(/^Subject:[^\n]*\n\n?/, '').trim());
    } catch (err: unknown) {
      setPitchError(err instanceof Error ? err.message : 'Failed to generate email');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    setSendError('');
    setSendSuccess(false);
    setIsSending(true);
    const subject = emailSubject.trim() || `Quick note — ${lead.businessName}`;
    const body = emailBody.trim();
    if (!body) { setSendError('Write a message first'); setIsSending(false); return; }
    try {
      const res = await fetch(`/api/leads/${lead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setEmails((prev) => [...prev, { ...data, direction: 'sent' } as EmailMessage]);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20";
  const labelClass = "mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-500";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-stone-200 bg-white shadow-2xl" role="dialog" aria-label="Lead detail">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 bg-stone-50 px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2 className="truncate text-base font-semibold text-stone-900">{lead.businessName}</h2>
            <p className="mt-0.5 text-sm text-stone-500">{lead.category} · {lead.city}</p>
            {lead.rating && (
              <p className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M5 0l1.12 3.44H9.5L6.69 5.56l1.07 3.44L5 7.06l-2.76 1.94 1.07-3.44L.5 3.44H3.88L5 0z" />
                </svg>
                {lead.rating.toFixed(1)}
                {lead.reviewCount != null && <span className="text-stone-400">({lead.reviewCount} reviews)</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} className="flex-shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 focus:outline-none" aria-label="Close panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

          {/* Status */}
          <div>
            <label className={labelClass}>Pipeline Status</label>
            <select value={form.status} onChange={set('status')} className={inputClass}>
              {PIPELINE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Business contact fields */}
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'phone',   label: 'Phone',   placeholder: '+1 (555) 000-0000', span: 1 },
              { key: 'website', label: 'Website', placeholder: 'example.com',       span: 1 },
              { key: 'address', label: 'Address', placeholder: '123 Main St…',      span: 2 },
            ] as const).map(({ key, label, placeholder, span }) => (
              <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={form[key as keyof FormState]} onChange={set(key as keyof FormState)} placeholder={placeholder} className={inputClass} />
              </div>
            ))}
          </div>

          {/* Contact person */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelClass}>Contact Person</span>
              <button onClick={handleFindContact} disabled={isFindingContact}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none">
                {isFindingContact ? (
                  <><span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-violet-500" />Searching…</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" /></svg>Find with AI</>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="Owner / Manager" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="text" value={form.contactEmail} onChange={set('contactEmail')} placeholder="email@business.com" className={inputClass} />
              </div>
            </div>
            {contactError && <p className="mt-2 text-xs text-red-600">{contactError}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Call notes, follow-up reminders, context…" className={`${inputClass} resize-none`} />
          </div>

          {/* Compose + Send */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelClass}>Compose Email</span>
              <button onClick={handleGeneratePitch} disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none">
                {isGenerating ? (
                  <><span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-500" />Generating…</>
                ) : (
                  <><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" /></svg>AI Draft</>
                )}
              </button>
            </div>

            {pitchError && <p className="mb-2 text-xs text-red-600">{pitchError}</p>}

            <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject line"
              className={`mb-2 ${inputClass}`} />

            <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={9}
              placeholder={`Write your email to ${form.contactName || 'the contact'}…`}
              className={`${inputClass} resize-none`} />

            {form.contactEmail ? (
              <button onClick={handleSendEmail} disabled={isSending}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                {isSending ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L2 7l5 2.5L9.5 14 14 2z" /></svg>Send to {form.contactEmail}</>
                )}
              </button>
            ) : (
              <p className="mt-2 text-center text-xs text-stone-400">Add a contact email above to send</p>
            )}

            {sendError && <p className="mt-2 text-xs text-red-600">{sendError}</p>}
            {sendSuccess && <p className="mt-2 text-xs text-emerald-600">Email sent.</p>}
          </div>

          {/* Correspondence thread */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelClass}>Correspondence</span>
              {emails.length > 0 && (
                <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{emails.length}</span>
              )}
            </div>

            {isLoadingEmails ? (
              <div className="flex items-center gap-2 py-4 text-xs text-stone-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-500" />Loading…
              </div>
            ) : emails.length === 0 ? (
              <p className="py-4 text-center text-xs text-stone-400">No emails sent or received yet</p>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div key={email.id} className={`rounded-lg border p-3 ${email.direction === 'sent' ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-stone-50'}`}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${email.direction === 'sent' ? 'text-amber-600' : 'text-stone-500'}`}>
                        {email.direction === 'sent' ? '↑ Sent' : '↓ Received'}
                      </span>
                      <span className="text-[11px] text-stone-400">{formatDate(email.createdAt)}</span>
                    </div>
                    <p className="truncate text-xs font-medium text-stone-800">{email.subject}</p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-stone-500">{email.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-stone-200 bg-stone-50 px-6 py-4">
          <button onClick={handleDelete} disabled={isDeleting}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/20">
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            {isSaving ? (
              <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</>
            ) : saveSuccess ? (
              <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l4 4 6-6" /></svg>Saved</>
            ) : 'Save Changes'}
          </button>
        </div>
      </aside>
    </>
  );
}
