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

import type { AddTripFormState, LocationData, Company, Vehicle, Trip } from '@obtp/shared-types';
import { CompanyStatus, VehicleStatus } from '@obtp/shared-types';
import { useAuth } from '../../../contexts/AuthContext';
import BasicInfoStep from './BasicInfoStep';
import ScheduleStep from './ScheduleStep';
import PricingStep from './PricingStep';
import PreviewStep from './PreviewStep';

interface AddTripContainerProps {
  onClose?: () => void;
}

interface SimpleVehicle extends Omit<Vehicle, 'createdAt' | 'updatedAt'> {
  _id: string;
  id: string;
  licensePlate: string;
  vehicleNumber: string;
  name?: string;
  brand?: string;
  model?: string;
  type: string;
  capacity: number;
  totalSeats: number;
  companyId: string;
  status: VehicleStatus;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
  floors: number;
  seatRows: number;
  seatColumns: number;
  aislePositions: number[];
  seatMap?: any;
  seatMapFloor2?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

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
    _id: data.id || data._id || '',
    id: data.id || data._id || '',
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
  };
};

const parseLocationResponse = (data: any): LocationData => {
  return {
    ...data,
    _id: data.id || data._id || '',
    id: data.id || data._id || '',
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
  };
};

const parseVehicleResponse = (data: any): SimpleVehicle => {
  const vehicleNumber = data.vehicleNumber || 'Không có biển số';
  const brand = data.brand || '';
  const model = data.model || '';
  const name = data.name || (brand && model ? `${brand} ${model}` : brand || model || vehicleNumber);
  const capacity = data.totalSeats || data.capacity || 0;
  const type = data.type || 'standard';
  
  let companyId = '';
  let companyName = '';
  
  if (typeof data.companyId === 'string') {
    companyId = data.companyId;
  } else if (data.companyId && data.companyId.id) {
    companyId = data.companyId.id.toString();
    companyName = data.companyId.name || '';
  } else if (data.companyId && data.companyId._id) {
    companyId = data.companyId._id.toString();
    companyName = data.companyId.name || '';
  } else if (data.companyId) {
    companyId = data.companyId.toString();
  }
  
  let status: VehicleStatus = VehicleStatus.ACTIVE;
  if (data.status === 'inactive' || data.status === 'INACTIVE') {
    status = VehicleStatus.INACTIVE;
  } else if (data.status === 'maintenance' || data.status === 'MAINTENANCE') {
    status = VehicleStatus.MAINTENANCE;
  }
  
  return {
    _id: data.id || data._id || '',
    id: data.id || data._id || '',
    licensePlate: vehicleNumber,
    vehicleNumber: vehicleNumber,
    name,
    brand,
    model,
    type,
    capacity,
    totalSeats: capacity,
    companyId,
    status,
    companyName: companyName || data.companyName || '',
    createdAt: parseDateField(data.createdAt),
    updatedAt: parseDateField(data.updatedAt),
    floors: data.floors || 1,
    seatRows: data.seatRows || 0,
    seatColumns: data.seatColumns || 0,
    aislePositions: data.aislePositions || [],
    seatMap: data.seatMap,
    seatMapFloor2: data.seatMapFloor2,
    amenities: data.amenities || [],
    description: data.description,
    vehicle: data.vehicle,
  };
};

// THÊM: Hàm parse trip response để log chi tiết
const parseTripResponse = (data: any) => {
  console.log('Trip created successfully:', {
    _id: data._id || data.id,
    companyId: data.companyId,
    vehicleId: data.vehicleId,
    companyIdType: typeof data.companyId,
    vehicleIdType: typeof data.vehicleId,
    route: data.route,
    departureTime: data.departureTime,
    expectedArrivalTime: data.expectedArrivalTime,
    price: data.price,
    status: data.status,
    seatsCount: data.seats?.length,
    availableSeatsCount: data.availableSeatsCount,
    isRecurrenceTemplate: data.isRecurrenceTemplate,
    isRecurrenceActive: data.isRecurrenceActive,
  });
  
  return data;
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
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  
  return response;
};

const AddTripContainer: React.FC<AddTripContainerProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  
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

  // Xác định role dựa trên user từ context
  const userRole = user?.roles?.includes('admin') 
    ? 'ADMIN' 
    : user?.roles?.includes('company_admin') 
      ? 'COMPANY_ADMIN' 
      : 'USER';

  const [formData, setFormData] = useState<AddTripFormState>({
    companyId: userRole === 'COMPANY_ADMIN' && user?.companyId ? user.companyId : '',
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
    if (userRole === 'COMPANY_ADMIN' && user?.companyId) {
      setFormData(prev => ({
        ...prev,
        companyId: user.companyId || ''
      }));
    }
  }, [user, userRole]);

  const handleLogoutAndRedirect = (message: string) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setLoginAlertMessage(message);
    setShowLoginAlert(true);
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user || !accessToken) {
        setSubmitError('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      try {
        setLoading(prev => ({ ...prev, locations: true, companies: true }));
        
        // Fetch locations - không cần auth
        try {
          const locationsRes = await fetch(`${API_BASE_URL}/locations`);
          if (locationsRes.ok) {
            const response = await locationsRes.json();
            const locationsData = extractDataFromResponse<LocationData>(response);
            const parsedLocations = locationsData.map(parseLocationResponse);
            setAllLocations(parsedLocations);
            console.log('Locations loaded:', parsedLocations.length);
          }
        } catch (error) {
          console.error('Error fetching locations:', error);
        }

        if (userRole === 'COMPANY_ADMIN' && user.companyId) {
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
              console.log('Company loaded:', parsedCompany);
              
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
        } else if (userRole === 'ADMIN') {
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

    if (user && accessToken) {
      fetchInitialData();
    }
  }, [user, accessToken, userRole]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.companyId || formData.companyId === '') {
        setAllVehicles([]);
        return;
      }

      setLoading(prev => ({ ...prev, vehicles: true }));
      
      try {
        const vehiclesUrl = `${API_BASE_URL}/vehicles?companyId=${formData.companyId}`;
        console.log('Fetching vehicles from:', vehiclesUrl);
        
        const res = await fetchWithAuth(vehiclesUrl);
        
        if (res.ok) {
          const response = await res.json();
          console.log('Vehicles API response:', response);
          
          let vehiclesData = [];
          if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
          } else if (Array.isArray(response)) {
            vehiclesData = response;
          }
          
          const parsedVehicles = vehiclesData.map(parseVehicleResponse);
          console.log('Parsed vehicles:', parsedVehicles);
          
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

  // Debug logs
  useEffect(() => {
    console.log('Current formData:', formData);
    console.log('All vehicles:', allVehicles);
    console.log('Selected company vehicles:', allVehicles.filter(v => v.companyId === formData.companyId));
  }, [formData, allVehicles]);

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

    if (formData.price <= 0) {
      throw new Error('Vui lòng nhập giá vé hợp lệ');
    }

    const payload = {
      companyId: formData.companyId,
      vehicleId: formData.vehicleId as string,
      route: {
        fromLocationId: formData.fromLocationId as string,
        toLocationId: formData.toLocationId as string,
        stops: formData.stops
          .filter(stop => stop.locationId && stop.locationId.trim() !== '')
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

    console.log('Creating trip with payload:', JSON.stringify(payload, null, 2));

    const response = await fetchWithAuth(`${API_BASE_URL}/trips`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error ${response.status}`);
    }

    const responseData = await response.json();
    
    // Xử lý response
    let tripData = responseData;
    if (responseData.data) {
      tripData = responseData.data;
    }
    
    console.log('Trip created successfully:', tripData);

    setSubmitSuccess(true);
    
    setTimeout(() => {
      setFormData({
        companyId: userRole === 'COMPANY_ADMIN' && user?.companyId ? user.companyId : '',
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
          <BasicInfoStep
            formData={formData}
            onFormChange={handleFormChange}
            companyVehicles={allVehicles as unknown as Vehicle[]}
            allLocations={allLocations}
            allCompanies={allCompanies}
            loadingVehicles={loading.vehicles}
            loadingLocations={loading.locations}
            loadingCompanies={loading.companies}
            userRole={userRole === 'USER' ? 'COMPANY_ADMIN' : userRole as 'ADMIN' | 'COMPANY_ADMIN'}
            userCompanyId={user?.companyId}
            userCompanyName={user?.name}
          />
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
            vehicleData={vehicleData as unknown as Vehicle}
            fromLocationData={fromLocationData}
            toLocationData={toLocationData}
            stopsData={[]}
          />
        );
      default:
        return null;
    }
  };

  // Kiểm tra user và accessToken
  if (!user || !accessToken) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Vui lòng đăng nhập để sử dụng chức năng này
        </Alert>
        <Button 
          onClick={() => window.location.href = '/login'}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Đi đến trang đăng nhập
        </Button>
      </Container>
    );
  }

  if (!['ADMIN', 'COMPANY_ADMIN'].includes(userRole)) {
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
                  label={userRole === 'ADMIN' ? 'Quản trị hệ thống' : 'Quản trị nhà xe'} 
                  color={userRole === 'ADMIN' ? 'primary' : 'secondary'}
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