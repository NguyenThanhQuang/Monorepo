import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';

import type { VehiclePayload } from "../types/vehicle.types";
import type { Vehicle } from '@obtp/shared-types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: VehiclePayload, id?: string) => Promise<void>;
  companyId: string;
  vehicle?: Vehicle | null;
}

export default function VehicleDialog({
  open,
  onClose,
  onSave,
  companyId,
  vehicle,
}: Props) {
  const isEdit = Boolean(vehicle);

  const [form, setForm] = useState<VehiclePayload>({
    vehicleNumber: '',
    type: '',
    totalSeats: 0,
    companyId,
  });

  /* ===== LOAD DATA WHEN EDIT ===== */
  useEffect(() => {
    if (vehicle) {
      setForm({
        vehicleNumber: vehicle.vehicleNumber || '',
        type: vehicle.type || '',
        totalSeats: vehicle.totalSeats || 0,
        companyId,
      });
    } else {
      setForm({
        vehicleNumber: '',
        type: '',
        totalSeats: 0,
        companyId,
      });
    }
  }, [vehicle, companyId]);

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (
    key: keyof VehiclePayload,
    value: any,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    try {
      if (isEdit && vehicle) {
        await onSave(form, vehicle._id);
      } else {
        await onSave(form);
      }
      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {isEdit ? 'Sửa xe' : 'Thêm xe'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Biển số xe"
            value={form.vehicleNumber}
            onChange={(e) =>
              handleChange('vehicleNumber', e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Loại xe"
            value={form.type}
            onChange={(e) =>
              handleChange('type', e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Tổng số ghế"
            type="number"
            value={form.totalSeats}
            onChange={(e) =>
              handleChange('totalSeats', Number(e.target.value))
            }
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}