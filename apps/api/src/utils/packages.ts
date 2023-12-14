import { Packument, PackumentResult, packument } from "pacote";
import { lt } from "semver";

type DependencyField = { [key: string]: string };

type PackageJson = {
  [key in (typeof dependencyFields)[number]]?: DependencyField;
};

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  // "packageManager", // this requires some special handling
  "pnpm.overrides",
  "resolutions",
  "overrides",
] as const;

export function extractPackages(packageJson: PackageJson) {
  return dependencyFields.flatMap((key) => {
    const packages = packageJson[key];

    if (packages) {
      return packagesToArray(packages, key);
    }

    return [];
  });
}

export function getPackagesToUpgrade(
  packages: Awaited<ReturnType<typeof loadPackages>>,
) {
  return packages.filter(({ versions }) =>
    lt(versions.current, versions.latest),
  );
}

export function getRepositoryUrl(pkg: Packument & PackumentResult) {
  if (!pkg.repository?.url) {
    return;
  }

  // strip the suffix
  const url = pkg.repository.url.replace(".git", "");

  // e.g. git+https://github.com/typicode/husky.git
  const isHttpsUrl = pkg.repository.url.startsWith("git+https://");

  if (isHttpsUrl) {
    return url.replace("git+", "");
  }

  // e.g. git+ssh://git@github.com/keithamus/sort-package-json.git
  const isSshUrl = pkg.repository.url.startsWith("git+ssh://");

  if (isSshUrl) {
    return url.replace("git+ssh://git@", "https://");
  }
}

export async function loadPackages(
  rawPackages: ReturnType<typeof extractPackages>,
) {
  return await Promise.all(
    rawPackages.map(async (pkg) => {
      const result = await packument(pkg.name, {
        fullMetadata: true,
      });

      return {
        ...pkg,
        repository: getRepositoryUrl(result),
        versions: {
          ...pkg.versions,
          latest: result["dist-tags"].latest,
        },
      };
    }),
  );
}

function packagesToArray(
  packages: DependencyField,
  type: (typeof dependencyFields)[number],
) {
  return Object.entries(packages)
    .filter(([, version]) => !isLocalPackage(version))
    .map(([name, rawVersion]) => {
      // split any prefix like ^ or ~ from the version
      const version = rawVersion.replace(/^[\^~]/, "");

      return { name, type, versions: { current: version } };
    });
}

function isLocalPackage(currentVersion: string) {
  const localPackagePrefix = ["link:", "file:", "workspace:"];

  return localPackagePrefix.some((prefix) => currentVersion.startsWith(prefix));
}
