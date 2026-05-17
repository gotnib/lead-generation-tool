export type LeadStatus = 'new' | 'contacted' | 'interested' | 'proposal' | 'closed' | 'lost';

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
  createdAt: string;
  updatedAt: string;
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
  { id: 'new',       label: 'New Leads',      color: 'blue',    dotColor: 'bg-blue-400' },
  { id: 'contacted', label: 'Contacted',       color: 'amber',   dotColor: 'bg-amber-400' },
  { id: 'interested',label: 'Interested',      color: 'violet',  dotColor: 'bg-violet-400' },
  { id: 'proposal',  label: 'Proposal Sent',   color: 'orange',  dotColor: 'bg-orange-400' },
  { id: 'closed',    label: 'Closed',          color: 'emerald', dotColor: 'bg-emerald-400' },
  { id: 'lost',      label: 'Lost',            color: 'red',     dotColor: 'bg-red-400' },
];

export const STATUS_BADGE: Record<LeadStatus, string> = {
  new:        'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  contacted:  'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  interested: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  proposal:   'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  closed:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  lost:       'bg-red-500/15 text-red-400 border border-red-500/25',
};
