'use client';

import type { Lead, PipelineStage } from '@/types';
import { STATUS_BADGE } from '@/types';

interface Props {
  lead: Lead;
  stage: PipelineStage;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export default function LeadCard({ lead, stage, onClick, onDragStart }: Props) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group rounded-lg border border-zinc-700/60 bg-zinc-800 p-3.5 transition-all hover:border-zinc-600 hover:bg-zinc-700/60 hover:shadow-lg active:scale-95 cursor-pointer select-none"
    >
      <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
        {lead.businessName}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">{lead.city}</p>

      <div className="mt-2.5 flex items-center gap-2">
        {lead.rating && (
          <span className="flex items-center gap-1 text-xs text-amber-400">
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
        <p className="mt-1.5 truncate text-[11px] text-zinc-500">{lead.phone}</p>
      )}
    </div>
  );
}
