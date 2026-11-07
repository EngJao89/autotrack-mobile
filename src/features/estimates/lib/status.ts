import type { RepairEstimateStatus } from '@/services/api';

const TRANSITIONS: Record<RepairEstimateStatus, readonly RepairEstimateStatus[]> = {
  DRAFT: ['FINALIZED', 'ARCHIVED'],
  FINALIZED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: [],
};

export function allowedEstimateTransitions(
  status: RepairEstimateStatus
): readonly RepairEstimateStatus[] {
  return TRANSITIONS[status] ?? [];
}

export function canEditEstimateContent(status: RepairEstimateStatus): boolean {
  return status === 'DRAFT';
}
