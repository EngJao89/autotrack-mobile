import type { RepairEstimateStatus } from '@/services/api';

export function formatCentsBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function estimateStatusLabel(status: RepairEstimateStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Rascunho';
    case 'FINALIZED':
      return 'Finalizado';
    case 'ARCHIVED':
      return 'Arquivado';
    default:
      return status;
  }
}

export function categoryLabel(category: string): string {
  if (category === 'PART') return 'Peça';
  if (category === 'LABOR') return 'Mão de obra';
  return category;
}
