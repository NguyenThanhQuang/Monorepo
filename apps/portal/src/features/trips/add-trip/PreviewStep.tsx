import React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import {
  DirectionsBus,
  LocationOn,
  Schedule,
  AttachMoney,
  Repeat,
} from "@mui/icons-material";

import type { AddTripFormState, LocationData, Vehicle } from "@obtp/shared-types";

interface PreviewStepProps {
  formData: AddTripFormState;
  vehicleData?: Vehicle;
  fromLocationData?: LocationData;
  toLocationData?: LocationData;
  stopsData: (LocationData & {
    arrivalTime?: string;
    departureTime?: string;
  })[];
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value}
    </Typography>
  </Box>
);

const PreviewStep: React.FC<PreviewStepProps> = ({
  formData,
  vehicleData,
  fromLocationData,
  toLocationData,
  stopsData,
}) => {
  // Helper để format time với kiểm tra null
  const formatTime = (date: Dayjs | null) => {
    if (!date || !date.isValid()) return "N/A";
    return date.toDate().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper để format date với kiểm tra null
  const formatDate = (date: Dayjs | null) => {
    if (!date || !date.isValid()) return "N/A";
    return date.toDate().toLocaleDateString("vi-VN");
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={3}>
          {/* Cột trái */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <DirectionsBus sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Thông tin chuyến và xe</Typography>
              {formData.isRecurrenceTemplate && (
                <Chip
                  icon={<Repeat />}
                  label="Chuyến mẫu"
                  color="secondary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
          
            <InfoRow label="Loại xe" value={vehicleData?.type || "N/A"} />
            <InfoRow label="Số ghế" value={vehicleData?.totalSeats || "N/A"} />
            <InfoRow 
              label="Loại chuyến" 
              value={
                formData.isRecurrenceTemplate 
                  ? "Chuyến mẫu (lặp lại)" 
                  : "Chuyến một lần"
              } 
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Giá vé</Typography>
            </Box>
            <InfoRow
              label="Giá vé cơ bản"
              value={formData.price.toLocaleString("vi-VN") + " VNĐ"}
            />
          </Grid>

          {/* Cột phải */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Schedule sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Lịch trình</Typography>
            </Box>
            <InfoRow label="Điểm đi" value={fromLocationData?.name || "N/A"} />
            <InfoRow label="Điểm đến" value={toLocationData?.name || "N/A"} />
            <InfoRow
              label="Ngày khởi hành"
              value={formatDate(formData.departureTime)}
            />
            <InfoRow
              label="Thời gian đi - đến"
              value={`${formatTime(formData.departureTime)} - ${formatTime(
                formData.expectedArrivalTime
              )}`}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Các điểm dừng</Typography>
            </Box>
            {stopsData.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stopsData.map((stop, index) => (
                  <Box
                    key={stop._id || `stop-${index}`}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minWidth: 120,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {stop.name}
                    </Typography>
                    {(stop.arrivalTime || stop.departureTime) && (
                      <Typography variant="caption" color="text.secondary">
                        {stop.arrivalTime && `Đến: ${stop.arrivalTime}`}
                        {stop.arrivalTime && stop.departureTime && ' • '}
                        {stop.departureTime && `Đi: ${stop.departureTime}`}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có điểm dừng trung gian.
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PreviewStep;