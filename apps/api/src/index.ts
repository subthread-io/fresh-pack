import { serve } from "@hono/node-server";
import { Hono } from "hono";

import {
  extractPackages,
  getPackagesToUpgrade,
  loadPackages,
} from "./utils/packages";

const app = new Hono();

app.post("/", async (c) => {
  const packageJson = await c.req.json();

  const rawPackages = extractPackages(packageJson);
  const packages = await loadPackages(rawPackages);
  const packagesToUpgrade = getPackagesToUpgrade(packages);

  return c.json(packagesToUpgrade);
});

// serves the app on port 3000
serve(app);
