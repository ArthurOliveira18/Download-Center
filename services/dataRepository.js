import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { isSupabaseAdminConfigured } from "@/services/supabase/config";
import { getSupabaseDrivers } from "@/services/supabase/driversSupabaseService";
import { getSupabaseGuides } from "@/services/supabase/guidesSupabaseService";
import { getSupabaseInternalApps } from "@/services/supabase/internalAppsSupabaseService";

const jsonDataDir = path.join(process.cwd(), "data", "json");
const downloadsFilePath = path.join(jsonDataDir, "downloads.json");
const guidesFilePath = path.join(jsonDataDir, "guides.json");
const tutorialsFilePath = path.join(jsonDataDir, "tutorials.json");

const defaultDownloads = {
  drivers: [],
  apps: []
};

export async function getDownloadsData() {
  if (isSupabaseAdminConfigured()) {
    return {
      drivers: await getSupabaseDrivers(),
      apps: await getSupabaseInternalApps()
    };
  }

  const downloads = readJsonFile(downloadsFilePath, defaultDownloads);

  return {
    drivers: Array.isArray(downloads.drivers) ? downloads.drivers : [],
    apps: Array.isArray(downloads.apps) ? downloads.apps : []
  };
}

export async function getDriversData() {
  return (await getDownloadsData()).drivers;
}

export async function getAppsData() {
  return (await getDownloadsData()).apps;
}

export async function getGuidesData() {
  if (isSupabaseAdminConfigured()) {
    return getSupabaseGuides("guide");
  }

  const guides = readJsonFile(guidesFilePath, []);
  return Array.isArray(guides) ? guides : [];
}

export async function getTutorialsData() {
  if (isSupabaseAdminConfigured()) {
    return getSupabaseGuides("tutorial");
  }

  const tutorials = readJsonFile(tutorialsFilePath, []);
  return Array.isArray(tutorials) ? tutorials : [];
}

export async function writeDownloadsData(downloads) {
  const safeDownloads = {
    drivers: Array.isArray(downloads.drivers) ? downloads.drivers : [],
    apps: Array.isArray(downloads.apps) ? downloads.apps : []
  };

  await writeJsonFile(downloadsFilePath, safeDownloads);
}

export async function writeDriversData(drivers) {
  const downloads = await getDownloadsData();
  await writeDownloadsData({ ...downloads, drivers });
}

export async function writeAppsData(apps) {
  const downloads = await getDownloadsData();
  await writeDownloadsData({ ...downloads, apps });
}

export async function writeGuidesData(guides) {
  await writeJsonFile(guidesFilePath, Array.isArray(guides) ? guides : []);
}

export async function writeTutorialsData(tutorials) {
  await writeJsonFile(tutorialsFilePath, Array.isArray(tutorials) ? tutorials : []);
}

function readJsonFile(filePath, fallback) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  const tempFilePath = `${filePath}.${process.pid}.tmp`;
  const contents = `${JSON.stringify(data, null, 2)}\n`;

  await fsPromises.writeFile(tempFilePath, contents, "utf8");
  await fsPromises.rename(tempFilePath, filePath);
}
