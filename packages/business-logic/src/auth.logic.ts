import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { SALT_ROUNDS } from "./constants.logic";

/**
 * Sinh chuỗi random hex an toàn (dùng cho verify token)
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash mật khẩu
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * So sánh mật khẩu
 */
export async function comparePassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Logic xác định login identifier là Email hay Phone
 * Trả về type: 'email' | 'phone'
 */
export function detectIdentifierType(identifier: string): "email" | "phone" {
  // Regex kiểm tra email đơn giản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier) ? "email" : "phone";
}
