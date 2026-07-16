import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer reads the connection URL from schema.prisma. The CLI
// (migrate, db push, db seed) takes it from here; the runtime client gets a
// driver adapter in prisma.service.ts. `generate` runs without DATABASE_URL,
// so we read it leniently rather than throwing when it is unset.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'bun prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
