// Creates (or resets the password of) an admin. Usage: node scripts/create-admin.mjs you@example.com "Your Name"
// The password is read from ADMIN_PASSWORD so it never appears in shell history arguments.
import pg from 'pg';
import bcrypt from 'bcryptjs';
const [email, name = 'Anima Admin'] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) { console.error('Usage: ADMIN_PASSWORD=<12+ chars> node scripts/create-admin.mjs email "Name"'); process.exit(1); }
const url = process.env.DATABASE_URL;
const local = url.includes('localhost') || url.includes('host=/') || process.env.PGSSL === 'off';
const c = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
await c.connect();
const hash = await bcrypt.hash(password, 12);
await c.query(`insert into users (email, password_hash, role, full_name) values ($1,$2,'admin',$3)
               on conflict (email) do update set password_hash = excluded.password_hash, role = 'admin'`, [email.toLowerCase(), hash, name]);
await c.end();
console.log(`Admin ready: ${email}`);
