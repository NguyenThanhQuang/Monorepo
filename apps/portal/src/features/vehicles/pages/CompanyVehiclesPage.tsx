import { Button, Box, Typography, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import { useCompanyVehicles } from "../hooks/useCompanyVehicles";
import VehicleStats from "../components/VehicleStats";
import VehicleTable from "../components/VehicleTable";
import VehicleDialog from "../components/VehicleDialog";

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

      {vm.error && <Alert severity="error">{vm.error}</Alert>}

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
        Thêm xe
      </Button>

      <VehicleTable
        vehicles={vm.vehicles}
        onEdit={(v:any) => {
          vm.setEditingVehicle(v);
          vm.setDialogOpen(true);
        }}
        onDelete={vm.deleteVehicle}
      />

      <VehicleDialog
        open={vm.dialogOpen}
        onClose={() => vm.setDialogOpen(false)}
        onSave={vm.saveVehicle}
        vehicle={vm.editingVehicle}
        companyId={vm.companyId}
      />
    </Box>
  );
}