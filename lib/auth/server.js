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
  if (!hasAdminCredentialsConfigured()) {
    return {
      ok: false,
      code: "config",
      error: "ADMIN_USERNAME e ADMIN_PASSWORD nao configurados."
    };
  }

  if (!getAuthSecret()) {
    return {
      ok: false,
      code: "config",
      error: "AUTH_SECRET nao configurado."
    };
  }

  const user = findConfiguredUser(username);

  if (!user || !safeCredentialCompare(normalizeCredential(password), user.password)) {
    return {
      code: "invalid",
      ok: false,
      error: "Credenciais invalidas."
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
  const usersJson = getEnvValue("ADMIN_USERS_JSON");

  if (usersJson) {
    try {
      const users = JSON.parse(usersJson);

      if (Array.isArray(users)) {
        const configuredUsers = users
          .filter((user) => user.email && user.password)
          .map((user) => ({
            email: normalizeIdentifier(user.email),
            password: normalizeCredential(user.password),
            name: getText(user.name) || normalizeIdentifier(user.email),
            role: user.role || "admin",
            permissions: user.permissions || ["drivers:create"]
          }));

        if (configuredUsers.length) {
          return configuredUsers;
        }
      }
    } catch {
      // Fall back to the single-user variables below.
    }
  }

  const adminEmail = getFirstEnvValue(["ADMIN_USERNAME", "ADMIN_USER", "ADMIN_EMAIL"]);
  const adminPassword = getEnvValue("ADMIN_PASSWORD");

  if (!adminEmail || !adminPassword) {
    return [];
  }

  return [
    {
      email: adminEmail,
      password: adminPassword,
      name: getEnvValue("ADMIN_NAME") || "Administrador TAKEAT",
      role: "admin",
      permissions: ["drivers:create"]
    }
  ];
}

function findConfiguredUser(username = "") {
  const normalizedUsername = normalizeIdentifier(username);

  return getConfiguredUsers().find((user) => normalizeIdentifier(user.email) === normalizedUsername);
}

function safeCredentialCompare(received = "", expected = "") {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

function hasAdminCredentialsConfigured() {
  return getConfiguredUsers().length > 0;
}

function getFirstEnvValue(keys) {
  for (const key of keys) {
    const value = getEnvValue(key);

    if (value) {
      return value;
    }
  }

  return "";
}

function getEnvValue(key) {
  return normalizeCredential(process.env[key]);
}

function getText(value = "") {
  return String(value || "").trim();
}

function normalizeIdentifier(value = "") {
  return getText(value).toLowerCase();
}

function normalizeCredential(value = "") {
  return String(value || "").trim();
}
