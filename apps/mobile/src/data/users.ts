export interface MockUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'driver';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockUsers: MockUser[] = [
  {
    _id: 'user1',
    email: 'user@example.com',
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    role: 'user',
    avatar: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'driver1',
    email: 'driver@example.com',
    name: 'Tài xế B',
    phone: '0987654321',
    role: 'driver',
    avatar: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
