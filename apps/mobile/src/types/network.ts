export interface NetworkStatus {
  isConnected: boolean;
  apiReachable?: boolean;
  workingApiUrl?: string;
  baseURL?: string;
  triedURLs?: string[];
}


