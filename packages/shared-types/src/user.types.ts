// [LOGIC] Placeholder cho User cho đến khi Module User được Refactor
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string; // [CONTRACT] Luôn là string, convert từ _id
  email: string;
  password?: string; // Optional vì không trả về client
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
}
