/**
 * Public API of the maintenance history feature (ATP-46).
 * External modules must import only from `@/features/maintenance`.
 */

export { MaintenanceCard } from './components/MaintenanceCard';
export { MaintenanceListState } from './components/MaintenanceListState';
export {
  buildMaintenanceHistory,
  formatMaintenanceCost,
  formatMaintenanceDate,
  formatMaintenanceOdometer,
  formatMaintenanceVehicleLabel,
  isCompletedMaintenance,
  MAINTENANCE_HISTORY_FIELD_MAP,
  maintenanceServiceTitle,
  normalizeMaintenanceStatus,
  sortCompletedMaintenances,
  toMaintenanceHistoryCard,
  type MaintenanceHistoryCardModel,
} from './lib/history';
export { MaintenancesScreen } from './screens/MaintenancesScreen';
