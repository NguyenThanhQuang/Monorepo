import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

// Helper: Generate Random Hex Token
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

// Helper: Hashing Password
// Rounds = 10 (Chuẩn chung)
export async function hashPassword(
  plainText: string,
  rounds: number = 10,
): Promise<string> {
  return bcrypt.hash(plainText, rounds);
}

// Helper: Compare Password
export async function comparePassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// Constants Validation Logic (Regex)
// Trích xuất Regex từ ResetPasswordDto cũ
export const PASSWORD_STRONG_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
