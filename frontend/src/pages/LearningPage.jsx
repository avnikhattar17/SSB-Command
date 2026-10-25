import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpenCheck, Youtube } from 'lucide-react';
import SsbTimeline from '../components/SsbTimeline.jsx';

export default function LearningPage({ section }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <Link className="inline-flex items-center gap-2 text-sm text-sand/70 hover:text-khaki" to="/"><ArrowLeft size={16} /> Back to briefing</Link>
      <header className="max-w-3xl mt-8 mb-10">
        <p className="text-khaki text-xs tracking-[.25em]">{section.eyebrow}</p>
        <h1 className="font-display text-4xl md:text-6xl mt-3">{section.title}</h1>
        <p className="text-sand/70 leading-7 mt-4">{section.intro}</p>
      </header>
      {section.title === 'The SSB process' && <SsbTimeline />}
      <div className="grid md:grid-cols-2 gap-4">
        {section.blocks.map((block, i) => <article key={block.title} className="panel p-6">
          <div className="flex items-center gap-3 mb-4"><span className="text-xs tracking-widest text-khaki">0{i + 1}</span><BookOpenCheck className="text-khaki" size={18} /></div>
          <h2 className="font-display text-xl tracking-wide">{block.title}</h2>
          <p className="text-sm text-offwhite/70 leading-7 mt-3">{block.text}</p>
        </article>)}
      </div>
      {!!section.videoLinks?.length && <section className="panel mt-6 p-5 md:p-6">
        <p className="text-khaki text-xs tracking-[.2em]">VIDEO WALKTHROUGH</p>
        <div className="mt-3 flex flex-wrap gap-3">{section.videoLinks.map((video) => <a key={video.url} href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><Youtube size={16} className="text-khaki" />{video.title}<ArrowUpRight size={14} /></a>)}</div>
      </section>}
      <Link to={section.resourceSection ? `/resources?section=${section.resourceSection}` : '/resources'} className="inline-flex items-center gap-2 mt-7 text-khaki hover:text-sand">Browse study resources <ArrowUpRight size={16} /></Link>
    </div>
  );
}
