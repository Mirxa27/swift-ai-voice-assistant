import { readPrompts, writePrompts } from '../lib/prompts';
import { promises as fs } from 'fs';
import path from 'path';
import { afterAll, beforeAll, expect, it } from 'vitest';

const tempFile = path.join(process.cwd(), 'prompts.test.json');

beforeAll(async () => {
  await fs.writeFile(tempFile, '{"a":1}');
});

afterAll(async () => {
  await fs.unlink(tempFile);
});

it('reads and writes prompts', async () => {
  await writePrompts({ test: 1 }, tempFile);
  const data = await readPrompts(tempFile);
  expect(data.test).toBe(1);
});
