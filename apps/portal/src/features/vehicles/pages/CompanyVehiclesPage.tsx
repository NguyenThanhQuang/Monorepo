// src/features/vehicles/pages/CompanyVehiclesPage.tsx
import { Button, Box, Typography, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import { useCompanyVehicles } from "../hooks/useCompanyVehicles";
import VehicleStats from "../components/VehicleStats";
import VehicleTable from "../components/VehicleTable";
import AddVehicleDialog from "../components/VehicleDialog";

export default function CompanyVehiclesPage() {
  const vm = useCompanyVehicles();
  const navigate = useNavigate();

  if (!vm.companyId) return null;

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/company/dashboard')}
        >
          Quay lại
        </Button>
        <Typography variant="h5">
          Quản lý xe
        </Typography>
      </Box>

      {vm.error && <Alert severity="error" sx={{ mb: 2 }}>{vm.error}</Alert>}

      <VehicleStats stats={vm.stats} />

      <Button
        startIcon={<AddIcon />}
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          vm.setEditingVehicle(null);
          vm.setDialogOpen(true);
        }}
      >
        Thêm xe mới
      </Button>

      {vm.loading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : (
        <VehicleTable
          vehicles={vm.vehicles}
          onEdit={(v: any) => {
            vm.setEditingVehicle(v);
            vm.setDialogOpen(true);
          }}
          onDelete={vm.deleteVehicle}
        />
      )}

      {/* SỬA: Dùng dialog mới */}
      <AddVehicleDialog
        open={vm.dialogOpen}
        onClose={() => {
          vm.setDialogOpen(false);
          vm.setEditingVehicle(null);
        }}
        onSave={vm.saveVehicle}
        vehicleToEdit={vm.editingVehicle}
        companyId={vm.companyId}
      />
    </Box>
  );
}