// Creates or updates the database tables. Usage: DATABASE_URL=... node scripts/migrate.mjs
import fs from 'node:fs';
import pg from 'pg';
const url = process.env.DATABASE_URL;
if (!url) { console.error('Set DATABASE_URL'); process.exit(1); }
const local = url.includes('localhost') || url.includes('host=/') || process.env.PGSSL === 'off';
const client = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
await client.connect();
await client.query(fs.readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
await client.end();
console.log('Database is up to date.');
