// src/features/trips/add-trip/AddTripContainer.tsx
import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import { Save, NavigateNext, NavigateBefore, ArrowBack, Add } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import type { AddTripFormState, Vehicle, LocationData, Company } from '@obtp/shared-types';
import { CompanyStatus, UserRole } from '@obtp/shared-types';
import BasicInfoStep from './BasicInfoStep';
import ScheduleStep from './ScheduleStep';
import PricingStep from './PricingStep';
import PreviewStep from './PreviewStep';

interface AddTripContainerProps {
  onClose?: () => void;
}

interface SimpleVehicle {
  _id: string;
  id: string;
  licensePlate: string;
  vehicleNumber?: string;
  name?: string;
  brand?: string;
  model?: string;
  type?: string;
  capacity: number;
  totalSeats?: number;
  companyId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  companyName?: string;
}

const API_BASE_URL = 'http://localhost:3001/api/v1';

const parseDateField = (dateValue: string | Date | undefined): Date => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  try {
    return new Date(dateValue);
  } catch {
    return new Date();
  }
};

const parseCompanyResponse = (data: any): Company => {
  return {
    ...data,
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
  };
};

const parseLocationResponse = (data: any): LocationData => {
  return {
    ...data,
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
  };
};

const parseVehicleResponse = (data: any): SimpleVehicle => {
  const licensePlate = data.licensePlate || data.vehicleNumber || 'Không có biển số';
  const brand = data.brand || '';
  const model = data.model || '';
  const name = data.name || (brand && model ? `${brand} ${model}` : brand || model || licensePlate);
  const capacity = data.capacity || data.totalSeats || 0;
  const type = data.type || 'standard';
  
  let companyId = '';
  let companyName = '';
  
  if (typeof data.companyId === 'string') {
    companyId = data.companyId;
  } else if (data.companyId && data.companyId._id) {
    companyId = data.companyId._id.toString();
    companyName = data.companyId.name || '';
  } else if (data.companyId) {
    companyId = data.companyId.toString();
  }
  
  return {
    _id: data._id || data.id,
    id: data._id || data.id,
    licensePlate,
    vehicleNumber: licensePlate,
    name,
    brand,
    model,
    type,
    capacity,
    totalSeats: capacity,
    companyId,
    status: data.status || 'ACTIVE',
    companyName: companyName || data.companyName || '',
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
  };
};

const extractDataFromResponse = <T,>(response: any): T[] => {
  if (!response) return [];
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  } else if (Array.isArray(response)) {
    return response;
  }
  return [];
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  
  return response;
};

const useCurrentUser = () => {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: 'ADMIN' | 'COMPANY_ADMIN' | 'USER';
    companyId?: string;
    companyName?: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setUser(null);
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        const roles = userData.roles || [];
        
        const isCompanyAdmin = roles.includes('company_admin');
        const isSystemAdmin = roles.includes('admin');
        
        let role: 'ADMIN' | 'COMPANY_ADMIN' | 'USER' = 'USER';
        if (isSystemAdmin) {
          role = 'ADMIN';
        } else if (isCompanyAdmin) {
          role = 'COMPANY_ADMIN';
        }
        
        if (role === 'ADMIN' || role === 'COMPANY_ADMIN') {
          const userObj = {
            id: userData._id || userData.id || userData.userId,
            name: userData.name || userData.username || 'User',
            role,
            companyId: userData.companyId,
            companyName: userData.companyName,
            token,
          };
          setUser(userObj);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    };
    
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  return user;
};

const AddTripContainer: React.FC<AddTripContainerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [loginAlertMessage, setLoginAlertMessage] = useState('');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allVehicles, setAllVehicles] = useState<SimpleVehicle[]>([]);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState({
    companies: false,
    vehicles: false,
    locations: false,
  });

  const [formData, setFormData] = useState<AddTripFormState>({
    companyId: user?.role === 'COMPANY_ADMIN' && user.companyId ? user.companyId : '',
    vehicleId: null,
    fromLocationId: null,
    toLocationId: null,
    departureTime: dayjs().add(1, 'day').hour(8).minute(0),
    expectedArrivalTime: dayjs().add(1, 'day').hour(12).minute(0),
    price: 0,
    stops: [],
    isRecurrenceTemplate: false,
  });

  useEffect(() => {
    if (user?.role === 'COMPANY_ADMIN' && user.companyId) {
      setFormData(prev => ({
        ...prev,
        companyId: user.companyId || ''
      }));
    }
  }, [user]);

  const handleLogoutAndRedirect = (message: string) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    setLoginAlertMessage(message);
    setShowLoginAlert(true);
    
    setTimeout(() => {
      window.location.href = '/admin-login';
    }, 2000);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setSubmitError('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      if (!user.token) {
        setSubmitError('Token không hợp lệ');
        return;
      }

      try {
        setLoading(prev => ({ ...prev, locations: true, companies: true }));
        
        try {
          const locationsRes = await fetch(`${API_BASE_URL}/locations`);
          if (locationsRes.ok) {
            const response = await locationsRes.json();
            const locationsData = extractDataFromResponse<LocationData>(response);
            const parsedLocations = locationsData.map(parseLocationResponse);
            setAllLocations(parsedLocations);
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        }

        if (user.role === 'COMPANY_ADMIN' && user.companyId) {
          try {
            const companyUrl = `${API_BASE_URL}/companies/${user.companyId}`;
            const companyRes = await fetchWithAuth(companyUrl);
            
            if (companyRes.ok) {
              const response = await companyRes.json();
              let companyData: any = response;
              if (response.data) {
                companyData = response.data;
              }
              
              const parsedCompany = parseCompanyResponse(companyData);
              
              if (parsedCompany.status === CompanyStatus.ACTIVE) {
                setAllCompanies([parsedCompany]);
                setFormData(prev => ({
                  ...prev,
                  companyId: parsedCompany._id
                }));
              } else {
                setSubmitError(`Nhà xe ${parsedCompany.name} không đang hoạt động`);
              }
            }
          } catch (error: any) {
            console.error('Error fetching company:', error.message);
            if (error.message.includes('Phiên đăng nhập hết hạn')) {
              handleLogoutAndRedirect(error.message);
            } else {
              setSubmitError(`Lỗi khi tải thông tin nhà xe: ${error.message}`);
            }
          }
        } else if (user.role === 'ADMIN') {
          try {
            const companiesRes = await fetchWithAuth(`${API_BASE_URL}/companies`);
            if (companiesRes.ok) {
              const response = await companiesRes.json();
              const companiesData = extractDataFromResponse<Company>(response);
              const parsedCompanies = companiesData.map(parseCompanyResponse);
              const activeCompanies = parsedCompanies.filter((c: Company) => c.status === CompanyStatus.ACTIVE);
              setAllCompanies(activeCompanies);
            }
          } catch (error: any) {
            console.error('Error fetching companies:', error.message);
          }
        }
      } catch (error: any) {
        console.error('Error in fetchInitialData:', error);
      } finally {
        setLoading(prev => ({ ...prev, locations: false, companies: false }));
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.companyId || formData.companyId === '') {
        setAllVehicles([]);
        return;
      }

      setLoading(prev => ({ ...prev, vehicles: true }));
      
      try {
        const vehiclesUrl = `${API_BASE_URL}/vehicles/companyId/${formData.companyId}`;
        const res = await fetchWithAuth(vehiclesUrl);
        
        if (res.ok) {
          const response = await res.json();
          
          let vehiclesData = [];
          if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
          } else if (Array.isArray(response)) {
            vehiclesData = response;
          }
          
          const parsedVehicles = vehiclesData.map(parseVehicleResponse);
          setAllVehicles(parsedVehicles);
        } else {
          setAllVehicles([]);
        }
      } catch (error: any) {
        console.error('Error fetching vehicles:', error.message);
        setAllVehicles([]);
      } finally {
        setLoading(prev => ({ ...prev, vehicles: false }));
      }
    };

    if (formData.companyId) {
      fetchVehicles();
    } else {
      setAllVehicles([]);
    }
  }, [formData.companyId]);

  const handleFormChange = <K extends keyof AddTripFormState>(
    field: K,
    value: AddTripFormState[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddStop = () => {
    const newStop = {
      id: `stop_${Date.now()}`,
      locationId: '',
      expectedArrivalTime: formData.departureTime ? formData.departureTime.add(1, 'hour') : dayjs().add(1, 'hour'),
      expectedDepartureTime: formData.departureTime ? formData.departureTime.add(1, 'hour').add(10, 'minute') : dayjs().add(1, 'hour').add(10, 'minute'),
    };
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
  };

  const handleRemoveStop = (stopId: string) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter(stop => stop.id !== stopId)
    }));
  };

  const handleUpdateStop = <K extends keyof any>(
    stopId: string,
    field: K,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.map(stop =>
        stop.id === stopId ? { ...stop, [field]: value } : stop
      )
    }));
  };

  const steps = [
    { label: 'Thông tin cơ bản', description: 'Chọn nhà xe, xe và điểm đi/đến' },
    { label: 'Lịch trình', description: 'Thời gian và điểm dừng' },
    { label: 'Giá vé', description: 'Đặt giá vé' },
    { label: 'Xem trước', description: 'Kiểm tra thông tin' },
  ];

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.companyId) {
          alert('Vui lòng chọn nhà xe');
          return false;
        }
        if (!formData.vehicleId) {
          alert('Vui lòng chọn xe');
          return false;
        }
        if (!formData.fromLocationId || !formData.toLocationId) {
          alert('Vui lòng chọn điểm đi và điểm đến');
          return false;
        }
        return true;
      case 1:
        if (!formData.departureTime || !formData.expectedArrivalTime) {
          alert('Vui lòng chọn thời gian khởi hành và đến dự kiến');
          return false;
        }
        if (formData.departureTime.isAfter(formData.expectedArrivalTime)) {
          alert('Thời gian khởi hành phải trước thời gian đến');
          return false;
        }
        return true;
      case 2:
        if (formData.price <= 0) {
          alert('Vui lòng nhập giá vé hợp lệ');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      setSubmitError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (!formData.companyId || !formData.vehicleId || 
          !formData.fromLocationId || !formData.toLocationId) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      if (!formData.departureTime || !formData.expectedArrivalTime) {
        throw new Error('Vui lòng chọn thời gian khởi hành và đến');
      }

      const payload = {
        companyId: formData.companyId,
        vehicleId: formData.vehicleId as string,
        route: {
          fromLocationId: formData.fromLocationId as string,
          toLocationId: formData.toLocationId as string,
          stops: formData.stops
            .filter(stop => stop.locationId)
            .map(stop => ({
              locationId: stop.locationId,
              expectedArrivalTime: stop.expectedArrivalTime?.toISOString(),
              expectedDepartureTime: stop.expectedDepartureTime?.toISOString(),
            })),
        },
        departureTime: formData.departureTime.toISOString(),
        expectedArrivalTime: formData.expectedArrivalTime.toISOString(),
        price: formData.price,
        isRecurrenceTemplate: formData.isRecurrenceTemplate,
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/trips`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Có lỗi xảy ra khi tạo chuyến đi');
      }

      setSubmitSuccess(true);
      
      setTimeout(() => {
        setFormData({
          companyId: user?.role === 'COMPANY_ADMIN' && user.companyId ? user.companyId : '',
          vehicleId: null,
          fromLocationId: null,
          toLocationId: null,
          departureTime: dayjs().add(1, 'day').hour(8).minute(0),
          expectedArrivalTime: dayjs().add(1, 'day').hour(12).minute(0),
          price: 0,
          stops: [],
          isRecurrenceTemplate: false,
        });
        setCurrentStep(0);
        setSubmitSuccess(false);
        
        if (onClose) {
          onClose();
        } else {
          navigate('/company/trips');
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/company/trips');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            
            {user?.role === 'ADMIN' && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Chọn nhà xe</InputLabel>
                <Select
                  label="Chọn nhà xe"
                  value={formData.companyId || ''}
                  onChange={(e) => handleFormChange('companyId', e.target.value)}
                  disabled={loading.companies}
                >
                  {loading.companies ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> Đang tải...
                    </MenuItem>
                  ) : allCompanies.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không có nhà xe nào
                    </MenuItem>
                  ) : (
                    allCompanies.map((company) => (
                      <MenuItem key={company._id} value={company._id}>
                        {company.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
            
            {user?.role === 'COMPANY_ADMIN' && user.companyName && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body1">
                  <strong>Nhà xe:</strong> {user.companyName}
                </Typography>
              </Box>
            )}
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Chọn xe</InputLabel>
              <Select
                label="Chọn xe"
                value={formData.vehicleId || ''}
                onChange={(e) => handleFormChange('vehicleId', e.target.value)}
                disabled={loading.vehicles || allVehicles.length === 0}
              >
                {loading.vehicles ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Đang tải...
                  </MenuItem>
                ) : allVehicles.length === 0 ? (
                  <MenuItem value="" disabled>
                    Không có xe nào
                  </MenuItem>
                ) : (
                  allVehicles.map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.licensePlate} - {vehicle.type} ({vehicle.capacity} ghế)
                    </MenuItem>
                  ))
                )}
              </Select>
              
              {allVehicles.length === 0 && !loading.vehicles && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Nhà xe chưa có xe nào được đăng ký.
                  </Alert>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/company/vehicles')}
                    startIcon={<Add />}
                  >
                    Thêm xe mới
                  </Button>
                </Box>
              )}
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Điểm đi</InputLabel>
                <Select
                  label="Điểm đi"
                  value={formData.fromLocationId || ''}
                  onChange={(e) => handleFormChange('fromLocationId', e.target.value)}
                  disabled={loading.locations}
                >
                  {loading.locations ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> Đang tải...
                    </MenuItem>
                  ) : allLocations.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không có địa điểm
                    </MenuItem>
                  ) : (
                    allLocations.map((location) => (
                      <MenuItem key={location._id} value={location._id}>
                        {location.name} ({location.province})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Điểm đến</InputLabel>
                <Select
                  label="Điểm đến"
                  value={formData.toLocationId || ''}
                  onChange={(e) => handleFormChange('toLocationId', e.target.value)}
                  disabled={loading.locations}
                >
                  {loading.locations ? (
                    <MenuItem value="">
                      <CircularProgress size={20} /> Đang tải...
                    </MenuItem>
                  ) : allLocations.length === 0 ? (
                    <MenuItem value="" disabled>
                      Không có địa điểm
                    </MenuItem>
                  ) : (
                    allLocations.map((location) => (
                      <MenuItem key={location._id} value={location._id}>
                        {location.name} ({location.province})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        );
      case 1:
        return (
          <ScheduleStep
            formData={formData}
            onFormChange={handleFormChange}
            onAddStop={handleAddStop}
            onRemoveStop={handleRemoveStop}
            onUpdateStop={handleUpdateStop}
            allLocations={allLocations}
            isCalculating={false}
          />
        );
      case 2:
        return <PricingStep formData={formData} onFormChange={handleFormChange} />;
      case 3:
        const vehicleData = allVehicles.find(v => v._id === formData.vehicleId);
        const fromLocationData = allLocations.find(l => l._id === formData.fromLocationId);
        const toLocationData = allLocations.find(l => l._id === formData.toLocationId);
        
        return (
          <PreviewStep
            formData={formData}
            vehicleData={vehicleData as any}
            fromLocationData={fromLocationData}
            toLocationData={toLocationData}
            stopsData={[]}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Vui lòng đăng nhập để sử dụng chức năng này
        </Alert>
        <Button 
          onClick={() => window.location.href = '/admin-login'}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Đi đến trang đăng nhập
        </Button>
      </Container>
    );
  }

  if (!['ADMIN', 'COMPANY_ADMIN'].includes(user.role)) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập chức năng này
        </Alert>
        <Button 
          onClick={handleClose} 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={handleClose}
            startIcon={<ArrowBack />}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          >
            Quay lại
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Tạo chuyến đi mới
                <Chip 
                  label={user.role === 'ADMIN' ? 'Quản trị hệ thống' : 'Quản trị nhà xe'} 
                  color={user.role === 'ADMIN' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {steps[currentStep].description}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Bước {currentStep + 1}/{steps.length}
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Tạo chuyến đi thành công! Đang quay lại...
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            {currentStep > 0 ? (
              <Button
                onClick={handleBack}
                disabled={isSubmitting}
                startIcon={<NavigateBefore />}
              >
                Quay lại
              </Button>
            ) : (
              <Button
                onClick={handleClose}
                startIcon={<ArrowBack />}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {currentStep === steps.length - 1 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Thoát
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo chuyến đi'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNext />}
              >
                Tiếp theo
              </Button>
            )}
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={showLoginAlert}
        autoHideDuration={3000}
        onClose={() => setShowLoginAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowLoginAlert(false)}>
          {loginAlertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTripContainer;