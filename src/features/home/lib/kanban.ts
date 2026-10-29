import type { Maintenance, MaintenanceStatus } from '@/services/api';

export const KANBAN_COLUMNS: readonly {
  status: MaintenanceStatus;
  label: string;
}[] = [
  { status: 'TODO', label: 'A fazer' },
  { status: 'IN_PROGRESS', label: 'Em andamento' },
  { status: 'DONE', label: 'Concluído' },
] as const;

export type KanbanCounts = Record<MaintenanceStatus, number>;

export type StatusTransitionMap = Record<MaintenanceStatus, readonly MaintenanceStatus[]>;

/** Mirrors API ATP-39 rules (no reopen from DONE in v1). */
export const STATUS_TRANSITIONS: StatusTransitionMap = {
  TODO: ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS: ['TODO', 'DONE'],
  DONE: [],
};

export function normalizeStatus(value: unknown): MaintenanceStatus {
  if (value === 'TODO' || value === 'IN_PROGRESS' || value === 'DONE') {
    return value;
  }
  // Historical / missing status → concluded (never invent pending).
  return 'DONE';
}

export function countByStatus(items: Maintenance[]): KanbanCounts {
  const counts: KanbanCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const item of items) {
    counts[normalizeStatus(item.status)] += 1;
  }
  return counts;
}

export function groupByStatus(items: Maintenance[]): Record<MaintenanceStatus, Maintenance[]> {
  const groups: Record<MaintenanceStatus, Maintenance[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };
  for (const item of items) {
    groups[normalizeStatus(item.status)].push(item);
  }
  for (const column of KANBAN_COLUMNS) {
    groups[column.status] = sortColumn(groups[column.status], column.status);
  }
  return groups;
}

export function sortColumn(items: Maintenance[], status: MaintenanceStatus): Maintenance[] {
  const copy = [...items];
  copy.sort((a, b) => {
    const aTime = Date.parse(a.serviceDate);
    const bTime = Date.parse(b.serviceDate);
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);

    if (status === 'DONE') {
      // Most recent completion first; invalid dates last.
      if (aValid && bValid && bTime !== aTime) return bTime - aTime;
      if (aValid !== bValid) return aValid ? -1 : 1;
      return a.id.localeCompare(b.id);
    }

    // Open columns: planned date ascending; missing date at end.
    if (aValid && bValid && aTime !== bTime) return aTime - bTime;
    if (aValid !== bValid) return aValid ? -1 : 1;
    return a.id.localeCompare(b.id);
  });
  return copy;
}

export function allowedTransitions(from: MaintenanceStatus): readonly MaintenanceStatus[] {
  return STATUS_TRANSITIONS[from] ?? [];
}

export function canTransition(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
  return allowedTransitions(from).includes(to);
}

export function statusLabel(status: MaintenanceStatus): string {
  return KANBAN_COLUMNS.find((c) => c.status === status)?.label ?? status;
}

export function repairTitle(item: Maintenance): string {
  const description = item.description?.trim();
  if (description) return description;
  return String(item.type);
}
