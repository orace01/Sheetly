import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // The CLI (migrate/introspect) talks to Postgres directly, bypassing the
    // pgbouncer transaction pooler the app uses at runtime.
    url: env("DIRECT_URL"),
  },
});
