import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage';

export default function useResearchNotes() {
  const [notes, setNotes] = useLocalStorage('palimpsest-research-notes', []);
  const sorted = useMemo(() => [...notes].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [notes]);

  const addNote = (note) => {
    const now = new Date().toISOString();
    setNotes([{ id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...note }, ...notes]);
  };
  const removeNote = (id) => setNotes(notes.filter((note) => note.id !== id));
  return { notes: sorted, addNote, removeNote };
}
