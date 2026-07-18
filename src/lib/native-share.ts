export function buildProtectedShareUrl(path: string, origin: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("HomeVault share destinations must be internal paths.");
  }

  const base = new URL(origin);
  const destination = new URL(path, base);

  if (destination.origin !== base.origin) {
    throw new Error("HomeVault share destinations must stay on the current origin.");
  }

  return destination.toString();
}
