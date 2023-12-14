import { serve } from "@hono/node-server";
import { Hono } from "hono";

import {
  extractPackages,
  getPackagesToUpgrade,
  loadPackages,
} from "./utils/packages";
import {
  getReleasesBetweenVersions,
  getReleasesForPackages,
} from "./utils/repositories";

const app = new Hono();

app.post("/", async (c) => {
  const packageJson = await c.req.json();

  const rawPackages = extractPackages(packageJson);
  const packages = await loadPackages(rawPackages);
  const packagesToUpgrade = getPackagesToUpgrade(packages);
  const packagesWithReleases = await getReleasesForPackages(packagesToUpgrade);

  const changelogString = packagesWithReleases
    .map((pkg) => {
      const filteredReleases = getReleasesBetweenVersions(
        pkg.releases,
        pkg.versions.current,
        pkg.versions.latest,
      );

      const changelogString = filteredReleases
        .map((release) => {
          return `${release.tag_name}: ${release.body}`;
        })
        .join("\n\n");

      return `## Changelog for ${pkg.name}:\n\n${changelogString}`;
    })
    .join("\n\n");

  return c.json(changelogString);
});

// serves the app on port 3000
serve(app);
