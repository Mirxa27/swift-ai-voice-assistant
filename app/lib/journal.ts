export type JournalMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function readJournal(): JournalMessage[] {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem('journal');
  return stored ? JSON.parse(stored) : [];
}

export function writeJournal(messages: JournalMessage[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('journal', JSON.stringify(messages));
}

export function clearJournal(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('journal');
}

