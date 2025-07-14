import { readProviders, writeProviders } from '../lib/providers';
import { promises as fs } from 'fs';
import path from 'path';
import { beforeAll, afterAll, it, expect } from 'vitest';

const tempFile = path.join(process.cwd(), 'providers.test.json');

beforeAll(async () => {
  await fs.writeFile(tempFile, '{"a":1}');
});

afterAll(async () => {
  await fs.unlink(tempFile);
});

it('reads and writes provider config', async () => {
  await writeProviders({ test: 'x' }, tempFile);
  const data = await readProviders(tempFile);
  expect(data.test).toBe('x');
});
