/**
 * Wire types aligned with autotrack-api OpenAPI (`/api/docs-json`).
 * Manual until OpenAPI codegen (ATP-12); do not invent fields beyond the contract.
 */

export type ApiUser = {
  id: string;
  firebaseUid: string | null;
  email: string;
  name: string | null;
  cnh: string | null;
  document: string | null;
  documentType: 'CPF' | 'CNPJ' | string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BootstrapResponse = {
  created: boolean;
  user: ApiUser;
};

export type HealthResponse = {
  status: 'ok' | 'degraded' | string;
  info?: Record<string, unknown> | null;
  error?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
};

export type Vehicle = {
  id: string;
  userId: string;
  brand: string;
  model: string;
  version: string | null;
  year: number;
  licensePlate: string | null;
  color: string | null;
  fuelType: string | null;
  odometerKm: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateVehicleInput = {
  brand: string;
  model: string;
  year: number;
  version?: string;
  licensePlate?: string;
  color?: string;
  fuelType?: string;
  odometerKm?: number;
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export type MaintenanceType =
  | 'Preventiva'
  | 'Corretiva'
  | 'Revisão'
  | 'Troca de óleo'
  | 'Pneus'
  | 'Freios'
  | 'Elétrica'
  | 'Outro'
  | string;

export type Maintenance = {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string | null;
  serviceDate: string;
  odometerKm: number | null;
  costCents: number | null;
  workshopName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMaintenanceInput = {
  type: MaintenanceType;
  serviceDate: string;
  description?: string;
  odometerKm?: number;
  costCents?: number;
  workshopName?: string;
  notes?: string;
};

export type UpdateMaintenanceInput = Partial<CreateMaintenanceInput>;

export type UpdateUserInput = {
  name?: string | null;
  cnh?: string | null;
  document?: string | null;
  documentType?: 'CPF' | 'CNPJ' | null;
  phone?: string | null;
};
