import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'prisma/config';

// Load env files in order of priority (same as Next.js)
const envs = ['.env.production.local', '.env.development.local', '.env.local', '.env.production', '.env.development', '.env'];
envs.forEach((file) => {
  config({ path: path.resolve(process.cwd(), file) });
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment files');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});