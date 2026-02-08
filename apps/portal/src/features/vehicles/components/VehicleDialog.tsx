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

import {
  vehiclesService,
  type VehiclePayload,
} from '../services/vehicles.service';
import type { Vehicle } from "@obtp/shared-types";
interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  vehicle?: Vehicle | null;
}

export default function VehicleDialog({
  open,
  onClose,
  companyId,
  vehicle,
}: Props) {
  const isEdit = Boolean(vehicle);

  const [form, setForm] = useState<VehiclePayload>({
    vehicleNumber: '',
    vehicleType: '',
    brand: '',
    manufactureYear: new Date().getFullYear(),
    totalSeats: 0,
    companyId,
  });

  /* ===== LOAD DATA WHEN EDIT ===== */
  useEffect(() => {
    if (vehicle) {
      setForm({
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.type,
        brand: vehicle.brand,
        manufactureYear: vehicle.manufactureYear,
        totalSeats: vehicle.totalSeats,
        companyId,
      });
    }
  }, [vehicle]);

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (
    key: keyof VehiclePayload,
    value: any,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    if (isEdit && vehicle) {
      await vehiclesService.update(vehicle._id, form);
    } else {
      await vehiclesService.create(form);
    }

    onClose();
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
            value={form.vehicleType}
            onChange={(e) =>
              handleChange('vehicleType', e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Hãng xe"
            value={form.brand}
            onChange={(e) =>
              handleChange('brand', e.target.value)
            }
            fullWidth
          />

          <TextField
            label="Năm sản xuất"
            type="number"
            value={form.manufactureYear}
            onChange={(e) =>
              handleChange('manufactureYear', Number(e.target.value))
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
