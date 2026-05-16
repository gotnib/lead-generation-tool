'use client';

import { useState, useCallback } from 'react';
import type { Lead } from '@/types';
import { PIPELINE_STAGES } from '@/types';
import KanbanColumn from './KanbanColumn';

interface Props {
  initialLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate: (lead: Lead) => void;
}

export default function KanbanBoard({ initialLeads, onLeadClick, onLeadUpdate }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleDragStart = useCallback((leadId: string, e: React.DragEvent) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnter = useCallback((status: string) => {
    setDropTarget(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  }, []);

  const handleDrop = useCallback(
    async (status: string) => {
      if (!draggedId) return;
      const lead = leads.find((l) => l.id === draggedId);
      if (!lead || lead.status === status) {
        setDraggedId(null);
        setDropTarget(null);
        return;
      }

      const updated = { ...lead, status: status as Lead['status'] };
      setLeads((prev) => prev.map((l) => (l.id === draggedId ? updated : l)));
      setDraggedId(null);
      setDropTarget(null);
      onLeadUpdate(updated);

      await fetch(`/api/leads/${draggedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    },
    [draggedId, leads, onLeadUpdate]
  );

  // Keep local state in sync when the detail panel saves a lead
  const syncLead = useCallback((updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      onDragEnd={() => {
        setDraggedId(null);
        setDropTarget(null);
      }}
    >
      {PIPELINE_STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          leads={leads.filter((l) => l.status === stage.id)}
          isDragTarget={dropTarget === stage.id}
          onLeadClick={(lead) => {
            onLeadClick(lead);
            // Bind external sync so detail panel updates flow back in
            (lead as Lead & { __sync?: (l: Lead) => void }).__sync = syncLead;
          }}
          onDragStart={handleDragStart}
          onDragEnter={() => handleDragEnter(stage.id)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(stage.id)}
        />
      ))}
    </div>
  );
}
