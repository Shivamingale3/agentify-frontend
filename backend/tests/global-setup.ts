import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function globalSetup(): Promise<() => void> {
  const dbPath = path.resolve(__dirname, 'test.db');
  const dbJournal = `${dbPath}-journal`;

  // Start from a clean slate so re-runs are deterministic
  fs.rmSync(dbPath, { force: true });
  fs.rmSync(dbJournal, { force: true });

  // Apply migrations to the test database (creates the file if missing)
  // cwd must be the backend/ dir so prisma can find prisma/schema.prisma
  // and prisma.config.ts. The test db lives at tests/test.db.
  const backendDir = path.resolve(__dirname, '..');

  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: backendDir,
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() ?? '';
    const stdout = result.stdout?.toString() ?? '';
    throw new Error(
      `prisma migrate deploy failed in global setup.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }

  return () => {
    // Teardown: leave the db in place so re-runs of a single test file are fast.
    // `globalSetup` already deletes it at the start of the next full run.
  };
}

export default globalSetup;
