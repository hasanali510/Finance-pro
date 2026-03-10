import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, NotebookPen, ChevronDown, ChevronUp, Edit2, Pin, Palette } from 'lucide-react';
import { Note } from '../types';
import { translations } from '../i18n';
import { format } from 'date-fns';

interface NotesProps {
  notes: Note[];
  onAdd: (noteData: Omit<Note, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, noteData: Partial<Note>) => void;
  settings: any;
}

const NOTE_COLORS = [
  'bg-white dark:bg-slate-800', // Default
  'bg-red-100 dark:bg-red-500/20',
  'bg-orange-100 dark:bg-orange-500/20',
  'bg-yellow-100 dark:bg-yellow-500/20',
  'bg-green-100 dark:bg-green-500/20',
  'bg-blue-100 dark:bg-blue-500/20',
  'bg-purple-100 dark:bg-purple-500/20',
  'bg-pink-100 dark:bg-pink-500/20',
];

function NoteItem({ note, onDelete, onEdit }: { note: Note; onDelete: (id: string) => void; onEdit?: (id: string, noteData: Partial<Note>) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title || '');
  const [editValue, setEditValue] = useState(note.text);
  const [editColor, setEditColor] = useState(note.color || NOTE_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isLong = note.text.length > 100;

  const handleSaveEdit = () => {
    if (editValue.trim() && onEdit) {
      onEdit(note.id, { title: editTitle, text: editValue, color: editColor });
    }
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const togglePin = () => {
    if (onEdit) {
      onEdit(note.id, { isPinned: !note.isPinned });
    }
  };

  return (
    <div className={`rounded-2xl p-4 group transition-colors border border-black/5 dark:border-white/5 shadow-sm ${note.color || NOTE_COLORS[0]}`}>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500/50"
          />
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 resize-none min-h-[100px]"
            autoFocus
          />
          
          <div className="flex justify-between items-center">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Palette size={18} />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-black/5 dark:border-white/10 flex gap-2 z-10">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={`w-6 h-6 rounded-full border border-black/10 dark:border-white/10 ${color} ${editColor === color ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-800' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(note.title || '');
                  setEditValue(note.text);
                  setEditColor(note.color || NOTE_COLORS[0]);
                  setShowColorPicker(false);
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
            <div className="flex-1">
              {note.title && (
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{note.title}</h3>
              )}
              <p className={`text-sm text-slate-700 dark:text-slate-200 ${isExpanded ? '' : 'line-clamp-3'} whitespace-pre-wrap`}>
                {note.text}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 transition-opacity">
              <button
                onClick={togglePin}
                className={`p-2 rounded-lg transition-all duration-150 active:scale-95 ${note.isPinned ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' : 'text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                <Pin size={16} className={note.isPinned ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-150 active:scale-95"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-150 active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {format(note.updatedAt || note.createdAt, 'MMM d, yyyy h:mm a')}
            </span>
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1"
              >
                {isExpanded ? 'Read less' : 'Read more'}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function Notes({ notes, onAdd, onDelete, onEdit, settings }: NotesProps) {
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState(NOTE_COLORS[0]);
  const [showNewNoteColorPicker, setShowNewNoteColorPicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const t = translations[settings.language || 'en'].notes || { title: 'Notes', placeholder: 'Take a note...', add: 'Add' };

  const handleAdd = () => {
    if (newNoteText.trim()) {
      onAdd({ title: newNoteTitle, text: newNoteText, color: newNoteColor, isPinned: false });
      setNewNoteTitle('');
      setNewNoteText('');
      setNewNoteColor(NOTE_COLORS[0]);
      setIsAdding(false);
      setShowNewNoteColorPicker(false);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.15 }}
      className="pb-32 px-6 pt-12 space-y-6 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.title}</h1>
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/10">
          <NotebookPen className="text-slate-500 dark:text-slate-400" size={20} />
        </div>
      </div>

      <div className={`glass-card p-4 transition-all duration-200 ${isAdding ? 'ring-2 ring-emerald-500/50' : ''}`}>
        {isAdding ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent border-none px-2 py-1 text-sm font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              autoFocus
            />
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Take a note..."
              className="w-full bg-transparent border-none px-2 py-1 text-sm text-slate-900 dark:text-white outline-none resize-none min-h-[80px] placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
              <div className="relative">
                <button
                  onClick={() => setShowNewNoteColorPicker(!showNewNoteColorPicker)}
                  className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Palette size={18} />
                </button>
                {showNewNoteColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-black/5 dark:border-white/10 flex gap-2 z-10">
                    {NOTE_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewNoteColor(color)}
                        className={`w-6 h-6 rounded-full border border-black/10 dark:border-white/10 ${color} ${newNoteColor === color ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-800' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewNoteTitle('');
                    setNewNoteText('');
                    setShowNewNoteColorPicker(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="flex items-center gap-3 cursor-text text-slate-500 dark:text-slate-400 px-2 py-1"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} />
            <span className="text-sm">{t.placeholder}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sortedNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center mt-8"
            >
              <NotebookPen size={48} className="mb-4 text-slate-400 dark:text-slate-600 opacity-50" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No notes yet</p>
              <p className="text-xs text-slate-500 mt-1">Add your first note above</p>
            </motion.div>
          ) : (
            sortedNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
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
