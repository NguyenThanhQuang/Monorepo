// src/components/company-admin/VehicleFormModal.tsx

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type {
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleStatus,
} from '@obtp/shared-types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { vehiclesApi, type VehicleResponse } from '../../../api/vehicles.api';

interface Props {
  vehicle?: VehicleResponse | null;
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehicleFormModal({ vehicle, companyId, onClose, onSuccess }: Props) {
  const { t } = useLanguage();

  const [form, setForm] = useState<CreateVehiclePayload>({
    companyId,
    vehicleNumber: '',
    type: '',
    floors: 1,
    seatColumns: 4,
    seatRows: 10,
    aislePositions: [2],
    status: 'active' as VehicleStatus,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        companyId,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        floors: vehicle.floors,
        seatColumns: vehicle.seatColumns,
        seatRows: vehicle.seatRows,
        aislePositions: vehicle.aislePositions,
        status: vehicle.status,
      });
    }
  }, [vehicle, companyId]);

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (vehicle) {
        const payload: UpdateVehiclePayload = { ...form };
        await vehiclesApi.updateVehicle(vehicle._id, payload);
      } else {
        await vehiclesApi.createVehicle(form);
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl p-6">
        <div className="flex justify-between mb-6">
          <h3>{vehicle ? t('editVehicle') : t('addNewVehicle')}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            value={form.vehicleNumber}
            onChange={e => handleChange('vehicleNumber', e.target.value)}
            placeholder="51B-12345"
            className="w-full input"
          />

          <input
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            placeholder="Sleeper"
            className="w-full input"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={form.seatRows}
              onChange={e => handleChange('seatRows', Number(e.target.value))}
              className="input"
              placeholder="Rows"
            />
            <input
              type="number"
              value={form.seatColumns}
              onChange={e => handleChange('seatColumns', Number(e.target.value))}
              className="input"
              placeholder="Columns"
            />
            <input
              type="number"
              value={form.floors}
              onChange={e => handleChange('floors', Number(e.target.value))}
              className="input"
              placeholder="Floors"
            />
          </div>

          <select
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            className="w-full input"
          >
            <option value="active">{t('active')}</option>
            <option value="maintenance">{t('maintenance')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-xl"
          >
            {vehicle ? t('update') : t('add')}
          </button>
        </div>
      </div>
    </div>
  );
}
