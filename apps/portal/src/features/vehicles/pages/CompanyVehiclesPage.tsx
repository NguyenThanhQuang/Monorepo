import { Button, Box, Typography, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useCompanyVehicles } from "../hooks/useCompanyVehicles";
import VehicleStats from "../components/VehicleStats";
import VehicleTable from "../components/VehicleTable";
import VehicleDialog from "../components/VehicleDialog";

export default function CompanyVehiclesPage() {
  const vm = useCompanyVehicles();

  if (!vm.companyId) return null;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        Quản lý xe
      </Typography>

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
