import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, NotebookPen, ChevronDown, ChevronUp, Edit2, Pin, Palette, Search, X, ListTodo } from 'lucide-react';
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

const NOTE_THEMES = [
  { id: 'default', bg: 'bg-white dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', picker: 'bg-slate-200 dark:bg-slate-600' },
  { id: 'red', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50', picker: 'bg-red-400 dark:bg-red-500' },
  { id: 'orange', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-900/50', picker: 'bg-orange-400 dark:bg-orange-500' },
  { id: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900/50', picker: 'bg-yellow-400 dark:bg-yellow-500' },
  { id: 'green', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900/50', picker: 'bg-green-400 dark:bg-green-500' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900/50', picker: 'bg-blue-400 dark:bg-blue-500' },
  { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900/50', picker: 'bg-purple-400 dark:bg-purple-500' },
  { id: 'pink', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-900/50', picker: 'bg-pink-400 dark:bg-pink-500' },
];

const getTheme = (colorIdOrClass: string | undefined) => {
  if (!colorIdOrClass) return NOTE_THEMES[0];
  const theme = NOTE_THEMES.find(t => t.id === colorIdOrClass || t.bg === colorIdOrClass);
  if (!theme) {
    if (colorIdOrClass.includes('red')) return NOTE_THEMES[1];
    if (colorIdOrClass.includes('orange')) return NOTE_THEMES[2];
    if (colorIdOrClass.includes('yellow')) return NOTE_THEMES[3];
    if (colorIdOrClass.includes('green')) return NOTE_THEMES[4];
    if (colorIdOrClass.includes('blue')) return NOTE_THEMES[5];
    if (colorIdOrClass.includes('purple')) return NOTE_THEMES[6];
    if (colorIdOrClass.includes('pink')) return NOTE_THEMES[7];
    return NOTE_THEMES[0];
  }
  return theme;
};

function NoteItem({ note, onDelete, onEdit }: { note: Note; onDelete: (id: string) => void; onEdit?: (id: string, noteData: Partial<Note>) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title || '');
  const [editValue, setEditValue] = useState(note.text);
  const [editColor, setEditColor] = useState(getTheme(note.color).id);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isLong = note.text.length > 150 || note.text.split('\n').length > 5;
  const theme = getTheme(note.color);

  const handleInsertChecklist = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = editValue.substring(0, start);
    const textAfter = editValue.substring(end);
    
    const isStartOfLine = start === 0 || textBefore.endsWith('\n');
    const insertion = isStartOfLine ? '- [ ] ' : '\n- [ ] ';
    
    const newValue = textBefore + insertion + textAfter;
    setEditValue(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

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

  const toggleChecklistItem = (lineIndex: number, currentlyChecked: boolean) => {
    if (!onEdit) return;
    const lines = note.text.split('\n');
    const line = lines[lineIndex];
    if (currentlyChecked) {
      lines[lineIndex] = line.replace(/^\s*- \[[xX]\]/, (match) => match.replace(/\[[xX]\]/, '[ ]'));
    } else {
      lines[lineIndex] = line.replace(/^\s*- \[ \]/, (match) => match.replace(/\[ \]/, '[x]'));
    }
    onEdit(note.id, { text: lines.join('\n') });
  };

  const renderNoteText = (text: string) => {
    const lines = text.split('\n');
    const displayLines = isExpanded ? lines : lines.slice(0, 5);
    const hasMore = lines.length > 5 || (!isExpanded && text.length > 150);
    
    return (
      <div className="space-y-1">
        {displayLines.map((line, index) => {
          const isUnchecked = /^\s*- \[ \] /.test(line);
          const isChecked = /^\s*- \[[xX]\] /.test(line);
          
          if (isUnchecked || isChecked) {
            const content = line.replace(/^\s*- \[[ xX]\] /, '');
            return (
              <div key={index} className="flex items-start gap-2 my-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleChecklistItem(index, isChecked); }}
                  className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                    isChecked 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-400 dark:border-slate-500 hover:border-emerald-500'
                  }`}
                >
                  {isChecked && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <span className={`text-sm ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                  {content}
                </span>
              </div>
            );
          }
          return (
            <p key={index} className="text-sm text-slate-600 dark:text-slate-300 min-h-[1.25rem] whitespace-pre-wrap">
              {line}
            </p>
          );
        })}
        {!isExpanded && hasMore && (
           <div className="text-sm text-slate-400 mt-1 font-medium">...</div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative rounded-2xl p-5 transition-all duration-200 border shadow-sm hover:shadow-md ${theme.bg} ${theme.border}`}>
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
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500/50 resize-none min-h-[120px]"
            autoFocus
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1 relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Change color"
              >
                <Palette size={18} />
              </button>
              <button
                onClick={handleInsertChecklist}
                className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Add checklist item"
              >
                <ListTodo size={18} />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex gap-2 z-20">
                  {NOTE_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setEditColor(t.id)}
                      className={`w-8 h-8 rounded-full shadow-sm border border-black/5 dark:border-white/10 ${t.picker} ${editColor === t.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-800 scale-110' : 'hover:scale-105'} transition-all`}
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
                  setEditColor(getTheme(note.color).id);
                  setShowColorPicker(false);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : showDeleteConfirm ? (
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-slate-900 dark:text-white font-medium text-center">Delete this note?</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={togglePin}
            className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${note.isPinned ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' : 'text-slate-400 hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <Pin size={16} className={note.isPinned ? 'fill-current' : ''} />
          </button>

          <div className="pr-8">
            {note.title && (
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 leading-tight">{note.title}</h3>
            )}
            {renderNoteText(note.text)}
          </div>

          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {format(note.updatedAt || note.createdAt, 'MMM d, yyyy')}
              </span>
              {isLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 hover:underline"
                >
                  {isExpanded ? 'Less' : 'More'}
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Notes({ notes, onAdd, onDelete, onEdit, settings }: NotesProps) {
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState(NOTE_THEMES[0].id);
  const [showNewNoteColorPicker, setShowNewNoteColorPicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const newNoteTextareaRef = useRef<HTMLTextAreaElement>(null);

  const t = translations[settings.language || 'en'].notes || { title: 'Notes', placeholder: 'Take a note...', add: 'Add' };

  const handleInsertChecklistNewNote = () => {
    const textarea = newNoteTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = newNoteText.substring(0, start);
    const textAfter = newNoteText.substring(end);
    
    const isStartOfLine = start === 0 || textBefore.endsWith('\n');
    const insertion = isStartOfLine ? '- [ ] ' : '\n- [ ] ';
    
    const newValue = textBefore + insertion + textAfter;
    setNewNoteText(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  const handleAdd = () => {
    if (newNoteText.trim()) {
      onAdd({ title: newNoteTitle, text: newNoteText, color: newNoteColor, isPinned: false });
      setNewNoteTitle('');
      setNewNoteText('');
      setNewNoteColor(NOTE_THEMES[0].id);
      setIsAdding(false);
      setShowNewNoteColorPicker(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
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

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-shadow shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className={`relative rounded-2xl p-4 transition-all duration-200 border shadow-sm ${getTheme(newNoteColor).bg} ${getTheme(newNoteColor).border} ${isAdding ? 'ring-2 ring-emerald-500/50' : ''}`}>
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
              ref={newNoteTextareaRef}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Take a note... (Use '- [ ] ' for checklists)"
              className="w-full bg-transparent border-none px-2 py-1 text-sm text-slate-900 dark:text-white outline-none resize-none min-h-[80px] placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1 relative">
                <button
                  onClick={() => setShowNewNoteColorPicker(!showNewNoteColorPicker)}
                  className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                  title="Change color"
                >
                  <Palette size={18} />
                </button>
                <button
                  onClick={handleInsertChecklistNewNote}
                  className="p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                  title="Add checklist item"
                >
                  <ListTodo size={18} />
                </button>
                {showNewNoteColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex gap-2 z-20">
                    {NOTE_THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setNewNoteColor(t.id)}
                        className={`w-8 h-8 rounded-full shadow-sm border border-black/5 dark:border-white/10 ${t.picker} ${newNoteColor === t.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-800 scale-110' : 'hover:scale-105'} transition-all`}
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
