export interface JournalEntry {
  id: string
  date: Date
  content: string
  mood?: string
  tags?: string[]
}

export function saveJournalEntry(entry: Omit<JournalEntry, 'id'>): JournalEntry {
  const id = Date.now().toString()
  const fullEntry = { ...entry, id }
  
  // Get existing entries
  const entries = getJournalEntries()
  entries.push(fullEntry)
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('journal_entries', JSON.stringify(entries))
  }
  
  return fullEntry
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('journal_entries')
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries()
  const filtered = entries.filter(e => e.id !== id)
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('journal_entries', JSON.stringify(filtered))
  }
}

export function clearJournal(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('journal_entries')
  }
}