import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { vehiclesService } from '../services/vehicles.service';
import type { Vehicle } from '../services/vehicles.service';
import VehicleDialog from '../components/VehicleDialog';

interface Props {
  companyId: string;
}

export default function VehicleManagementPage({ companyId }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  /* ===== LOAD DATA ===== */
  const fetchVehicles = async () => {
    const data = await vehiclesService.getByCompany(companyId);
    setVehicles(data);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* ===== DELETE ===== */
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xoá xe?')) return;

    await vehiclesService.delete(id);
    fetchVehicles();
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h5">Quản lý xe</Typography>

        <Button
          variant="contained"
          onClick={() => {
            setSelectedVehicle(null);
            setOpenDialog(true);
          }}
        >
          Thêm xe
        </Button>
      </Stack>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Biển số</TableCell>
              <TableCell>Loại xe</TableCell>
              <TableCell>Hãng</TableCell>
              <TableCell>Năm SX</TableCell>
              <TableCell>Số ghế</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v._id}>
                <TableCell>{v.vehicleNumber}</TableCell>
                <TableCell>{v.vehicleType}</TableCell>
                <TableCell>{v.brand}</TableCell>
                <TableCell>{v.manufactureYear}</TableCell>
                <TableCell>{v.totalSeats}</TableCell>
                <TableCell>{v.status}</TableCell>

                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedVehicle(v);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(v._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* ===== DIALOG ===== */}
      <VehicleDialog
        open={openDialog}
        companyId={companyId}
        vehicle={selectedVehicle}
        onClose={() => {
          setOpenDialog(false);
          fetchVehicles();
        }}
      />
    </Box>
  );
}
