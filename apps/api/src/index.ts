import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { packument } from "pacote";

function isLocalPackage(currentVersion: string) {
  const localPackagePrefix = ["link:", "file:", "workspace:"];

  return localPackagePrefix.some((prefix) => currentVersion.startsWith(prefix));
}

const depsToArray = (deps: { [key: string]: string }) => {
  return Object.entries(deps)
    .filter(([, version]) => !isLocalPackage(version))
    .map(([name, rawVersion]) => {
      // split any prefix like ^ or ~ from the version
      const version = rawVersion.replace(/^[\^~]/, "");
      console.log({
        name,
        rawVersion,
        version,
      });
      return `${name}@${version}`;
    });
};

const app = new Hono();

app.post("/", async (c) => {
  const { dependencies, devDependencies } = await c.req.json();

  const packages = [
    ...(dependencies ? depsToArray(dependencies) : []),
    ...(devDependencies ? depsToArray(devDependencies) : []),
  ];

  console.log(packages);

  const output = await Promise.all(
    packages.map(async (pkg) => {
      const result = await packument(pkg.split("@")[0]!, {
        fullMetadata: true,
      });

      return {
        current: pkg.split("@")[1]!,
        latest: result["dist-tags"].latest,
        name: pkg.split("@")[0]!,
      };
    }),
  );

  return c.json(
    output.filter((pkg) => pkg.current && pkg.current !== pkg.latest),
  );
});

// serves the app on port 3000
serve(app);
