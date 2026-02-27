import { Button, Box, Typography, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import { useCompanyVehicles } from '../hooks/useCompanyVehicles';
import VehicleStats from '../components/VehicleStats';
import VehicleTable from '../components/VehicleTable';
import AddVehicleDialog from '../components/VehicleDialog';

export default function CompanyVehiclesPage() {
  const vm = useCompanyVehicles();
  const navigate = useNavigate();

  if (!vm.companyId) {
    return (
      <div className="obtp-card obtp-card-strong" style={{ padding: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>Quản lý xe</div>
        <div style={{ color: 'var(--obtp-muted2)', marginBottom: 12 }}>
          Tài khoản hiện tại chưa có <strong>companyId</strong> nên không tải được dữ liệu xe.
        </div>
        <div style={{ color: 'var(--obtp-muted2)', fontSize: 13, lineHeight: 1.6 }}>
          Bạn có thể:
          <ul style={{ margin: '8px 0 0 18px' }}>
            <li>Đăng nhập bằng tài khoản <strong>company_admin</strong> đã gắn companyId.</li>
            <li>Hoặc vào <strong>Cài đặt</strong> để kiểm tra token / thông tin đăng nhập.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/company/dashboard')}>
          Quay lại
        </Button>
        <Typography variant="h5">Quản lý xe</Typography>
      </Box>

      {vm.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {vm.error}
        </Alert>
      )}

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
