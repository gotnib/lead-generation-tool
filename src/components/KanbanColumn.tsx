'use client';

import type { Lead, PipelineStage } from '@/types';
import LeadCard from './LeadCard';

interface Props {
  stage: PipelineStage;
  leads: Lead[];
  isDragTarget: boolean;
  onLeadClick: (lead: Lead) => void;
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
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
}: Props) {
  return (
    <div
      className={`flex w-72 flex-shrink-0 flex-col rounded-xl border transition-all duration-150 ${
        isDragTarget
          ? 'border-blue-500/40 bg-zinc-800/80 shadow-lg shadow-blue-500/5'
          : 'border-zinc-800 bg-zinc-900'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
          <span className="text-sm font-medium text-zinc-200">{stage.label}</span>
        </div>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
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
          />
        ))}

        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-800 py-8 text-xs text-zinc-600">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
