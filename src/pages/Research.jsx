import { useEffect, useMemo, useState } from 'react';
import { FileText, NotebookPen, Download, Trash2, Search, Plus, ArrowLeft, X, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import Reveal, { RevealGroup } from '../components/Reveal';
import { artifacts } from '../data/artifacts';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../lib/documentsRepo';
import useResearchNotes from '../hooks/useResearchNotes';
import useAuthGate from '../hooks/useAuthGate';
import { useAuth } from '../context/AuthContext';

export default function Research() {
  const { docId } = useParams();
  if (docId) return <DocumentReader docId={docId} />;
  return <ResearchHub />;
}

const EMPTY_DOC = { title: '', type: 'Note', version: '1.0', summary: '', body: '', tags: '' };

function ResearchHub() {
  const [tab, setTab] = useState('documents');
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [artifactId, setArtifactId] = useState('');
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...doc} = edit
  const [form, setForm] = useState(EMPTY_DOC);
  const [saving, setSaving] = useState(false);
  const { notes, addNote, removeNote } = useResearchNotes();
  const { user, isAdmin } = useAuth();
  const requireAuth = useAuthGate();

  const loadDocs = () => {
    setDocsLoading(true);
    getDocuments().then(({ items }) => { setDocs(items); setDocsLoading(false); });
  };
  useEffect(() => { loadDocs(); }, []);

  const shown = useMemo(
    () => docs.filter((d) => `${d.title} ${d.type} ${(d.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())),
    [query, docs]
  );

  const exportDoc = (doc) => {
    const blob = new Blob([doc.body || doc.summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${doc.id || doc.title}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const openNew = () => requireAuth(() => { setForm(EMPTY_DOC); setEditing({}); });
  const openEdit = (doc) => { setForm({ title: doc.title, type: doc.type, version: doc.version, summary: doc.summary, body: doc.body || '', tags: (doc.tags || []).join(', ') }); setEditing(doc); };
  const closeModal = () => { setEditing(null); setForm(EMPTY_DOC); };

  const saveDoc = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editing?.id) await updateDocument(editing.id, payload);
      else await createDocument(payload, user);
      closeModal();
      loadDocs();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeDoc = async (doc) => {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) return;
    await deleteDocument(doc.id);
    loadDocs();
  };

  const exportNotes = () => {
    const body = notes.map((n) => `# Research note\n\n${n.body}\n\nArtifact: ${artifacts.find((a) => a.id === n.artifactId)?.title || 'General'}\nUpdated: ${n.updatedAt}\n`).join('\n---\n');
    const blob = new Blob([body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'palimpsest-research-notes.md'; a.click();
    URL.revokeObjectURL(url);
  };
  const saveNote = () => requireAuth(() => { if (!note.trim()) return; addNote({ body: note.trim(), artifactId }); setNote(''); setArtifactId(''); });

  return (
    <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16 overflow-hidden">
      <div className="aurora-bg" />
      <Reveal className="relative">
        <span className="eyebrow">Research workspace</span>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl">Documents, notes, and evidence.</h1>
            <p className="mt-4 max-w-2xl text-bone-dim leading-relaxed">A living research layer for the archive — the built-in library plus anything your team adds, edits, or retires.</p>
          </div>
          <div className="panel px-4 py-3 font-mono text-xs text-bone-faint"><span className="text-bone">{notes.length}</span> saved notes</div>
        </div>
      </Reveal>

      <Reveal delay={80} className="relative mt-10 flex gap-2 border-b border-ink-line">
        <button onClick={() => setTab('documents')} className={`px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${tab === 'documents' ? 'text-scan border-b border-scan' : 'text-bone-faint'}`}><FileText className="inline w-4 h-4 mr-2" />Documents</button>
        <button onClick={() => setTab('notes')} className={`px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${tab === 'notes' ? 'text-scan border-b border-scan' : 'text-bone-faint'}`}><NotebookPen className="inline w-4 h-4 mr-2" />Research notebook</button>
      </Reveal>

      {tab === 'documents' ? (
        <>
          <Reveal delay={140} variant="left" className="relative mt-7 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative max-w-xl w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-bone-faint" />
              <input className="field pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents, protocols, policies..." />
            </div>
            <button onClick={openNew} className="btn-primary !px-4 !py-2.5 shrink-0"><Plus className="w-4 h-4" /> {user ? 'New document' : 'Sign in to add'}</button>
          </Reveal>
          <div className="mt-7 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docsLoading ? (
              <p className="text-bone-dim font-mono text-xs">Loading documents…</p>
            ) : (
              <RevealGroup variant="scale" gap={70}>
                {shown.map((d) => (
                  <DocumentCard
                    key={d.id}
                    document={d}
                    onExport={exportDoc}
                    onEdit={openEdit}
                    onDelete={removeDoc}
                    canEdit={Boolean(user) && !d.readonly && (d.ownerId === user?.uid || isAdmin)}
                  />
                ))}
              </RevealGroup>
            )}
          </div>
        </>
      ) : (
        <div className="mt-7 grid lg:grid-cols-[1fr_1.25fr] gap-6">
          <Reveal variant="left" as="section" className="panel p-6">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl">New research note</h2><p className="mt-1 text-sm text-bone-dim">Keep observations attached to a record or write a general note.</p></div>
              <Plus className="w-5 h-5 text-scan" />
            </div>
            <select className="field mt-6" value={artifactId} onChange={(e) => setArtifactId(e.target.value)}>
              <option value="">General archive note</option>
              {artifacts.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <textarea className="field mt-3 min-h-44 resize-y" value={note} onChange={(e) => setNote(e.target.value)} placeholder={user ? 'Observation, hypothesis, citation, or follow-up question...' : 'Sign in to save notes to your notebook...'} />
            <button onClick={saveNote} className="btn-primary mt-4 w-full justify-center">{user ? <>Save note <NotebookPen className="w-4 h-4" /></> : <>Sign in to save <NotebookPen className="w-4 h-4" /></>}</button>
          </Reveal>
          <Reveal variant="right" as="section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Saved notes</h2>
              {notes.length > 0 && <button onClick={exportNotes} className="btn-ghost !px-3 !py-2 !text-xs"><Download className="w-3.5 h-3.5" /> Export</button>}
            </div>
            {notes.length === 0 ? (
              <div className="panel p-10 text-center text-bone-dim">Your research notebook is empty.</div>
            ) : (
              notes.map((n) => (
                <article key={n.id} className="panel p-5 lift-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-bone whitespace-pre-wrap leading-relaxed">{n.body}</p>
                      <p className="mt-4 font-mono text-[10px] uppercase text-bone-faint">{artifacts.find((a) => a.id === n.artifactId)?.title || 'General archive note'} · {new Date(n.updatedAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeNote(n.id)} className="text-bone-faint hover:text-rust-bright" aria-label="Delete note"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </article>
              ))
            )}
          </Reveal>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="panel w-full max-w-lg p-6 relative reveal reveal-scale is-visible" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-bone-faint hover:text-scan"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl">{editing.id ? 'Edit document' : 'New document'}</h2>
            <div className="mt-5 space-y-3">
              <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="field" placeholder="Type (e.g. Handbook)" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                <input className="field" placeholder="Version (e.g. 1.0)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <input className="field" placeholder="Short summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              <input className="field" placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <textarea className="field min-h-40 resize-y font-mono text-xs" placeholder={'Body (markdown-ish: # heading, ## sub, - bullet)'} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <button onClick={saveDoc} disabled={saving} className="btn-primary mt-5 w-full justify-center">{saving ? 'Saving…' : <>Save document <Save className="w-4 h-4" /></>}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentReader({ docId }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getDocuments().then(({ items }) => {
      setDoc(items.find((d) => d.id === docId) || null);
      setLoading(false);
    });
  }, [docId]);

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-24 text-bone-dim font-mono text-xs">Loading…</div>;
  if (!doc) return <div className="mx-auto max-w-3xl px-6 py-24">Document not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-16">
      <Link to="/research" className="font-mono text-xs text-bone-faint hover:text-scan"><ArrowLeft className="inline w-4 h-4 mr-2" />Back to research</Link>
      <Reveal className="mt-10">
        <span className="eyebrow">{doc.type} · v{doc.version}</span>
        <h1 className="mt-4 text-4xl sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-bone-faint">Updated {doc.updated}{doc.ownerName ? ` · by ${doc.ownerName}` : ''}</p>
      </Reveal>
      <Reveal delay={100} as="article" className="mt-10 panel p-6 sm:p-10 prose-archive">
        {(doc.body || '').split('\n').map((line, i) => {
          if (line.startsWith('# ')) return <h2 key={i} className="text-2xl mt-2 mb-5">{line.slice(2)}</h2>;
          if (line.startsWith('## ')) return <h3 key={i} className="text-xl mt-8 mb-3">{line.slice(3)}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="ml-5 text-bone-dim leading-relaxed">{line.slice(2)}</li>;
          if (line.startsWith('|')) return <p key={i} className="font-mono text-xs text-bone-dim overflow-x-auto whitespace-pre">{line}</p>;
          if (!line.trim()) return <div key={i} className="h-2" />;
          return <p key={i} className="text-bone-dim leading-relaxed">{line}</p>;
        })}
      </Reveal>
    </div>
  );
}
