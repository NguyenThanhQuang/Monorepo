import { generateMockTrips } from '../../data/trips';
import { API_ENDPOINTS } from '../common/configService';
import apiService from '../common/apiService';
import { Trip, SearchTripsParams, SearchTripsResponse, CreateTripPayload } from '../../types/trip';

const unwrap = (resData: any) => resData?.data ?? resData;
 

export const searchTrips = async (params: SearchTripsParams): Promise<Trip[]> => {
  try {
    console.log('🔍 Searching trips with params:', params);
    
    const response = await apiService.get<SearchTripsResponse>(API_ENDPOINTS.TRIPS.SEARCH, {
      params: {
        from: params.from,
        to: params.to,
        date: params.date,
        passengers: params.passengers
      },
    });
    
    const payload = unwrap(response.data) ?? {};
    // trips search backend thường trả { success, data: Trip[], count }
    const trips = Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : Array.isArray((payload as any)?.trips)
        ? (payload as any).trips
        : Array.isArray(payload)
          ? payload
          : [];

    console.log('✅ Search trips parsed trips:', trips?.length || 0);
    return trips as Trip[];
  } catch (error: any) {
    console.error('❌ Error searching trips:', error);
    
    // Return mock data as fallback
    console.log('🔄 Using mock data due to API error');
    return generateMockTrips(params.from, params.to, params.date);
  }
};

export const getTripById = async (id: string): Promise<Trip> => {
  try {
    const response = await apiService.get<Trip>(`${API_ENDPOINTS.TRIPS.BASE}/${id}`);
    const payload = unwrap(response.data);
    return ((payload as any)?.data ?? payload) as Trip;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

export const getPopularTrips = async (): Promise<Trip[]> => {
  try {
    const response = await apiService.get<Trip[]>(API_ENDPOINTS.TRIPS.POPULAR);
    return (unwrap(response.data) as any) as Trip[];
  } catch (error) {
    console.error('Error fetching popular trips:', error);
    return [];
  }
};

export const getTripsByCompany = async (companyId: string): Promise<Trip[]> => {
  try {
    const response = await apiService.get<Trip[]>(API_ENDPOINTS.TRIPS.BY_COMPANY.replace(':companyId', companyId));
    return (unwrap(response.data) as any) as Trip[];
  } catch (error) {
    console.error('Error fetching company trips:', error);
    throw error;
  }
};


export const createTrip = async (payload: CreateTripPayload): Promise<Trip> => {
  try {
    const response = await apiService.post<Trip>(API_ENDPOINTS.TRIPS.BASE, payload);
    const data = unwrap(response.data);
    return ((data as any)?.data ?? data) as Trip;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};
