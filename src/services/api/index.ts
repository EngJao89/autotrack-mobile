/**
 * Shared HTTP infrastructure for autotrack-api (ATP-40).
 * Features import from here or from `@/services/api/<module>` — screens must not create Axios clients.
 */

export { ApiError, isAbortError, messageFromApiBody } from './errors';
export {
  apiRequest,
  cancelPendingApiRequests,
  getApiClient,
  resetApiClientForTests,
  type ApiRequestOptions,
} from './client';
export { getCurrentIdToken } from './token';
export { getApiHealth } from './health';
export { getCurrentUser, updateCurrentUser } from './users';
export { createVehicle, deleteVehicle, getVehicle, listVehicles, updateVehicle } from './vehicles';
export {
  createVehicleMaintenance,
  deleteMaintenance,
  getMaintenance,
  listMaintenances,
  listVehicleMaintenances,
  updateMaintenance,
} from './maintenances';
export type {
  ApiUser,
  BootstrapResponse,
  CreateMaintenanceInput,
  CreateVehicleInput,
  HealthResponse,
  ListMaintenancesQuery,
  Maintenance,
  MaintenanceStatus,
  MaintenanceType,
  UpdateMaintenanceInput,
  UpdateUserInput,
  UpdateVehicleInput,
  Vehicle,
} from './types';
