export const adminSessionCookieName = "takeat_admin_session";
export const adminSessionMaxAge = 60 * 60 * 8;

export function getAuthSecret() {
  return process.env.SESSION_SECRET || process.env.JWT_SECRET || process.env.AUTH_SECRET || "";
}

export async function createSessionToken(user) {
  const payload = {
    sub: user.email,
    name: user.name || user.email,
    role: user.role || "admin",
    permissions: user.permissions || ["drivers:create"],
    exp: Math.floor(Date.now() / 1000) + adminSessionMaxAge
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!getAuthSecret()) {
    return null;
  }

  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  const expectedSignature = await signValue(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const isExpired = !payload.exp || payload.exp < Math.floor(Date.now() / 1000);

    return isExpired ? null : payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge
  };
}

async function signValue(value) {
  const secret = getAuthSecret();

  if (!secret) {
    return "";
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return arrayBufferToBase64Url(signature);
}

function base64UrlEncode(value) {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(value, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(value)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  return decodeURIComponent(escape(atob(padded)));
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(a = "", b = "") {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}
