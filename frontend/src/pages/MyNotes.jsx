import { useState } from 'react';
import { ExternalLink, FileText, X } from 'lucide-react';

const personalNotes = [
  { title: 'SSB Complete Guide', file: 'ssb-complete-guide_compressed.pdf', pages: 153, label: 'SSB preparation' },
  { title: 'Current Affairs', file: 'current-affairs_compressed.pdf', pages: 190, label: 'Current affairs' },
  { title: 'My Personal Prep', file: 'my-personal-prep_compressed.pdf', pages: 160, label: 'Personal preparation' },
].map((note) => ({ ...note, url: `/notes/${note.file}` }));

export default function MyNotes() {
  const [activeNote, setActiveNote] = useState(null);

  return <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    <header className="grid-bg relative overflow-hidden rounded border border-olive p-6 md:p-9 mb-8">
      <p className="text-khaki text-xs tracking-[.25em]">AVNI'S PERSONAL FIELD NOTES</p>
      <h1 className="font-display text-4xl md:text-5xl mt-2">My preparation notes</h1>
      <p className="text-sm text-offwhite/65 mt-3 max-w-2xl">Your uploaded study documents are saved with the website and ready to read.</p>
    </header>

    <section aria-labelledby="personal-notes-title">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div><p className="text-khaki text-xs tracking-[.2em]">SAVED WITH THIS WEBSITE</p><h2 id="personal-notes-title" className="font-display text-2xl mt-1">Your notes</h2></div>
        <span className="text-xs text-offwhite/45">{personalNotes.length} documents</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">{personalNotes.map((note) => <article key={note.file} className="panel p-5 flex flex-col">
        <div className="flex items-center justify-between"><span className="badge"><FileText size={13}/>PDF</span><span className="text-[10px] text-offwhite/40">{note.pages} pages</span></div>
        <h3 className="font-display text-xl mt-4">{note.title}</h3><p className="text-xs text-offwhite/55 mt-1">{note.label}</p>
        <div className="flex flex-wrap gap-2 mt-5"><button type="button" className="btn btn-gold text-xs" onClick={() => setActiveNote(note)}>{activeNote?.file === note.file ? 'Viewing below' : 'View notes'}</button><a className="btn btn-ghost text-xs" href={note.url} target="_blank" rel="noopener noreferrer">Open separately <ExternalLink size={13}/></a></div>
      </article>)}</div>
    </section>

    {activeNote && <section className="panel p-3 md:p-4 mt-8" aria-label={`PDF viewer: ${activeNote.title}`}>
      <div className="flex items-center justify-between gap-3 px-1 pb-3"><div><p className="text-khaki text-[10px] tracking-widest">READING NOW</p><h2 className="font-display text-lg mt-1">{activeNote.title}</h2></div><button type="button" onClick={() => setActiveNote(null)} className="btn btn-ghost px-3" aria-label="Close PDF viewer"><X size={16}/>Close</button></div>
      <iframe key={activeNote.file} title={activeNote.title} src={activeNote.url} className="prep-pdf-viewer" />
    </section>}
  </div>;
}
