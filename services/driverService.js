import { drivers } from "@/data/drivers";
import { getPublicFileStatus } from "@/services/fileService";
import { guideParamsFromUrl } from "@/utils/routes";
import { sortDrivers, uniqueSorted } from "@/utils/search";

export function getDrivers() {
  return drivers.map(withDriverAvailability).sort(sortDrivers);
}

export function getFeaturedDrivers() {
  return getDrivers().filter((driver) => driver.destaque);
}

export function getDriverBrands() {
  return uniqueSorted(drivers.map((driver) => driver.marca));
}

export function getDriverCategories() {
  return uniqueSorted(drivers.map((driver) => driver.categoria));
}

export function getDriversByBrand() {
  return getDrivers().reduce((groups, driver) => {
    const brand = driver.marca;
    groups[brand] = groups[brand] || [];
    groups[brand].push(driver);
    return groups;
  }, {});
}

export function getGuideDrivers() {
  return getDrivers().filter((driver) => driver.guiaInstalacao?.url);
}

export function getDriverByGuideParams(marca, modelo) {
  const targetUrl = `/guias/${marca}/${modelo}`;

  return getDrivers().find((driver) => driver.guiaInstalacao?.url === targetUrl);
}

export function getGuideStaticParams() {
  return drivers
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
    arquivo,
    driver: {
      ...driver.driver,
      versoes
    }
  };
}
