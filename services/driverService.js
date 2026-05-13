import { getDriversData } from "@/services/dataRepository";
import { getPublicFileStatus } from "@/services/fileService";
import { guideParamsFromUrl } from "@/utils/routes";
import { sortDrivers, uniqueSorted } from "@/utils/search";

const thermalPrinterCategory = "Impressora termica";

export async function getDrivers() {
  return (await getDriversData()).map(withDriverAvailability).sort(sortDrivers);
}

export async function getFeaturedDrivers() {
  return (await getDrivers()).filter((driver) => driver.destaque);
}

export async function getDriverBrands() {
  return uniqueSorted((await getDriversData()).map((driver) => driver.marca));
}

export async function getDriverCategories() {
  return uniqueSorted((await getDrivers()).map((driver) => driver.categoria));
}

export async function getDriversByBrand() {
  return (await getDrivers()).reduce((groups, driver) => {
    const brand = driver.marca;
    groups[brand] = groups[brand] || [];
    groups[brand].push(driver);
    return groups;
  }, {});
}

export async function getGuideDrivers() {
  return (await getDrivers()).filter((driver) => driver.guiaInstalacao?.url);
}

export async function getDriverByGuideParams(marca, modelo) {
  const targetUrl = `/guias/${marca}/${modelo}`;

  return (await getDrivers()).find((driver) => driver.guiaInstalacao?.url === targetUrl);
}

export async function getGuideStaticParams() {
  return (await getDriversData())
    .map((driver) => guideParamsFromUrl(driver.guiaInstalacao?.url))
    .filter(Boolean);
}

function withDriverAvailability(driver) {
  const arquivo = getPublicFileStatus(driver.driver?.downloadUrl);
  const versoes = (driver.driver?.versoes || []).map((version) => ({
    ...version,
    arquivo: getPublicFileStatus(version.downloadUrl)
  }));

  return {
    ...driver,
    categoria: thermalPrinterCategory,
    arquivo,
    driver: {
      ...driver.driver,
      versoes
    }
  };
}
