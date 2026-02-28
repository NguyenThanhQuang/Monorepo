import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  type SelectChangeEvent,
} from "@mui/material";

import {
  CompanyStatus,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
  type CompanyStatsResponse,
} from "@obtp/shared-types";

interface AddCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: CreateCompanyPayload | UpdateCompanyPayload,
    id?: string
  ) => Promise<void>;
  companyToEdit?: CompanyStatsResponse | null;
}

export const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({
  open,
  onClose,
  onSave,
  companyToEdit,
}) => {
  const isEditMode = Boolean(companyToEdit);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCompanyPayload>({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    logoUrl: "",
    status: CompanyStatus.INACTIVE,
    adminName: "",
    adminEmail: "",
    adminPhone: "",
  });

  // ================= FILL DATA WHEN EDIT =================
  useEffect(() => {
    if (companyToEdit) {
      setFormData({
        name: companyToEdit.name,
        code: companyToEdit.code,
        address: companyToEdit.address ?? "",
        phone: companyToEdit.phone ?? "",
        email: companyToEdit.email ?? "",
        description: companyToEdit.description ?? "",
        logoUrl: companyToEdit.logoUrl ?? "",
        status: companyToEdit.status,
        adminName: "",
        adminEmail: "",
        adminPhone: "",
      });
    }
  }, [companyToEdit]);

  const handleChange =
    (field: keyof CreateCompanyPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      status: event.target.value as CompanyStatus,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isEditMode && companyToEdit) {
        const updatePayload: UpdateCompanyPayload = {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          logoUrl: formData.logoUrl,
          status: formData.status,
        };

        await onSave(updatePayload, companyToEdit._id);
      } else {
        await onSave(formData);
      }

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditMode ? "Cập nhật công ty" : "Tạo công ty mới"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên công ty"
              value={formData.name}
              onChange={handleChange("name")}
              required
            />
          </Grid>

          {!isEditMode && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã công ty"
                value={formData.code}
                onChange={handleChange("code")}
                required
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={handleStatusChange}
              >
                <MenuItem value={CompanyStatus.ACTIVE}>
                  Active
                </MenuItem>
                <MenuItem value={CompanyStatus.INACTIVE}>
                  Inactive
                </MenuItem>
                <MenuItem value={CompanyStatus.PENDING}>
                  Pending
                </MenuItem>
                <MenuItem value={CompanyStatus.SUSPENDED}>
                  Suspended
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ"
              value={formData.address}
              onChange={handleChange("address")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.phone}
              onChange={handleChange("phone")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={handleChange("email")}
            />
          </Grid>

          {!isEditMode && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên Admin"
                  value={formData.adminName}
                  onChange={handleChange("adminName")}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Admin"
                  value={formData.adminEmail}
                  onChange={handleChange("adminEmail")}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SĐT Admin"
                  value={formData.adminPhone}
                  onChange={handleChange("adminPhone")}
                  required
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={22} />
          ) : isEditMode ? (
            "Cập nhật"
          ) : (
            "Tạo công ty"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};