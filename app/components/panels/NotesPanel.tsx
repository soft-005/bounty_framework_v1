'use client';

import { useState } from 'react';
import { Note } from '@/app/types';
import {
  IconPlus,
  IconSearch,
  IconSave,
  IconFolder,
  IconX,
} from '@/app/components/ui/icons';

interface NotesPanelProps {
  notes: Note[];
  onSave: (note: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const SAMPLE_TAGS = ['xss', 'sqli', 'idor', 'ssrf', 'recon', 'subdomain', 'api', 'auth'];

export function NotesPanel({ notes, onSave, onDelete }: NotesPanelProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const startNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
    setEditTitle('');
    setEditContent('');
    setEditTags([]);
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags);
  };

  const startEditing = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setEditTags(selectedNote.tags);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave({
      id: selectedNote?.id,
      title: editTitle,
      content: editContent,
      tags: editTags,
    });
    setIsEditing(false);
  };

  const toggleTag = (tag: string) => {
    if (editTags.includes(tag)) {
      setEditTags(editTags.filter((t) => t !== tag));
    } else {
      setEditTags([...editTags, tag]);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-full gap-4">
      {/* Notes List */}
      <div className="w-80 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notes</h3>
            <button onClick={startNewNote} className="btn btn-primary py-1.5 px-3 text-sm">
              <IconPlus size={14} />
              New
            </button>
          </div>
          <div className="relative">
            <IconSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 py-2 text-sm"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length > 0 ? (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedNote?.id === note.id
                      ? 'bg-[var(--navy-700)] border-l-2 border-[var(--cyan-glow)]'
                      : 'hover:bg-[var(--navy-800)]'
                  }`}
                >
                  <h4 className="font-medium text-sm line-clamp-1">{note.title}</h4>
                  <p className="text-xs text-[var(--foreground-dim)] mt-1 line-clamp-2">
                    {note.content}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--navy-800)] text-[var(--cyan-bright)]"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-[var(--foreground-dim)]">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-[var(--foreground-dim)] mt-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--foreground-dim)]">
              <IconFolder size={32} className="mb-3 text-[var(--navy-600)]" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Create your first note</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--navy-950)] text-xs text-[var(--foreground-dim)]">
          {notes.length} notes total
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col bg-[var(--navy-900)] rounded-xl border border-[var(--border)] overflow-hidden">
        {selectedNote || isEditing ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title..."
                  className="input py-1.5 text-lg font-semibold bg-transparent border-none focus:ring-0"
                />
              ) : (
                <h3 className="text-lg font-semibold">{selectedNote?.title}</h3>
              )}

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost py-1.5 px-3 text-sm"
                    >
                      <IconX size={14} />
                      Cancel
                    </button>
                    <button onClick={handleSave} className="btn btn-primary py-1.5 px-3 text-sm">
                      <IconSave size={14} />
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={startEditing}
                      className="btn btn-secondary py-1.5 px-3 text-sm"
                    >
                      Edit
                    </button>
                    {selectedNote && (
                      <button
                        onClick={() => onDelete(selectedNote.id)}
                        className="btn btn-danger py-1.5 px-3 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            {isEditing && (
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--navy-950)]">
                <p className="text-xs text-[var(--foreground-dim)] mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2 py-1 rounded-md transition-colors ${
                        editTags.includes(tag)
                          ? 'bg-[var(--cyan-glow)] text-[var(--navy-950)]'
                          : 'bg-[var(--navy-800)] text-[var(--foreground-muted)] hover:bg-[var(--navy-700)]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your notes here...

Use this space to document:
- Discovered endpoints
- Potential vulnerabilities
- Testing methodologies
- Evidence and screenshots"
                  className="w-full h-full p-4 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-sm leading-relaxed"
                />
              ) : (
                <div className="p-4">
                  {selectedNote?.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedNote.tags.map((tag) => (
                        <span key={tag} className="badge badge-cyan text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{selectedNote?.content}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedNote && !isEditing && (
              <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--navy-950)] text-xs text-[var(--foreground-dim)] flex items-center justify-between">
                <span>Created: {new Date(selectedNote.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--foreground-dim)]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--navy-800)] flex items-center justify-center">
                <IconFolder size={32} className="text-[var(--navy-500)]" />
              </div>
              <p className="text-lg font-medium">Select a note</p>
              <p className="text-sm mt-1">Choose a note from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
