import { octokit } from "../lib/octokit";

import { Package } from "./packages";

export async function getReleases(repositoryUrl: string) {
  const { owner, repo } = getOwnerAndRepoFromRepositoryUrl(repositoryUrl);

  const response = await octokit.request("GET /repos/{owner}/{repo}/releases", {
    owner: owner,
    repo: repo,
  });

  return response.data;
}

export function getReleasesBetweenVersions(
  releases: Awaited<ReturnType<typeof getReleases>>,
  currentVersion: string,
  latestVersion: string,
) {
  return releases.filter((release) => {
    const version = release.tag_name.replace(/^v/, "");

    return version > currentVersion && version <= latestVersion;
  });
}

export async function getReleasesForPackages(packages: Package[]) {
  return await Promise.all(
    packages
      .filter((pkg) => Boolean(pkg.repository))
      .map(async (pkg) => {
        const releases = await getReleases(pkg.repository!);

        return {
          ...pkg,
          releases,
        };
      }),
  );
}

function getOwnerAndRepoFromRepositoryUrl(repositoryUrl: string) {
  if (!repositoryUrl.startsWith("https://github.com/")) {
    throw new Error("Repository URL is invalid");
  }

  const [owner, repo] = repositoryUrl
    .replace("https://github.com/", "")
    .split("/");

  return { owner, repo } as { owner: string; repo: string };
}
