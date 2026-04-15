import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "sislibro_admin_session";

const DEFAULT_ADMIN_EMAIL = "admin@sislibro.edu";
const DEFAULT_ADMIN_PASSWORD = "SisLibroAdmin#2026";
const DEFAULT_ADMIN_SECURITY_CODE = "SL-SEC-7291";
const DEFAULT_SESSION_SECRET = "SISLIBRO_PRIVATE_SESSION_SECRET_2026";
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

function getAdminEmail(): string {
  return (process.env.SISLIBRO_ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim();
}

function getAdminPassword(): string {
  return process.env.SISLIBRO_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

function getAdminSecurityCode(): string {
  return process.env.SISLIBRO_ADMIN_SECURITY_CODE ?? DEFAULT_ADMIN_SECURITY_CODE;
}

function getSessionSecret(): string {
  const secret = process.env.SISLIBRO_SESSION_SECRET ?? DEFAULT_SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && secret === DEFAULT_SESSION_SECRET) {
    throw new Error(
      "Config faltante: SISLIBRO_SESSION_SECRET debe configurarse en producción.",
    );
  }
  return secret;
}

function sign(content: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(content)
    .digest("base64url");
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
  if (process.env.NODE_ENV === "production") {
    const emailEnv = process.env.SISLIBRO_ADMIN_EMAIL;
    const passEnv = process.env.SISLIBRO_ADMIN_PASSWORD;
    const codeEnv = process.env.SISLIBRO_ADMIN_SECURITY_CODE;
    if (!emailEnv || !passEnv || !codeEnv) {
      return false;
    }
  }

  return (
    safeEqual(email.trim().toLowerCase(), getAdminEmail().toLowerCase()) &&
    safeEqual(password, getAdminPassword()) &&
    safeEqual(securityCode, getAdminSecurityCode())
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
