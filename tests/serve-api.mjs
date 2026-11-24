import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
const dir = await mkdtemp(join(tmpdir(), 'nightjar-browser-'));
const api = resolve(
  process.env.BOOKSTORE_API_DIR ?? '../horror-bookstore-backend',
);
const child = spawn(process.execPath, ['scripts/local.mjs'], {
  cwd: api,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: '',
    LOCAL_DATA_DIR: dir,
    PORT: '4312',
    PGPORT: '55433',
    HOST: '127.0.0.1',
    STOREFRONT_URL: 'http://localhost:3312',
    PAYMENT_MODE: 'demo',
    SEED_CATALOG: 'yes',
    SHIPPING_COUNTRY: 'US',
    SHIPPING_CENTS: '495',
    STAFF_KEYS: JSON.stringify({
      tester: process.env.QA_STAFF_KEY ?? randomBytes(32).toString('hex'),
    }),
  },
});
for (const signal of ['SIGTERM', 'SIGINT'])
  process.once(signal, () => child.kill('SIGTERM'));
child.once('exit', async (code) => {
  await rm(dir, { recursive: true, force: true });
  process.exit(code ?? 0);
});
