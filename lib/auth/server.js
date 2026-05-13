import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  createSessionToken,
  getAuthSecret,
  getSessionCookieOptions,
  verifySessionToken
} from "@/lib/auth/session";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;

  return verifySessionToken(token);
}

export async function signInAdmin({ username, password }) {
  const user = findConfiguredUser(username);

  if (!user || !safeCredentialCompare(password, user.password)) {
    return {
      ok: false,
      error: "Credenciais invalidas."
    };
  }

  if (!getAuthSecret()) {
    return {
      ok: false,
      error: "SESSION_SECRET ou JWT_SECRET nao configurado."
    };
  }

  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, token, getSessionCookieOptions());

  return { ok: true };
}

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}

export function getConfiguredUsers() {
  if (process.env.ADMIN_USERS_JSON) {
    try {
      const users = JSON.parse(process.env.ADMIN_USERS_JSON);

      if (Array.isArray(users)) {
        return users
          .filter((user) => user.email && user.password)
          .map((user) => ({
            email: user.email,
            password: user.password,
            name: user.name || user.email,
            role: user.role || "admin",
            permissions: user.permissions || ["drivers:create"]
          }));
      }
    } catch {
      return [];
    }
  }

  const adminEmail = process.env.ADMIN_USER || process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return [];
  }

  return [
    {
      email: adminEmail,
      password: adminPassword,
      name: process.env.ADMIN_NAME || "Administrador TAKEAT",
      role: "admin",
      permissions: ["drivers:create"]
    }
  ];
}

function findConfiguredUser(username = "") {
  const normalizedUsername = username.trim().toLowerCase();

  return getConfiguredUsers().find((user) => user.email.toLowerCase() === normalizedUsername);
}

function safeCredentialCompare(received = "", expected = "") {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}
