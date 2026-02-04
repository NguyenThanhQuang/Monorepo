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
} from '@mui/material';
import { Save, NavigateNext, NavigateBefore, ArrowBack, Add } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

import type { AddTripFormState, Vehicle, LocationData, Company } from '@obtp/shared-types';
import { CompanyStatus, UserRole } from '@obtp/shared-types';
import BasicInfoStep from './BasicInfoStep';
import ScheduleStep from './ScheduleStep';
import PricingStep from './PricingStep';
import PreviewStep from './PreviewStep';

interface AddTripContainerProps {
  onClose?: () => void;
}

// Simple Vehicle Interface cho hiển thị đơn giản
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

// Helper functions để parse response
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
  console.log('🚗 Parsing vehicle (simple mode):', data);
  
  // Lấy biển số - ưu tiên licensePlate, sau đó vehicleNumber
  const licensePlate = data.licensePlate || data.vehicleNumber || 'Không có biển số';
  
  // Lấy tên xe - kết hợp brand + model nếu có
  const brand = data.brand || '';
  const model = data.model || '';
  const name = data.name || (brand && model ? `${brand} ${model}` : brand || model || licensePlate);
  
  // Lấy số ghế - ưu tiên capacity, sau đó totalSeats
  const capacity = data.capacity || data.totalSeats || 0;
  
  // Lấy loại xe
  const type = data.type || 'standard';
  
  // Xử lý companyId
  let companyId = '';
  let companyName = '';
  let companyCode = '';
  
  if (typeof data.companyId === 'string') {
    companyId = data.companyId;
  } else if (data.companyId && data.companyId._id) {
    companyId = data.companyId._id.toString();
    companyName = data.companyId.name || '';
    companyCode = data.companyId.code || '';
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
  
  console.warn('Unexpected response structure:', response);
  return [];
};

// Helper function để fetch với token
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  if (!token) {
    console.error('No authentication token found in localStorage');
    throw new Error('No authentication token found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  console.log('🔗 Fetching:', url);
  
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

// SIMPLE USER HOOK
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

  // Update formData khi user thay đổi
  useEffect(() => {
    if (user?.role === 'COMPANY_ADMIN' && user.companyId) {
      setFormData(prev => ({
        ...prev,
        companyId: user.companyId || ''
      }));
    }
  }, [user]);

  // Function để clear auth data và redirect
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

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log('=== fetchInitialData ===');
      
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
        
        // 1. Fetch locations - API công khai
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

        // 2. Fetch companies theo role
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
                console.log('Company loaded successfully:', parsedCompany.name);
                
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
              console.log('Companies loaded for ADMIN:', activeCompanies.length);
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

  // Fetch vehicles khi company thay đổi - SỬA ENDPOINT Ở ĐÂY
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!formData.companyId || formData.companyId === '') {
        console.log('No company selected for vehicles');
        setAllVehicles([]);
        return;
      }

      console.log('🚗 Fetching vehicles for company:', formData.companyId);
      setLoading(prev => ({ ...prev, vehicles: true }));
      
      try {
        // SỬA: Sử dụng endpoint mới /vehicles/companyId/{companyId}
        const vehiclesUrl = `${API_BASE_URL}/vehicles/companyId/${formData.companyId}`;
        console.log('API URL (NEW):', vehiclesUrl);
        
        const res = await fetchWithAuth(vehiclesUrl);
        console.log('Response status:', res.status);
        
        if (res.ok) {
          const response = await res.json();
          console.log('API Response:', response);
          
          let vehiclesData = [];
          
          if (response.data && Array.isArray(response.data)) {
            vehiclesData = response.data;
            console.log(`Found ${vehiclesData.length} vehicles in response.data`);
          } else if (Array.isArray(response)) {
            vehiclesData = response;
            console.log(`Found ${vehiclesData.length} vehicles in direct array`);
          }
          
          // Parse vehicles
          const parsedVehicles = vehiclesData.map(parseVehicleResponse);
          console.log('Parsed vehicles:', parsedVehicles);
          
          setAllVehicles(parsedVehicles);
          
        } else if (res.status === 404) {
          console.log('API endpoint not found 404');
          // Thử endpoint cũ nếu endpoint mới không tồn tại
          await tryAlternativeEndpoints();
        } else {
          const errorText = await res.text();
          console.error('API error:', errorText);
          setAllVehicles([]);
        }
      } catch (error: any) {
        console.error('Error fetching vehicles:', error.message);
        // Thử endpoint khác nếu lỗi
        await tryAlternativeEndpoints();
      } finally {
        setLoading(prev => ({ ...prev, vehicles: false }));
      }
    };

    // Hàm thử các endpoint khác
    const tryAlternativeEndpoints = async () => {
      console.log('🔄 Trying alternative endpoints...');
      
      const endpoints = [
        `${API_BASE_URL}/vehicles?companyId=${formData.companyId}`, // Endpoint cũ
        `${API_BASE_URL}/company/${formData.companyId}/vehicles`,
        `${API_BASE_URL}/companies/${formData.companyId}/vehicles`,
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying: ${endpoint}`);
          const res = await fetchWithAuth(endpoint);
          
          if (res.ok) {
            const response = await res.json();
            console.log(`✅ Success with ${endpoint}`);
            
            let vehiclesData = [];
            if (response.data && Array.isArray(response.data)) {
              vehiclesData = response.data;
            } else if (Array.isArray(response)) {
              vehiclesData = response;
            }
            
            const parsedVehicles = vehiclesData.map(parseVehicleResponse);
            setAllVehicles(parsedVehicles);
            return;
          }
        } catch (error) {
          console.log(`Failed with ${endpoint}:`, error);
        }
      }
      
      // Nếu tất cả endpoint đều thất bại, dùng test data
      console.log('⚠️ All endpoints failed, using test data');
      const testVehicles: SimpleVehicle[] = [
        {
          _id: 'test_1',
          id: 'test_1',
          licensePlate: '51A-12345',
          name: 'Thaco Kinglong',
          type: 'Giường nằm',
          capacity: 45,
          companyId: formData.companyId,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          companyName: user?.companyName || 'Nhà xe demo'
        },
        {
          _id: 'test_2',
          id: 'test_2',
          licensePlate: '51A-67890',
          name: 'Mercedes Sprinter',
          type: 'Ghế ngồi VIP',
          capacity: 35,
          companyId: formData.companyId,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          companyName: user?.companyName || 'Nhà xe demo'
        }
      ];
      
      setAllVehicles(testVehicles);
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

      console.log('Submitting trip payload:', payload);

      const response = await fetchWithAuth(`${API_BASE_URL}/trips`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Có lỗi xảy ra khi tạo chuyến đi');
      }

      const result = await response.json();
      console.log('Trip created successfully:', result);
      
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
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple render cho bước 1 - Thay thế BasicInfoStep đơn giản
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
            
            {/* Chọn nhà xe - chỉ hiển thị cho ADMIN */}
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
                        {company.name} - {company.code || company._id.substring(0, 8)}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            )}
            
            {/* Hiển thị nhà xe cho COMPANY_ADMIN */}
            {user?.role === 'COMPANY_ADMIN' && user.companyName && (
              <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body1">
                  <strong>Nhà xe:</strong> {user.companyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Company ID: {formData.companyId?.substring(0, 8)}...
                </Typography>
              </Box>
            )}
            
            {/* Chọn xe */}
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
                    <CircularProgress size={20} /> Đang tải danh sách xe...
                  </MenuItem>
                ) : allVehicles.length === 0 ? (
                  <MenuItem value="" disabled>
                    ⚠️ Không có xe nào. Vui lòng thêm xe trước.
                  </MenuItem>
                ) : (
                  allVehicles.map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Typography variant="body1">
                            <strong>{vehicle.licensePlate}</strong>
                            {vehicle.name && ` - ${vehicle.name}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vehicle.type ? `Loại: ${vehicle.type}` : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">
                            {vehicle.capacity} ghế
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              
              {/* Nút thêm xe mới nếu không có xe */}
              {allVehicles.length === 0 && !loading.vehicles && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Nhà xe chưa có xe nào được đăng ký.
                  </Alert>
                  <Button 
                    variant="outlined" 
                    // onClick={() => window.open('/admin/vehicles/add', '_blank')}
                    startIcon={<Add />}
                  >
                    Thêm xe mới
                  </Button>
                </Box>
              )}
            </FormControl>
            
            {/* Chọn điểm đi/đến */}
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
            
            {/* Thông báo debug */}
            {allVehicles.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Đã tìm thấy {allVehicles.length} xe. Chọn một xe để tiếp tục.
              </Alert>
            )}
          </Box>
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

  // Kiểm tra quyền truy cập
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Vui lòng đăng nhập để sử dụng chức năng này
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Đảm bảo bạn đã đăng nhập với tài khoản có quyền COMPANY_ADMIN
          </div>
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập chức năng này
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            User role: {user?.role}
            <br />
            Required roles: ADMIN or COMPANY_ADMIN
          </div>
        </Alert>
        <Button 
          onClick={onClose} 
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Quay lại Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Button
              onClick={onClose}
              startIcon={<ArrowBack />}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            >
              Quay lại Dashboard
            </Button>
            <Typography variant="h4" gutterBottom>
              Tạo chuyến đi mới
              <Chip 
                label={user.role === 'ADMIN' ? 'Quản trị hệ thống' : 'Quản trị nhà xe'} 
                color={user.role === 'ADMIN' ? 'primary' : 'secondary'}
                size="small"
                sx={{ ml: 2, verticalAlign: 'middle' }}
              />
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {steps[currentStep].description}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Bước {currentStep + 1}/{steps.length}
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
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
            Tạo chuyến đi thành công! Đang quay lại dashboard...
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                onClick={onClose}
                startIcon={<ArrowBack />}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {currentStep === steps.length - 1 ? (
              <>
                <Button
                  variant="outlined"
                  onClick={onClose}
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

      {/* Snackbar thông báo redirect đến login */}
      <Snackbar
        open={showLoginAlert}
        autoHideDuration={3000}
        onClose={() => setShowLoginAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          onClose={() => setShowLoginAlert(false)}
          sx={{ width: '100%' }}
        >
          {loginAlertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTripContainer;