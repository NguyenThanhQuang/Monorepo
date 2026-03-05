import axios from 'axios';
import { NetworkStatus } from '../../types/network';

class NetworkService {
  // ✅ Backend hiện tại: PORT=3001 + /api/v1
  private apiUrls = [
    'http://10.0.2.2:3001/api/v1',        // Android emulator
    'http://localhost:3001/api/v1',       // iOS simulator (thường ok)
    'http://127.0.0.1:3001/api/v1',       // Alternative localhost
    'http://192.168.1.9:3001/api/v1',  // Physical device: đổi IP đúng máy bạn
  ];

  async checkApiConnectivity(): Promise<NetworkStatus> {
    console.log('🔍 Checking API connectivity...');

    for (const url of this.apiUrls) {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        if (response.status === 200) {
          console.log(`✅ API connectivity successful: ${url}`);
          return {
            isConnected: true,
            apiReachable: true,
            workingApiUrl: url,
          };
        }
      } catch (error: any) {
        console.log(`❌ ${url} failed: ${error?.message || error}`);
        continue;
      }
    }

    console.log('⚠️ No working API URL found - app will work in offline mode');
    return {
      isConnected: false,
      apiReachable: false,
    };
  }

  async testSpecificUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const networkService = new NetworkService();
export default networkService;
