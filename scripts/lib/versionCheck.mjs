/**
 * package.json and manifest.json each carry their own `version` field —
 * this guards against them drifting apart silently (e.g. someone bumps one
 * and forgets the other), which would make the zip's filename lie about
 * what's actually inside it.
 */
export function assertVersionsMatch(packageVersion, manifestVersion) {
  if (packageVersion !== manifestVersion) {
    throw new Error(
      `Version mismatch: package.json is "${packageVersion}" but manifest.json is "${manifestVersion}" — keep them in sync before building a release zip.`,
    );
  }
  return packageVersion;
}
