import { expect, it } from 'vitest';
import { systemPrompt } from '../lib/systemPrompt';

it('generates english prompt', async () => {
  const prompt = await systemPrompt('English');
  expect(prompt.includes('Salamualaikum')).toBe(true);
});

it('generates arabic prompt', async () => {
  const prompt = await systemPrompt('Arabic');
  expect(prompt.includes('Speak in Arabic')).toBe(true);
});
