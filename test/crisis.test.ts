import { afterAll, beforeAll, expect, it } from 'vitest';
import { addReport, readReports, clearReports } from '../lib/crisis';
import { promises as fs } from 'fs';
import path from 'path';

const tempFile = path.join(process.cwd(), 'crisis.test.json');

beforeAll(async () => {
  await fs.writeFile(tempFile, '[]');
});

afterAll(async () => {
  await fs.unlink(tempFile);
});

it('logs and clears reports', async () => {
  await addReport('test', tempFile);
  const data = await readReports(tempFile);
  expect(data.includes('test')).toBe(true);
  await clearReports(tempFile);
  const cleared = await readReports(tempFile);
  expect(cleared.length).toBe(0);
});
