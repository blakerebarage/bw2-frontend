import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
// import crypto from "crypto"
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// export function aes256Encrypt(aesKey, plaintext) {
//   const key = Buffer.from(aesKey, "utf8");
//   const cipher = crypto.createCipheriv("aes-256-ecb", key, null);
//   cipher.setAutoPadding(true);
//   let encrypted = cipher.update(plaintext, "utf8", "base64");
//   encrypted += cipher.final("base64");
//   return encrypted;
// }
