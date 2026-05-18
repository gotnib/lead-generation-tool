export type LeadStatus = 'new' | 'contacted' | 'interested' | 'proposal' | 'closed' | 'lost' | 'bad_target';

export interface LeadLink {
  label: string;
  url: string;
}

export interface Lead {
  id: string;
  businessName: string;
  category: string;
  city: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  status: LeadStatus;
  notes: string | null;
  pitchEmail: string | null;
  contactName: string | null;
  contactEmail: string | null;
  hasUnreadReply: boolean;
  links: LeadLink[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailMessage {
  id: string;
  leadId: string;
  direction: 'sent' | 'received';
  subject: string;
  body: string;
  fromAddr: string;
  toAddr: string;
  createdAt: string;
}

export interface ScrapedBusiness {
  businessName: string;
  category: string;
  city: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  reason?: string;
}

export interface PipelineStage {
  id: LeadStatus;
  label: string;
  color: string;
  dotColor: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'new',        label: 'New Leads',      color: 'sky',     dotColor: 'bg-sky-400' },
  { id: 'contacted',  label: 'Contacted',      color: 'amber',   dotColor: 'bg-amber-400' },
  { id: 'interested', label: 'Interested',     color: 'violet',  dotColor: 'bg-violet-400' },
  { id: 'proposal',   label: 'Proposal Sent',  color: 'orange',  dotColor: 'bg-orange-400' },
  { id: 'closed',     label: 'Closed',         color: 'emerald', dotColor: 'bg-emerald-400' },
  { id: 'lost',       label: 'Lost',           color: 'red',     dotColor: 'bg-red-400' },
  { id: 'bad_target', label: 'Bad Target',     color: 'stone',   dotColor: 'bg-stone-400' },
];

export const STATUS_BADGE: Record<LeadStatus, string> = {
  new:        'bg-sky-100 text-sky-700 border border-sky-200',
  contacted:  'bg-amber-100 text-amber-700 border border-amber-200',
  interested: 'bg-violet-100 text-violet-700 border border-violet-200',
  proposal:   'bg-orange-100 text-orange-700 border border-orange-200',
  closed:     'bg-emerald-100 text-emerald-700 border border-emerald-200',
  lost:       'bg-red-100 text-red-700 border border-red-200',
  bad_target: 'bg-stone-100 text-stone-500 border border-stone-200',
};
