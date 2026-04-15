import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "sislibro_admin_session";

const ADMIN_EMAIL = "admin@sislibro.edu";
const ADMIN_PASSWORD = "SisLibroAdmin#2026";
const ADMIN_SECURITY_CODE = "SL-SEC-7291";
const SESSION_SECRET = "SISLIBRO_PRIVATE_SESSION_SECRET_2026";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  email: string;
  exp: number;
};

function toBase64Url(text: string): string {
  return Buffer.from(text, "utf8").toString("base64url");
}

function fromBase64Url(text: string): string {
  return Buffer.from(text, "base64url").toString("utf8");
}

function sign(content: string): string {
  return createHmac("sha256", SESSION_SECRET).update(content).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

export function validateAdminCredentials(
  email: string,
  password: string,
  securityCode: string,
): boolean {
  return (
    safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase()) &&
    safeEqual(password, ADMIN_PASSWORD) &&
    safeEqual(securityCode, ADMIN_SECURITY_CODE)
  );
}

export function createSessionToken(email: string): string {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = sign(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
