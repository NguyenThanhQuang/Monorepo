import React, { useMemo } from "react";
import { 
  Grid, 
  TextField, 
  Autocomplete, 
  Box, 
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from "@mui/material";
import type { AddTripFormState, LocationData, Vehicle, Company } from "@obtp/shared-types";
import { VehicleStatus, CompanyStatus } from "@obtp/shared-types";

interface BasicInfoStepProps {
  formData: AddTripFormState;
  onFormChange: <K extends keyof AddTripFormState>(
    field: K,
    value: AddTripFormState[K]
  ) => void;
  companyVehicles: Vehicle[];
  allLocations: LocationData[];
  allCompanies: Company[];
  loadingVehicles: boolean;
  loadingLocations: boolean;
  loadingCompanies: boolean;
  userRole: 'ADMIN' | 'COMPANY_ADMIN';
  userCompanyId?: string;
  userCompanyName?: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormChange,
  companyVehicles,
  allLocations,
  allCompanies,
  loadingVehicles,
  loadingLocations,
  loadingCompanies,
  userRole,
  userCompanyId,
  userCompanyName,
}) => {
  // Xác định company đang chọn - SỬA LẠI LOGIC NÀY
  const selectedCompany = useMemo(() => {
    if (userRole === 'COMPANY_ADMIN' && userCompanyId) {
      // COMPANY_ADMIN: tìm company trong allCompanies
      const company = allCompanies.find(c => c._id === userCompanyId);
      // Nếu không tìm thấy trong allCompanies, tạo một object giả
      if (!company && userCompanyName) {
        return {
          _id: userCompanyId,
          name: userCompanyName,
          status: CompanyStatus.ACTIVE,
        } as Company;
      }
      return company || null;
    }
    return allCompanies.find(c => c._id === formData.companyId) || null;
  }, [allCompanies, formData.companyId, userRole, userCompanyId, userCompanyName]);

  // Filter vehicles theo company đã chọn - SỬA: Luôn hiển thị tất cả xe khi là COMPANY_ADMIN
  const filteredVehicles = useMemo(() => {
    if (userRole === 'COMPANY_ADMIN' && userCompanyId) {
      // COMPANY_ADMIN: hiển thị tất cả xe từ API
      return companyVehicles;
    }
    
    if (!selectedCompany) return [];
    
    return companyVehicles.filter(v => {
      const vehicleCompanyId = typeof v.companyId === 'string' 
        ? v.companyId 
        : (v.companyId as any)?._id;
      return vehicleCompanyId === selectedCompany._id;
    });
  }, [companyVehicles, selectedCompany, userRole, userCompanyId]);

  // Filter locations
  const selectedLocationIds = useMemo(() => {
    const ids = new Set<string>();
    if (formData.toLocationId) ids.add(formData.toLocationId);
    formData.stops.forEach((stop) => {
      if (stop.locationId) ids.add(stop.locationId);
    });
    return ids;
  }, [formData.toLocationId, formData.stops]);

  const fromLocationOptions = useMemo(() => {
    return allLocations.filter((loc) => !selectedLocationIds.has(loc._id));
  }, [allLocations, selectedLocationIds]);

  const toLocationOptions = useMemo(() => {
    const ids = new Set<string>();
    if (formData.fromLocationId) ids.add(formData.fromLocationId);
    formData.stops.forEach((stop) => {
      if (stop.locationId) ids.add(stop.locationId);
    });
    return allLocations.filter((loc) => !ids.has(loc._id));
  }, [allLocations, formData.fromLocationId, formData.stops]);

  const selectedVehicle = filteredVehicles.find(v => v._id === formData.vehicleId);
  const fromLocation = allLocations.find(l => l._id === formData.fromLocationId);
  const toLocation = allLocations.find(l => l._id === formData.toLocationId);

  // Helper để hiển thị trạng thái company
  const getCompanyStatusDisplay = (status: CompanyStatus): string => {
    switch (status) {
      case CompanyStatus.ACTIVE: return '✅ Đang hoạt động';
      case CompanyStatus.INACTIVE: return '⛔ Ngừng hoạt động';
      case CompanyStatus.PENDING: return '⏳ Đang chờ';
      case CompanyStatus.SUSPENDED: return '🚫 Tạm ngưng';
      default: return '❓ Không xác định';
    }
  };

  // Helper để hiển thị trạng thái vehicle
  const getVehicleStatusDisplay = (status: VehicleStatus): string => {
    switch (status) {
      case VehicleStatus.ACTIVE: return '✅ Sẵn sàng';
      case VehicleStatus.MAINTENANCE: return '🔧 Bảo trì';
      case VehicleStatus.INACTIVE: return '⛔ Không khả dụng';
      default: return '❓ Không xác định';
    }
  };

  // Xác định xem có nên hiển thị dropdown xe không - SỬA
  const shouldShowVehicleSelect = () => {
    // COMPANY_ADMIN: luôn hiển thị dropdown xe
    if (userRole === 'COMPANY_ADMIN') return true;
    
    // ADMIN: hiển thị nếu đã chọn company
    if (userRole === 'ADMIN' && selectedCompany) return true;
    
    return false;
  };

  return (
    <Grid container spacing={3}>
      {/* Thông báo role */}
      {userRole === 'COMPANY_ADMIN' && userCompanyName && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="subtitle2">
              Bạn đang tạo chuyến đi cho <strong>{userCompanyName}</strong>
            </Typography>
          </Alert>
        </Grid>
      )}

      {/* Chọn Company - Chỉ hiện cho ADMIN */}
      {userRole === 'ADMIN' && (
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            fullWidth
            options={allCompanies}
            loading={loadingCompanies}
            getOptionLabel={(option) => option.name}
            value={selectedCompany}
            onChange={(_, newValue) => {
              onFormChange("companyId", newValue?._id || '');
              // Reset vehicle và locations khi đổi company
              onFormChange("vehicleId", null);
              onFormChange("fromLocationId", null);
              onFormChange("toLocationId", null);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Chọn nhà xe" 
                required 
                helperText="Chọn nhà xe sẽ thực hiện chuyến đi này"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                <Box>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCompanyStatusDisplay(option.status)} • 
                    {option.email ? ` 📧 ${option.email}` : ''}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Grid>
      )}

      {/* Thông báo cần chọn company trước */}
      {userRole === 'ADMIN' && !selectedCompany && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning">
            Vui lòng chọn nhà xe trước khi tiếp tục
          </Alert>
        </Grid>
      )}

      {/* Chọn Vehicle - SỬA: HIỂN THỊ CHO CẢ COMPANY_ADMIN VÀ ADMIN */}
      {shouldShowVehicleSelect() && (
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            fullWidth
            options={filteredVehicles}
            loading={loadingVehicles}
            getOptionLabel={(option) =>
              `${ option.vehicleNumber || option.type} - ${option.type} (${option.totalSeats} ghế)`
            }
            value={selectedVehicle || null}
            onChange={(_, newValue) =>
              onFormChange("vehicleId", newValue?._id || null)
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Chọn xe" 
                required 
                helperText={
                  userRole === 'COMPANY_ADMIN' 
                    ? `Xe của ${userCompanyName}` 
                    : selectedCompany 
                      ? `Xe của ${selectedCompany.name}`
                      : "Vui lòng chọn nhà xe trước"
                }
                disabled={userRole === 'ADMIN' && !selectedCompany}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                <Box>
                  <Typography variant="body1">
                    { option.vehicleNumber || 'Không số'} - {option.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số ghế: {option.totalSeats} • Trạng thái: {getVehicleStatusDisplay(option.status)}
                  </Typography>
                </Box>
              </Box>
            )}
            noOptionsText={
              loadingVehicles ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Đang tải danh sách xe...
                </Box>
              ) : filteredVehicles.length === 0 ? (
                <Box sx={{ py: 2 }}>
                  {userRole === 'COMPANY_ADMIN' 
                    ? "Nhà xe của bạn chưa có xe nào được đăng ký. Vui lòng thêm xe trước khi tạo chuyến đi."
                    : "Không có xe nào khả dụng cho nhà xe này"}
                </Box>
              ) : "Không tìm thấy xe phù hợp"
            }
          />
          
          {/* Thông báo nếu không có xe nào - SỬA */}
          {!loadingVehicles && filteredVehicles.length === 0 && shouldShowVehicleSelect() && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {userRole === 'COMPANY_ADMIN'
                ? "Nhà xe của bạn chưa có xe nào được đăng ký. Vui lòng thêm xe trước khi tạo chuyến đi."
                : "Nhà xe này chưa có xe nào khả dụng. Vui lòng chọn nhà xe khác hoặc thêm xe mới."}
            </Alert>
          )}
        </Grid>
      )}

      {/* Chọn điểm đi - chỉ hiện khi đã có vehicle */}
      {formData.vehicleId && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            fullWidth
            options={fromLocationOptions}
            loading={loadingLocations}
            getOptionLabel={(option) => option.name}
            value={fromLocation || null}
            onChange={(_, newValue) =>
              onFormChange("fromLocationId", newValue?._id || null)
            }
            renderInput={(params) => (
              <TextField {...params} label="Điểm khởi hành" required />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                {option.name}, {option.province}
              </Box>
            )}
          />
        </Grid>
      )}

      {/* Chọn điểm đến - chỉ hiện khi đã có fromLocation */}
      {formData.fromLocationId && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            fullWidth
            options={toLocationOptions}
            loading={loadingLocations}
            getOptionLabel={(option) => option.name}
            value={toLocation || null}
            onChange={(_, newValue) =>
              onFormChange("toLocationId", newValue?._id || null)
            }
            renderInput={(params) => (
              <TextField {...params} label="Điểm đến" required />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                {option.name}, {option.province}
              </Box>
            )}
          />
        </Grid>
      )}

      {/* Option: Tạo chuyến lặp lại */}
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isRecurrenceTemplate}
              onChange={(e) => onFormChange("isRecurrenceTemplate", e.target.checked)}
            />
          }
          label="Tạo chuyến đi mẫu (lặp lại hàng ngày)"
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfoStep;