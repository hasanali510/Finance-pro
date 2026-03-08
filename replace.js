const fs = require('fs');
const path = require('path');

const dir = 'src/components';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

const replacements = [
  { regex: /text-white/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /text-slate-400/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /text-slate-300/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { regex: /text-slate-500/g, replacement: 'text-slate-400 dark:text-slate-500' },
  { regex: /bg-white\/5/g, replacement: 'bg-black/5 dark:bg-white/5' },
  { regex: /bg-white\/10/g, replacement: 'bg-black/10 dark:bg-white/10' },
  { regex: /bg-white\/20/g, replacement: 'bg-black/20 dark:bg-white/20' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-black/5 dark:hover:bg-white/5' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-black/10 dark:hover:bg-white/10' },
  { regex: /hover:bg-white\/20/g, replacement: 'hover:bg-black/20 dark:hover:bg-white/20' },
  { regex: /active:bg-white\/20/g, replacement: 'active:bg-black/20 dark:active:bg-white/20' },
  { regex: /border-white\/5/g, replacement: 'border-black/5 dark:border-white/5' },
  { regex: /border-white\/10/g, replacement: 'border-black/10 dark:border-white/10' },
  { regex: /border-white\/20/g, replacement: 'border-black/20 dark:border-white/20' },
  { regex: /bg-\[#0F172A\]/g, replacement: 'bg-slate-50 dark:bg-[#0F172A]' },
  { regex: /bg-\[#0B1120\]/g, replacement: 'bg-slate-100 dark:bg-[#0B1120]' },
  { regex: /bg-slate-800\/50/g, replacement: 'bg-slate-200 dark:bg-slate-800/50' },
  { regex: /bg-slate-800/g, replacement: 'bg-slate-200 dark:bg-slate-800' },
  { regex: /bg-slate-900/g, replacement: 'bg-slate-100 dark:bg-slate-900' },
  { regex: /text-white\/80/g, replacement: 'text-slate-800 dark:text-white/80' },
  { regex: /text-white\/70/g, replacement: 'text-slate-700 dark:text-white/70' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replacement }) => {
    // We only want to replace if it's not already replaced
    // And we should avoid replacing text-white inside buttons that have a colored background
    // like bg-emerald-500, bg-blue-500, etc.
    // This is a bit tricky with regex, so we'll just do a dumb replacement and then fix the buttons manually.
    // Actually, let's try to be smart. If the line contains "bg-emerald-500" etc, we don't replace text-white.
  });
});
