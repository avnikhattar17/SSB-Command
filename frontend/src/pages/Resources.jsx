import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ExternalLink, Instagram, Play, Radio, Search, Video, X } from 'lucide-react';
import { apiBase } from '../data/api.js';
import { resources as bundledResources, resourceSections, resourceTypes } from '../data/resources.js';

const iconFor = { book: BookOpen, website: ExternalLink, instagram: Instagram, 'youtube-channel': Radio, 'youtube-video': Video };
const itemSections = (item) => Array.isArray(item.section) ? item.section : [item.section];

export default function Resources() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  // Always show every saved collection on entry; a stale route query such as
  // ?section=oir must not hide the other source-controlled resources.
  const [section, setSection] = useState('all');
  const [resources, setResources] = useState(bundledResources);
  const [resourceState, setResourceState] = useState('loading');
  const [activeVideo, setActiveVideo] = useState(null);
  const playerRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    fetch(`${apiBase}/resources`, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Resource API returned ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!payload.success || !Array.isArray(payload.resources)) throw new Error('Resource API returned an invalid resource list');
        // Keep newly curated links visible immediately, even if the backend is
        // still serving an older database snapshot. Database entries remain
        // authoritative when an id exists in both lists.
        const savedById = new Map(payload.resources.map((item) => [item.id, item]));
        setResources([...bundledResources.map((item) => savedById.get(item.id) || item), ...payload.resources.filter((item) => !bundledResources.some((saved) => saved.id === item.id))]);
        setResourceState('connected');
      })
      .catch(() => {
        setResources(bundledResources);
        setResourceState('offline');
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (activeVideo) playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeVideo]);
  const visible = useMemo(() => resources.filter((item) =>
    (type === 'all' || item.type === type) &&
    (section === 'all' || itemSections(item).includes(section)) &&
    `${item.title} ${item.author} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [query, type, section]);
  const visibleGroups = useMemo(() => resourceSections
    .map(([value, label]) => ({ value, label, items: visible.filter((item) => itemSections(item).includes(value)) }))
    .filter((group) => group.items.length > 0), [visible]);

  return <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    <header className="grid-bg relative overflow-hidden rounded border border-olive p-6 md:p-9 mb-8">
      <p className="text-khaki text-xs tracking-[.25em]">YOUR REFERENCE DESK</p>
      <h1 className="font-display text-4xl md:text-5xl mt-2">Resource library</h1>
      <p className="text-sm text-offwhite/65 mt-3 max-w-2xl">A curated collection of books, videos and channels to support your preparation.</p>
    </header>
    <>
    {resourceState === 'loading' && <p className="text-xs text-offwhite/45 mb-4" role="status">Connecting to MongoDB; saved links are shown below while it connects.</p>}
    <div className="grid md:grid-cols-[1fr_210px_190px] gap-3 mb-4">
      <label className="relative"><span className="sr-only">Search resources</span><Search size={16} className="absolute left-3 top-3 text-khaki" /><input className="input pl-9" placeholder="Search titles, creators or tags" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <select className="input" aria-label="Filter by type" value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option>{resourceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select className="input" aria-label="Filter by collection" value={section} onChange={(event) => setSection(event.target.value)}><option value="all">All collections</option>{resourceSections.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <p className="text-xs text-offwhite/45 mb-6" aria-live="polite">{visible.length} resource{visible.length === 1 ? '' : 's'} shown</p>
    {activeVideo && <section ref={playerRef} className="panel p-3 md:p-4 mb-7 scroll-mt-20" aria-label={`Video player: ${activeVideo.title}`}>
      <div className="flex items-center justify-between gap-3 px-1 pb-3"><div><p className="text-khaki text-[10px] tracking-widest">{resourceSections.find(([value]) => value === itemSections(activeVideo)[0])?.[1]} VIDEO PLAYER</p><h2 className="font-display text-lg mt-1">{activeVideo.title}</h2></div><button type="button" onClick={() => setActiveVideo(null)} className="btn btn-ghost px-3" aria-label="Close video player"><X size={16}/>Close</button></div>
      <iframe key={activeVideo.id} title={activeVideo.title} src={activeVideo.embedUrl} className="youtube-player-frame" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      <p className="text-xs text-offwhite/45 mt-2 px-1">If this video cannot play here, open it directly on YouTube from its resource card.</p>
    </section>}
    {!visible.length ? <div className="panel text-center py-14 px-5"><BookOpen size={24} className="mx-auto text-khaki mb-3" /><h2 className="font-display text-xl">No resources match</h2><p className="text-sm text-offwhite/55 mt-2">Try another search or filter.</p></div>
      : <div className="space-y-8">{visibleGroups.map((group) => <section key={group.value} aria-labelledby={`resource-group-${group.value}`}>
        <div className="mb-4"><p className="text-khaki text-xs tracking-[.2em]">{group.label.toUpperCase()} COLLECTION</p><h2 id={`resource-group-${group.value}`} className="font-display text-2xl mt-1">{group.label === 'OIR' ? 'OIR preparation videos' : `${group.label} resources`}</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{group.items.map((item, i) => {
        const Icon = iconFor[item.type] || BookOpen;
        return <article key={item.id} className="panel resource-card flex flex-col p-5" style={{ '--card-index': i }}>
          <div className="flex items-center justify-between"><span className="badge"><Icon size={13} />{resourceTypes.find(([value]) => value === item.type)?.[1]}</span><span className="text-[10px] uppercase tracking-widest text-offwhite/35">{group.label}</span></div>
          <h2 className="font-display text-xl mt-4">{item.title}</h2><p className="text-xs text-sand/60 mt-1">{item.author}</p>
          <p className="text-sm text-offwhite/65 leading-6 mt-3 flex-1">{item.description}</p>
          <div className="flex flex-wrap gap-1 mt-4">{item.tags.map((tag) => <span key={tag} className="text-[10px] text-offwhite/45">#{tag}</span>)}</div>
          <div className="mt-5 flex flex-wrap gap-2">{item.embedUrl && <button type="button" className="btn btn-gold text-xs" onClick={() => setActiveVideo(item)}><Play size={13} /> Watch here</button>}<a className="btn btn-ghost text-xs" href={item.url} target="_blank" rel="noopener noreferrer">{item.type === 'book' ? 'View book link' : item.type === 'youtube-video' || item.type === 'youtube-channel' ? 'Open on YouTube' : 'Open link'} <ExternalLink size={13} /></a></div>
        </article>;
      })}</div>
      </section>)}</div>}
    <footer className="resource-note mt-10" aria-label="About these resources"><div className="resource-note-orbit" aria-hidden="true"><i /></div><div className="resource-note-content"><p className="resource-note-heading"><span className="resource-note-dot" /> PERSONAL FIELD NOTE</p><p className="resource-note-message">These are the videos and resources I referred to for my SSB preparation.</p><p className="resource-note-caption">SSB PREPARATION / CANDIDATE REFERENCE</p>{resourceState === 'connected' && <p className="resource-note-status">RESOURCE LIBRARY / CONNECTED</p>}</div></footer>
    </>
  </div>;
}
