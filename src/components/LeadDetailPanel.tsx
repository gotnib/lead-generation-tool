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
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
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
  const [syncMessage, setSyncMessage] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [inlineReplyBody, setInlineReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

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
      setEmailSubject('');
      setEmailBody(pitch.trim());
      setPitchError('');
      setContactError('');
      setSaveSuccess(false);
      setSendError('');
      setSendSuccess(false);
      setSubjectOptions([]);
      setSyncMessage('');
      setReplyingToId(null);
      setInlineReplyBody('');
      setReplyError('');
      setExpandedEmailId(null);
    }
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    const leadId = lead.id;
    const hasContactEmail = !!lead.contactEmail;

    setIsLoadingEmails(true);
    fetch(`/api/leads/${leadId}/emails`)
      .then((r) => r.json())
      .then((data) => setEmails(Array.isArray(data) ? data : []))
      .catch(() => setEmails([]))
      .finally(() => {
        setIsLoadingEmails(false);
        // Clear unread flag when lead is opened
        if (lead.hasUnreadReply) {
          fetch(`/api/leads/${leadId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hasUnreadReply: false }),
          })
            .then((r) => r.json())
            .then((updated) => onUpdate(updated))
            .catch(() => {});
        }
      });
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleStatusChange = async (newStatus: string) => {
    setForm((prev) => ({ ...prev, status: newStatus }));
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      onUpdate(updated);
    } catch {
      // save button will retry
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

  const handleGeneratePitch = async (target: 'compose' | 'reply' = 'compose') => {
    setIsGenerating(true);
    setPitchError('');
    try {
      const res = await fetch(`/api/leads/${lead.id}/pitch`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      const pitch: string = data.pitchEmail;
      setPitchEmail(pitch);
      setSubjectOptions(Array.isArray(data.subjectLines) ? data.subjectLines : []);
      if (target === 'reply') {
        setInlineReplyBody(pitch.trim());
      } else {
        setEmailSubject('');
        setEmailBody(pitch.trim());
      }
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
      if (form.status === 'new') handleStatusChange('contacted');
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const handleInlineReply = async (originalEmail: EmailMessage) => {
    if (!inlineReplyBody.trim()) return;
    setIsSendingReply(true);
    setReplyError('');
    const subject = originalEmail.subject.startsWith('Re:')
      ? originalEmail.subject
      : `Re: ${originalEmail.subject}`;
    try {
      const res = await fetch(`/api/leads/${lead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body: inlineReplyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setEmails((prev) =>
        [...prev, { ...data, direction: 'sent' } as EmailMessage].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
      setReplyingToId(null);
      setInlineReplyBody('');
      if (form.status === 'new') handleStatusChange('contacted');
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSendingReply(false);
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
            <label className={labelClass}>Pipeline Stage</label>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((s) => {
                const active = form.status === s.id;
                const colors: Record<string, string> = {
                  new:        active ? 'border-sky-300 bg-sky-50 text-sky-700'        : 'border-stone-200 bg-white text-stone-500 hover:border-sky-200 hover:text-sky-600',
                  contacted:  active ? 'border-amber-300 bg-amber-50 text-amber-700'   : 'border-stone-200 bg-white text-stone-500 hover:border-amber-200 hover:text-amber-600',
                  interested: active ? 'border-violet-300 bg-violet-50 text-violet-700': 'border-stone-200 bg-white text-stone-500 hover:border-violet-200 hover:text-violet-600',
                  proposal:   active ? 'border-orange-300 bg-orange-50 text-orange-700': 'border-stone-200 bg-white text-stone-500 hover:border-orange-200 hover:text-orange-600',
                  closed:     active ? 'border-emerald-300 bg-emerald-50 text-emerald-700': 'border-stone-200 bg-white text-stone-500 hover:border-emerald-200 hover:text-emerald-600',
                  lost:       active ? 'border-red-300 bg-red-50 text-red-700'         : 'border-stone-200 bg-white text-stone-500 hover:border-red-200 hover:text-red-600',
                };
                return (
                  <button key={s.id} onClick={() => handleStatusChange(s.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none ${colors[s.id]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dotColor}`} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business contact fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <div className="flex gap-1.5">
                <input type="text" value={form.website} onChange={set('website')} placeholder="example.com" className={inputClass} />
                {form.website && (
                  <a href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 text-stone-400 transition hover:border-amber-400 hover:text-amber-600"
                    title="Open website">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 1H1v12h12V9M9 1h4v4M5.5 8.5l7-7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Address</label>
              <input type="text" value={form.address} onChange={set('address')} placeholder="123 Main St…" className={inputClass} />
            </div>
          </div>

          {/* Contact person */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelClass}>Contact Person</span>
              <button onClick={handleFindContact} disabled={isFindingContact}
                className="min-w-[90px] rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none">
                {isFindingContact ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                    Searching…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" /></svg>
                    Find with AI
                  </span>
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

          {/* Compose + Send — only shown for new leads (initial outreach) */}
          {form.status === 'new' && <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelClass}>Compose Email</span>
              <button onClick={() => handleGeneratePitch('compose')} disabled={isGenerating}
                className="min-w-[80px] rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none">
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
                    Generating…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" /></svg>
                    AI Draft
                  </span>
                )}
              </button>
            </div>

            {pitchError && <p className="mb-2 text-xs text-red-600">{pitchError}</p>}

            {subjectOptions.length > 0 && (
              <div className="mb-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-400">Pick a subject line</p>
                <div className="flex flex-col gap-1.5">
                  {subjectOptions.map((s, i) => (
                    <button key={i} onClick={() => setEmailSubject(s)}
                      className={`rounded-md border px-3 py-1.5 text-left text-xs transition ${
                        emailSubject === s
                          ? 'border-amber-400 bg-amber-50 font-medium text-amber-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:text-stone-900'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
          </div>}

          {/* Correspondence thread */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className={labelClass}>Correspondence</span>
              {emails.length > 0 && (
                <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">{emails.length}</span>
              )}
              {lead.hasUnreadReply && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  New reply
                </span>
              )}
            </div>

            {isLoadingEmails ? (
              <div className="flex items-center gap-2 py-4 text-xs text-stone-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-500" />Loading…
              </div>
            ) : emails.length === 0 ? (
              <p className="py-4 text-center text-xs text-stone-400">No emails sent or received yet</p>
            ) : (
              <div className="space-y-1.5">
                {emails.map((email) => {
                  const isExpanded = expandedEmailId === email.id;
                  const isSent = email.direction === 'sent';
                  return (
                    <div key={email.id}>
                      {/* Collapsed header — always visible */}
                      <button
                        onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition hover:brightness-95 focus:outline-none ${
                          isSent ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wider ${isSent ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {isSent ? '↑' : '↓'}
                          </span>
                          <p className="truncate text-xs font-medium text-stone-800">{email.subject}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[11px] text-stone-400">{formatDate(email.createdAt)}</span>
                          <svg
                            width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
                            className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path d="M2 4l4 4 4-4" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div className={`rounded-b-lg border-x border-b px-3 pb-3 pt-2 ${isSent ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                          <p className="whitespace-pre-wrap text-xs text-stone-600">{email.body}</p>
                          {!isSent && (
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  if (replyingToId === email.id) {
                                    setReplyingToId(null);
                                    setInlineReplyBody('');
                                    setReplyError('');
                                  } else {
                                    setReplyingToId(email.id);
                                    setInlineReplyBody('');
                                    setReplyError('');
                                  }
                                }}
                                className="rounded px-2 py-1 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none"
                              >
                                {replyingToId === email.id ? 'Cancel' : 'Reply'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Inline reply composer */}
                      {replyingToId === email.id && (
                        <div className="mt-1 rounded-lg border border-emerald-300 bg-white p-3">
                          {/* AI Draft button */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Reply</span>
                            <button onClick={() => handleGeneratePitch('reply')} disabled={isGenerating}
                              className="min-w-[80px] rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none">
                              {isGenerating ? (
                                <span className="flex items-center justify-center gap-1.5">
                                  <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
                                  Generating…
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-1.5">
                                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9.5 3 11.5l1.5-4L1 5h4.5L7 1z" fill="currentColor" /></svg>
                                  AI Draft
                                </span>
                              )}
                            </button>
                          </div>

                          {pitchError && <p className="mb-2 text-xs text-red-600">{pitchError}</p>}

                          <textarea
                            autoFocus
                            value={inlineReplyBody}
                            onChange={(e) => setInlineReplyBody(e.target.value)}
                            rows={6}
                            placeholder="Write your reply…"
                            className="w-full resize-none rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 transition focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                          {replyError && <p className="mt-1 text-xs text-red-600">{replyError}</p>}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-stone-400">
                              Re: {email.subject.startsWith('Re:') ? email.subject.slice(4).trim() : email.subject}
                            </span>
                            <button
                              onClick={() => handleInlineReply(email)}
                              disabled={isSendingReply || !inlineReplyBody.trim()}
                              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none"
                            >
                              {isSendingReply ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  Sending…
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14 2L2 7l5 2.5L9.5 14 14 2z" /></svg>
                                  Send Reply
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
