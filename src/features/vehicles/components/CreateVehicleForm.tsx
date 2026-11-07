import type { CreateVehicleInput } from '@/services/api';

import { VehicleForm } from './VehicleForm';

type CreateVehicleFormProps = {
  submitting: boolean;
  onSubmit: (body: CreateVehicleInput) => Promise<void>;
  onCancel: () => void;
};

/** Compact create form for Home sheet (ATP-39) and vehicles feature. */
export function CreateVehicleForm({ submitting, onSubmit, onCancel }: CreateVehicleFormProps) {
  return (
    <VehicleForm mode="create" submitting={submitting} onSubmit={onSubmit} onCancel={onCancel} />
  );
}
