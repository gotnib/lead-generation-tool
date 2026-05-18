'use client';

import type { Lead, PipelineStage } from '@/types';
import LeadCard from './LeadCard';

interface Props {
  stage: PipelineStage;
  leads: Lead[];
  isDragTarget: boolean;
  onLeadClick: (lead: Lead) => void;
  onLeadDelete: (leadId: string) => void;
  onDragStart: (leadId: string, e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export default function KanbanColumn({
  stage,
  leads,
  isDragTarget,
  onLeadClick,
  onLeadDelete,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
}: Props) {
  return (
    <div
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border transition-all duration-150 ${
        isDragTarget
          ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-500/10'
          : 'border-stone-200 bg-stone-100'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
          <span className="text-sm font-medium text-stone-800">{stage.label}</span>
        </div>
        <span className="rounded-full bg-white border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-500">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex min-h-[140px] flex-col gap-2 p-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            stage={stage}
            onClick={() => onLeadClick(lead)}
            onDragStart={(e) => onDragStart(lead.id, e)}
            onDelete={() => onLeadDelete(lead.id)}
          />
        ))}

        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-stone-300 py-8 text-xs text-stone-400">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
