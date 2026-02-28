export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles?: ('user' | 'driver')[];
  role?: 'user' | 'driver';
  isEmailVerified?: boolean;
  accountStatus?: 'active' | 'temporary_ban' | 'permanent_ban';
  bannedUntil?: string | null;
  banReason?: string | null;
  createdAt: string;
  updatedAt: string;
}


