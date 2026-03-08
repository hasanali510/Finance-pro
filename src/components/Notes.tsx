import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, StickyNote, ChevronDown, ChevronUp, Edit2, X } from 'lucide-react';
import { Note } from '../types';
import { translations } from '../i18n';

interface NotesProps {
  notes: Note[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, text: string) => void;
  settings: any;
}

function NoteItem({ note, onDelete, onEdit }: { note: Note; onDelete: (id: string) => void; onEdit?: (id: string, text: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isLong = note.text.length > 100;

  const handleSaveEdit = () => {
    if (editValue.trim() && onEdit) {
      onEdit(note.id, editValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="glass-card p-4 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 resize-none min-h-[100px]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValue(note.text);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : showDeleteConfirm ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-900 dark:text-white font-medium">Are you sure you want to delete this note?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <p className={`text-sm text-slate-900 dark:text-white ${isExpanded ? '' : 'line-clamp-2'} whitespace-pre-wrap`}>
              {note.text}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1"
            >
              {isExpanded ? 'Read less' : 'Read more'}
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function Notes({ notes, onAdd, onDelete, onEdit, settings }: NotesProps) {
  const [newNote, setNewNote] = useState('');
  const t = translations[settings.language || 'en'].notes || { title: 'Notes', placeholder: 'Add a note...', add: 'Add' };

  const handleAdd = () => {
    if (newNote.trim()) {
      onAdd(newNote);
      setNewNote('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10">
          <StickyNote className="text-slate-500 dark:text-slate-400" size={20} />
        </div>
      </div>

      <div className="glass-card p-4 flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={handleAdd}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center mt-8"
            >
              <StickyNote size={48} className="mb-4 text-slate-400 dark:text-slate-600 opacity-50" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No notes yet</p>
              <p className="text-xs text-slate-500 mt-1">Add your first note above</p>
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <NoteItem note={note} onDelete={onDelete} onEdit={onEdit} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
