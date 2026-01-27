import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export async function hashPassword(
  plainText: string,
  rounds: number = 10,
): Promise<string> {
  return bcrypt.hash(plainText, rounds);
}

export async function comparePassword(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export const PASSWORD_STRONG_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const VN_PHONE_REGEX = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
