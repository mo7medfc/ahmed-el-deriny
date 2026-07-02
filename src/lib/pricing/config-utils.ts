export function getDeepValue(obj: Record<string, unknown>, path: string, fallback: unknown = "") {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const k of parts) {
    if (!cur || typeof cur !== "object") return fallback;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur ?? fallback;
}

export function setDeepValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!(k in cur) || typeof cur[k] !== "object" || cur[k] === null) {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function parseNumberInput(raw: string): number | "" {
  if (raw === "" || raw === null || raw === undefined) return "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : "";
}

export function fieldsToConfig(
  fields: Record<string, string | number | "">
): Record<string, unknown> {
  const cfg: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(fields)) {
    setDeepValue(cfg, path, value);
  }

  if (cfg.profitTiers && typeof cfg.profitTiers === "object" && !Array.isArray(cfg.profitTiers)) {
    cfg.profitTiers = Object.keys(cfg.profitTiers as Record<string, unknown>)
      .map((k) => ({ idx: parseInt(k, 10), v: (cfg.profitTiers as Record<string, unknown>)[k] }))
      .filter((x) => Number.isFinite(x.idx))
      .sort((a, b) => a.idx - b.idx)
      .map((x) => x.v);
  }

  return cfg;
}
