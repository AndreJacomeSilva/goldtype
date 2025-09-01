import { randomBytes, createHash } from "crypto";

export function genNumericCode(len = 6) {
  // Gera um código numérico (0-9) de len dígitos
  const buf = randomBytes(len);
  return Array.from(buf, b => (b % 10).toString()).join("");
}

export function genToken(bytes = 32) {
  return randomBytes(bytes).toString("hex"); // 64 chars
}

export function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}
