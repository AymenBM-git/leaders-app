import { config } from 'dotenv';
import path from 'path';
import { defineConfig, env } from 'prisma/config';

// Load env files in order of priority (same as Next.js)
const envs = ['.env.production.local', '.env.development.local', '.env.local', '.env.production', '.env.development', '.env'];
envs.forEach((file) => {
  config({ path: path.resolve(process.cwd(), file) });
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})