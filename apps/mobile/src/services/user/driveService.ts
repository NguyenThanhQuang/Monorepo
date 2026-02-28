// mobile-app/src/services/user/driveService.ts
import apiService from '../common/apiService';
import { API_ENDPOINTS } from '../common/configService';

// Use DRIVE from API_ENDPOINTS but provide a sensible fallback to avoid TS errors
const DRIVE = (API_ENDPOINTS as any).USER?.DRIVE ?? {
  LIST: '/users/drive',
  UPLOAD: '/users/drive/upload',
  DELETE: '/users/drive/:id',
  DOWNLOAD: '/users/drive/:id/download',
};

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  url?: string;
  uploadedAt?: string;
}

class DriveService {
  async listFiles(): Promise<DriveFile[]> {
    if (!DRIVE?.LIST) return [];
    const res = await apiService.get<{ files: DriveFile[] }>(DRIVE.LIST);
    // backend có thể trả { files: [...] } hoặc [] -> cố gắng tương thích
    return (res?.data && (res.data as any).files) || (res?.data as any) || [];
  }

  /**
   * Upload a file from a local uri (expo DocumentPicker result)
   * @param uri local file uri
   * @param name filename
   * @param mimeType content type (optional)
   */
  async uploadFile(uri: string, name: string, mimeType?: string) {
    if (!DRIVE?.UPLOAD) throw new Error('Drive upload endpoint not configured');

    const formData = new FormData();
    // For React Native + axios, append object { uri, name, type }
    formData.append(
      'file',
      {
        uri,
        name,
        type: mimeType || 'application/octet-stream',
      } as any
    );

    // NOTE:
    // - In some Expo/axios setups it's better to NOT set Content-Type manually
    //   so that boundary is set automatically. If upload fails, remove the header below.
    const res = await apiService.post(DRIVE.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async deleteFile(fileId: string) {
    if (!DRIVE?.DELETE) throw new Error('Drive delete endpoint not configured');
    const endpoint = (DRIVE.DELETE as string).replace(':id', fileId);
    return apiService.delete(endpoint);
  }

  async downloadFileUrl(fileId: string) {
    if (!DRIVE?.DOWNLOAD) throw new Error('Drive download endpoint not configured');
    const endpoint = (DRIVE.DOWNLOAD as string).replace(':id', fileId);
    const res = await apiService.get(endpoint);
    return res.data;
  }
}

export const driveService = new DriveService();
export type { DriveFile };
