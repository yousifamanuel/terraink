// Checks the translation files against en.json.
//   bun run i18n:check
// Fails when a language is missing text, has leftover keys, or changed a
// {{placeholder}} / <tag>, and when the code uses a t("…") key that en.json lacks.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const LOCALES = "src/core/i18n/locales";
const PLURAL = /_(zero|one|two|few|many|other)$/;
const TOKENS = /\{\{\s*\w+\s*\}\}|<\/?\w+\s*\/?>/g;

const load = (code) => JSON.parse(readFileSync(join(LOCALES, `${code}.json`), "utf8"));

function flatten(obj, prefix = "", out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix + k;
    if (v && typeof v === "object") flatten(v, `${key}.`, out);
    else {
      const base = key.replace(PLURAL, "");
      if (!out.has(base)) out.set(base, []);
      out.get(base).push(String(v));
    }
  }
  return out;
}

const tokens = (s) => new Set(s.match(TOKENS) ?? []);
const en = flatten(load("en"));
const problems = [];

for (const file of readdirSync(LOCALES).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const code = file.replace(/\.json$/, "");
  const tr = flatten(load(code));
  for (const key of en.keys()) if (!tr.has(key)) problems.push(`${code}: missing ${key}`);
  for (const key of tr.keys()) if (!en.has(key)) problems.push(`${code}: unused ${key}`);
  for (const [key, values] of tr) {
    if (!en.has(key)) continue;
    // {{count}} may be dropped in a singular form; everything else must match.
    const need = new Set([...en.get(key).flatMap((v) => [...tokens(v)])].filter((t) => !t.includes("count")));
    const allowed = new Set(en.get(key).flatMap((v) => [...tokens(v)]));
    for (const v of values) {
      const got = tokens(v);
      const bad = [...need].some((t) => !got.has(t)) || [...got].some((t) => !allowed.has(t));
      if (bad) problems.push(`${code}: placeholder/tag mismatch in ${key}`);
    }
  }
}

// Literal keys used in the code must exist in en.json.
function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(ts|tsx)$/.test(name)) files.push(p);
  }
  return files;
}
const KEY_USE = /(?:\bt|i18n\.t)\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]|i18nKey=["']([a-zA-Z0-9_.-]+)["']/g;
for (const file of walk("src")) {
  for (const m of readFileSync(file, "utf8").matchAll(KEY_USE)) {
    const key = m[1] ?? m[2];
    if (key.includes(".") && !en.has(key)) problems.push(`code: ${file} uses ${key}, not in en.json`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`i18n ok: ${en.size} keys, ${readdirSync(LOCALES).length - 1} languages.`);
