export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function compactText(value = "") {
  return normalizeText(value).replace(/\s+/g, "");
}

export function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

const genericSearchTokens = new Set([
  "app",
  "aplicativo",
  "aplicativos",
  "baixar",
  "download",
  "driver",
  "drivers",
  "impressora",
  "impressoras",
  "instalacao",
  "instalar",
  "utilitario",
  "utilitarios"
]);

export function getDriverSearchFields(driver) {
  return [
    driver.marca,
    driver.modelo,
    driver.descricao,
    driver.driver?.nome,
    driver.driver?.versao,
    ...(driver.keywords || [])
  ].filter(Boolean);
}

export function buildDriverSearchText(driver) {
  const fields = getDriverSearchFields(driver);
  const normalized = fields.map(normalizeText).join(" ");
  const compacted = fields.map(compactText).join(" ");

  return `${normalized} ${compacted}`;
}

export function scoreDriver(driver, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return 1;
  }

  const tokens = tokenize(query);
  const searchable = buildDriverSearchText(driver);
  const brand = normalizeText(driver.marca);
  const model = normalizeText(driver.modelo);
  const description = normalizeText(driver.descricao);
  const driverName = normalizeText(driver.driver?.nome);
  const keywords = (driver.keywords || []).map(normalizeText);
  const compactQuery = compactText(query);

  let score = 0;

  if (searchable.includes(normalizedQuery)) score += 20;
  if (compactQuery && searchable.includes(compactQuery)) score += 18;
  if (brand.includes(normalizedQuery)) score += 18;
  if (model.includes(normalizedQuery)) score += 18;
  if (driverName.includes(normalizedQuery)) score += 12;
  if (description.includes(normalizedQuery)) score += 8;

  tokens.forEach((token) => {
    if (brand.includes(token)) score += 8;
    if (model.includes(token)) score += 8;
    if (driverName.includes(token)) score += 6;
    if (description.includes(token)) score += 4;
    if (keywords.some((keyword) => keyword === token)) score += 7;
    if (keywords.some((keyword) => keyword.includes(token))) score += 5;
    if (searchable.includes(token)) score += 2;
  });

  const allTokensMatched = tokens.length > 0 && tokens.every((token) => searchable.includes(token));
  if (allTokensMatched) score += 15;

  return score;
}

export function searchDriversInMemory(drivers, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [...drivers].sort(sortDrivers);
  }

  return drivers
    .map((driver) => ({
      driver,
      score: scoreDriver(driver, query),
      searchable: buildDriverSearchText(driver)
    }))
    .filter((item) => {
      if (item.score <= 0) return false;

      const specificTokens = tokenize(query).filter((token) => !genericSearchTokens.has(token));

      if (specificTokens.length === 0) {
        return true;
      }

      return specificTokens.every((token) => item.searchable.includes(token));
    })
    .sort((a, b) => b.score - a.score || sortDrivers(a.driver, b.driver))
    .map((item) => item.driver);
}

export function sortDrivers(a, b) {
  return `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`, "pt-BR");
}

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
