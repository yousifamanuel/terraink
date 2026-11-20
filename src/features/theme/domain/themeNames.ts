/**
 * The first free name for a copy of `baseName`: the name itself, else
 * "<name> 2", "<name> 3" … (a copy "Miami Night 2" counts on to "Miami Night 3").
 * Names compare ignoring case and outer spaces.
 */
export function nextFreeName(baseName: string, takenNames: string[]): string {
  const given = baseName.trim();
  const taken = new Set(takenNames.map((name) => name.trim().toLowerCase()));
  if (!taken.has(given.toLowerCase())) return given;
  // "Miami Night 2" is a copy of "Miami Night" only if that name exists too.
  const stripped = given.replace(/\s+\d+$/, "");
  const base = stripped && taken.has(stripped.toLowerCase()) ? stripped : given;
  for (let number = 2; ; number += 1) {
    const candidate = `${base} ${number}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}
