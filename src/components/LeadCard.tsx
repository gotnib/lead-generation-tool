'use client';

import type { Lead, PipelineStage } from '@/types';
import { STATUS_BADGE } from '@/types';

interface Props {
  lead: Lead;
  stage: PipelineStage;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
}

export default function LeadCard({ lead, stage, onClick, onDragStart, onDelete }: Props) {
  return (
    <div className={`relative group rounded-lg border bg-white shadow-sm transition-all hover:shadow-md ${lead.hasUnreadReply ? 'border-emerald-400 hover:border-emerald-500' : 'border-stone-200 hover:border-stone-300'}`}>
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute right-2 top-2 rounded p-1 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none"
        aria-label="Delete lead"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4h10M5 4V2.5h4V4M5.5 7v4M8.5 7v4M3 4l.8 7.2A1 1 0 004.8 12h4.4a1 1 0 001-.8L11 4" />
        </svg>
      </button>

      {/* Main clickable / draggable area */}
      <div
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
        className="cursor-pointer select-none p-3.5 pr-8"
      >
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-stone-900">
            {lead.businessName}
          </p>
          {lead.hasUnreadReply && (
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-stone-500">{lead.city}</p>

        <div className="mt-2.5 flex items-center gap-2">
          {lead.rating && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 0l1.12 3.44H9.5L6.69 5.56l1.07 3.44L5 7.06l-2.76 1.94 1.07-3.44L.5 3.44H3.88L5 0z" />
              </svg>
              {lead.rating.toFixed(1)}
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[lead.status]}`}>
            {stage.label}
          </span>
        </div>

        {lead.phone && (
          <p className="mt-1.5 truncate text-[11px] text-stone-400">{lead.phone}</p>
        )}
      </div>
    </div>
  );
}
