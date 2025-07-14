import { describe, it, expect, beforeEach } from 'vitest';
import { readJournal, writeJournal, clearJournal } from '../app/lib/journal';

describe('journal helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes and reads journal', () => {
    writeJournal([{ role: 'user', content: 'hi' }]);
    const data = readJournal();
    expect(data.length).toBe(1);
    expect(data[0].content).toBe('hi');
  });

  it('clears journal', () => {
    writeJournal([{ role: 'assistant', content: 'hello' }]);
    clearJournal();
    expect(readJournal().length).toBe(0);
  });
});

