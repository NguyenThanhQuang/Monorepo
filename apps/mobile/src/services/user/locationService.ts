import { mockLocations, MockLocation } from "../../data/locations";
import { API_ENDPOINTS } from "../common/configService";
import apiService from "../common/apiService";

export interface Location extends MockLocation {}

const asArray = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

/** ✅ Normalize các biến thể nhập của người dùng -> keyword mà DB dễ match */
const normalizeLocationQuery = (input: string) => {
  const t = (input || "").trim();
  if (!t) return "";

  const lower = t.toLowerCase();

  // HCM variants
  if (
    lower === "tp. hồ chí minh" ||
    lower === "tp hồ chí minh" ||
    lower === "tphcm" ||
    lower === "tp.hcm" ||
    lower === "tp hcm" ||
    lower.includes("thành phố hồ chí minh")
  ) {
    return "Hồ Chí Minh";
  }

  // Hà Nội variants
  if (lower.includes("thành phố hà nội")) return "Hà Nội";

  // strip prefix "TP." nếu có (tp., tp)
  return t.replace(/^tp\.?\s*/i, "").trim();
};

export const getPopularLocations = async (): Promise<Location[]> => {
  try {
    console.log("📍 Fetching popular locations...");
    const response = await apiService.get<any>(API_ENDPOINTS.LOCATIONS.POPULAR);
    const locations = asArray<Location>(response.data);
    console.log("✅ Popular locations fetched:", locations);
    return locations;
  } catch (error: any) {
    console.error("❌ Error fetching popular locations:", error);
    console.log("🔄 Using mock data due to API error");
    return mockLocations.slice(0, 20);
  }
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  try {
    const q = normalizeLocationQuery(query);
    if (!q || q.length < 2) return [];

    console.log("🔍 Searching locations with query:", q);

    const response = await apiService.get<any>(API_ENDPOINTS.LOCATIONS.SEARCH, {
      // gửi cả q + keyword cho chắc (tuỳ backend đọc param nào)
      params: { q, keyword: q },
    });

    const results = asArray<Location>(response.data);

    // ✅ đảm bảo luôn có _id (vì backend bạn đang trả "id" chứ không phải "_id")
    const normalizedResults = results.map((l: any) => ({
      ...l,
      _id: String(l?._id ?? l?.id ?? ""),
    }));

    console.log("✅ Location search results:", normalizedResults);
    return normalizedResults.filter((x: any) => x?._id);
  } catch (error: any) {
    console.error("❌ Error searching locations:", error);
    console.log("🔄 Using mock data due to API error");

    const q = normalizeLocationQuery(query);
    const filtered = mockLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        l.province.toLowerCase().includes(q.toLowerCase()),
    );

    return filtered.slice(0, 10) as any;
  }
};

export const getLocationById = async (id: string): Promise<Location | null> => {
  try {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.LOCATIONS.BASE}/${id}`,
    );
    const payload = response.data?.data ?? response.data;
    return { ...(payload as any), _id: String((payload as any)?._id ?? (payload as any)?.id ?? "") } as any;
  } catch (error: any) {
    console.error("Error fetching location by ID:", error);
    return (mockLocations.find((loc) => (loc as any)._id === id) as any) || null;
  }
};

export const getLocationsByProvince = async (
  province: string,
): Promise<Location[]> => {
  try {
    const p = normalizeLocationQuery(province);

    const response = await apiService.get<any>(API_ENDPOINTS.LOCATIONS.BY_PROVINCE, {
      params: { province: p },
    });

    const arr = asArray<Location>(response.data);
    return arr.map((l: any) => ({ ...l, _id: String(l?._id ?? l?.id ?? "") })) as any;
  } catch (error: any) {
    console.error("Error fetching locations by province:", error);

    const p = normalizeLocationQuery(province);
    return mockLocations
      .filter((l) => l.province.toLowerCase().includes(p.toLowerCase()))
      .slice(0, 10) as any;
  }
};
