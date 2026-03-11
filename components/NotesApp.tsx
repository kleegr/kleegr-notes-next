'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kn_next');
    if (saved) {
      const parsed = JSON.parse(saved) as Note[];
      setNotes(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }
    setMounted(true);
  }, []);

  const save = useCallback((updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('kn_next', JSON.stringify(updated));
  }, []);

  const showMsg = (msg: string) => {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const newNote = () => {
    const note: Note = {
      id: 'n' + Date.now(),
      title: '',
      body: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [note, ...notes];
    save(updated);
    setActiveId(note.id);
    showMsg('New note created');
  };

  const deleteNote = (id: string) => {
    if (!confirm('Delete this note?')) return;
    const updated = notes.filter(n => n.id !== id);
    save(updated);
    setActiveId(updated.length > 0 ? updated[0].id : null);
    showMsg('Note deleted');
  };

  const updateNote = (field: 'title' | 'body', value: string) => {
    if (!activeId) return;
    const updated = notes.map(n =>
      n.id === activeId ? { ...n, [field]: value, updatedAt: Date.now() } : n
    );
    save(updated);
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );

  const activeNote = notes.find(n => n.id === activeId);

  if (!mounted) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header className="animate-slide-down" style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--bd)',
        background: 'var(--s1)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 className="font-display" style={{ fontSize: 20, color: 'var(--ac)', margin: 0 }}>
          Kleegr{' '}
          <span style={{ color: 'var(--mu)', fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 400, marginLeft: 4 }}>
            notes
          </span>
        </h1>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside className="animate-fade-in" style={{
          width: 260,
          borderRight: '1px solid var(--bd)',
          background: 'var(--s1)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: 14 }}>
            <button
              onClick={newNote}
              style={{
                width: '100%', padding: '9px 14px',
                background: 'var(--ac)', color: '#0f0e0c',
                border: 'none', fontFamily: 'DM Mono, monospace',
                fontSize: 11, fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ac2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ac)')}
            >
              <Plus size={13} /> New Note
            </button>
          </div>

          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--s2)', border: '1px solid var(--bd)', padding: '6px 10px' }}>
              <Search size={11} style={{ color: 'var(--mu)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--tx)', fontFamily: 'DM Mono, monospace', fontSize: 12, width: '100%'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--mu)', fontSize: 11, lineHeight: 2 }}>
                {search ? 'No matches found' : 'No notes yet.\nClick + New Note'}
              </div>
            ) : (
              filtered.map((note, i) => (
                <div
                  key={note.id}
                  className="animate-fade-up"
                  onClick={() => setActiveId(note.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--bd)',
                    cursor: 'pointer',
                    background: note.id === activeId ? 'var(--s2)' : 'transparent',
                    borderLeft: note.id === activeId ? '2px solid var(--ac)' : '2px solid transparent',
                    animationDelay: `${i * 0.04}s`,
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                    {note.title || 'Untitled'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mu)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {note.body.replace(/\n/g, ' ') || 'Empty'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 5, opacity: 0.7 }}>
                    {timeAgo(note.updatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeNote ? (
            <>
              <div style={{
                padding: '10px 20px',
                borderBottom: '1px solid var(--bd)',
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--s1)'
              }}>
                <input
                  className="font-display"
                  value={activeNote.title}
                  onChange={e => updateNote('title', e.target.value)}
                  placeholder="Note title..."
                  style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 18, color: 'var(--tx)', outline: 'none' }}
                />
                <button
                  onClick={() => deleteNote(activeNote.id)}
                  style={{
                    background: 'none', border: '1px solid var(--bd)', color: 'var(--mu)',
                    width: 30, height: 30, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rd)'; e.currentTarget.style.color = 'var(--rd)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--mu)'; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ flex: 1, padding: '24px 32px', overflow: 'hidden' }}>
                <textarea
                  value={activeNote.body}
                  onChange={e => updateNote('body', e.target.value)}
                  placeholder="Start writing..."
                  style={{
                    width: '100%', height: '100%', background: 'transparent',
                    border: 'none', color: 'var(--tx)', fontFamily: 'DM Mono, monospace',
                    fontSize: 13, lineHeight: 1.9, outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <div style={{
                padding: '8px 20px',
                borderTop: '1px solid var(--bd)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 10, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div className="animate-pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ac)' }} />
                  Auto-saved
                </div>
                <span>{wordCount(activeNote.body)} words</span>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--mu)', gap: 10
            }}>
              <div style={{ fontSize: 40, opacity: 0.25 }}>📝</div>
              <p style={{ fontSize: 12 }}>Select or create a note</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        background: 'var(--ac)', color: '#0f0e0c',
        padding: '9px 16px', fontSize: 11,
        fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em',
        zIndex: 999,
        transform: showToast ? 'translateY(0)' : 'translateY(16px)',
        opacity: showToast ? 1 : 0,
        transition: 'all 0.3s ease',
        pointerEvents: 'none'
      }}>
        {toast}
      </div>
    </div>
  );
}
