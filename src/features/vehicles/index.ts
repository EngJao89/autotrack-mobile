/**
 * Public API of the vehicles feature (ATP-37).
 * External modules must import only from `@/features/vehicles`.
 */

export { CreateVehicleForm } from './components/CreateVehicleForm';
export { VehicleCard } from './components/VehicleCard';
export { VehicleForm } from './components/VehicleForm';
export { VehicleListState } from './components/VehicleListState';
export { vehicleSubtitle, vehicleTitle } from './lib/format';
export { formatLicensePlate, normalizeLicensePlate } from './lib/plate';
export {
  fieldsFromVehicle,
  getVehicleYearMax,
  parseVehicleForm,
  parseVehicleUpdateForm,
  VEHICLE_YEAR_MIN,
  type VehicleFormFields,
} from './lib/validation';
export { VehicleDetailScreen } from './screens/VehicleDetailScreen';
export { VehicleFormScreen } from './screens/VehicleFormScreen';
export { VehiclesScreen } from './screens/VehiclesScreen';
