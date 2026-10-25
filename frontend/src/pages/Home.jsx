import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Brain, ExternalLink, FileText, Flag, Instagram, MapPin, MessageCircle, Target, Users } from 'lucide-react';
import BranchSelector from '../components/BranchSelector.jsx';
import { apiBase } from '../data/api.js';
import { officialSites as bundledOfficialSites } from '../data/officialSites.js';
import { inspirationProfiles as bundledInspirationProfiles } from '../data/inspirationProfiles.js';

const sections = [
  { icon: Flag, title: 'The SSB process', detail: 'Understand the selection stages, reporting and what follows.', to: '/process', index: '01' },
  { icon: Target, title: 'OIR & PPDT', detail: 'Build reasoning speed and practise clear picture stories.', to: '/oir-ppdt', index: '02' },
  { icon: Brain, title: 'Psychology', detail: 'Prepare for TAT, WAT, SRT and Self-Description exercises.', to: '/psychology', index: '03' },
  { icon: Users, title: 'GTO tasks', detail: 'Develop communication, planning and practical teamwork.', to: '/gto', index: '04' },
  { icon: MessageCircle, title: 'Personal interview', detail: 'Reflect on your experiences and communicate them clearly.', to: '/interview', index: '05' },
  { icon: FileText, title: 'My notes', detail: 'Write, organise and export your revision notes in this browser.', to: '/notes', index: '06' },
  { icon: BookOpen, title: 'Resource library', detail: 'Keep recommended books, channels and useful links organised.', to: '/resources', index: '07' },
];

function InspirationAvatar({ image, name }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <span className="inspiration-profile-avatar" aria-hidden="true">
    {imageFailed ? <Instagram size={20} /> : <img src={image} alt={`${name} profile`} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />}
  </span>;
}

export default function Home() {
  const { branch, changeBranch } = useOutletContext();
  const [officialSites, setOfficialSites] = useState(bundledOfficialSites);
  const [inspirationProfiles, setInspirationProfiles] = useState(bundledInspirationProfiles);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/official-sites`, { cache: 'no-store', signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Official sites unavailable'); return response.json(); })
      .then((payload) => { if (payload.success && Array.isArray(payload.sites) && payload.sites.length) setOfficialSites(payload.sites); })
      .catch(() => {});
    fetch(`${apiBase}/inspiration-profiles`, { cache: 'no-store', signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Inspiration profiles unavailable'); return response.json(); })
      .then((payload) => { if (payload.success && Array.isArray(payload.profiles) && payload.profiles.length) setInspirationProfiles(payload.profiles); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return <div className="briefing-page">
    <section className="grid-bg border-b border-olive">
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="flex items-center gap-3 text-khaki text-xs tracking-[.24em]"><span className="w-8 h-px bg-khaki" /> CANDIDATE PREPARATION HUB</div>
        <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-12 items-end mt-6">
          <div>
            <h1 className="font-display text-5xl md:text-7xl leading-[.98] tracking-wide">PREPARE WITH<br /><span className="text-khaki">PURPOSE.</span></h1>
            <p className="text-sand/75 text-lg md:text-xl mt-6 max-w-xl">A clear field guide for your Services Selection Board journey.</p>
            <p className="text-offwhite/55 leading-7 mt-3 max-w-xl">Understand the process, strengthen your preparation, and keep the study material that matters in one place.</p>
            <div className="flex flex-wrap gap-3 mt-7"><Link to="/process" className="btn btn-gold">Start with the process <ArrowRight size={16} /></Link><Link to="/resources" className="btn btn-ghost">Explore resources</Link></div>
          </div>
          <div className="hero-visual panel relative overflow-hidden p-4 md:p-5">
            <div className="radar-panel-heading"><div><p className="canvas-kicker">FLIR VIEW / FLANK SPEED</p></div><span className="radar-online"><i /> SYSTEM ONLINE</span></div>
            <div className="service-links-layout">
              <BranchSelector value={branch} onChange={changeBranch} />
              <section className="service-sites" aria-label="Official service websites">
                <p className="canvas-kicker">OFFICIAL SERVICE SITES</p>
                <div className="service-sites-list">
                  {officialSites.map((site) => <a key={site.id} href={site.url} target="_blank" rel="noopener noreferrer" className="service-site-link" style={branch === site.id ? { borderColor: 'var(--tactical-accent)', color: 'var(--tactical-accent-bright)', boxShadow: '0 0 15px var(--tactical-glow)' } : undefined}>
                    <span>{site.name}</span><ExternalLink size={13} />
                  </a>)}
                </div>
              </section>
            </div>
            <Link className="inline-flex items-center gap-2 text-khaki text-sm mt-3 hover:text-sand" to="/process">Understand the selection stages <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="grid grid-cols-3 max-w-xl mt-12 border-y border-olive py-4">
          {[['02', 'selection stages'], ['05', 'core preparation areas'], ['01', 'personal library']].map(([n, t]) => <div key={t} className="px-3 first:pl-0 border-r last:border-0 border-olive"><p className="font-display text-2xl text-khaki">{n}</p><p className="text-[10px] uppercase tracking-widest text-offwhite/50 mt-1">{t}</p></div>)}
        </div>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-4 pt-12 md:pt-16" aria-labelledby="journey-title">
      <div className="journey-panel panel overflow-hidden">
        <div className="journey-heading">
          <div><p className="text-khaki text-xs tracking-[.22em]">CANDIDATE EXPERIENCE</p><h2 id="journey-title" className="font-display text-4xl md:text-6xl lg:text-7xl leading-[.95] tracking-wide mt-3">My SSB journey</h2></div>
          <div className="journey-name"><span className="journey-avatar"><img src="/images/inspiration/avni-khattar.webp" alt="" /></span><span><span className="journey-name-label">CANDIDATE</span><strong>Avni Khattar</strong></span></div>
        </div>
        <div className="journey-stats" aria-label="SSB experience summary">
          <div><Award size={17}/><strong>4</strong><span>SSBs attended</span></div>
          <div><Award size={17}/><strong>3</strong><span>Conferences</span></div>
        </div>
        <div className="journey-boards">
          <article className="journey-board">
            <p className="journey-board-label"><MapPin size={14}/> 33 SSB · BHOPAL</p>
            <ul><li>NDA-155(W)</li><li>NDA-156(W)</li><li>JEE 10+2 B.Tech entry</li></ul>
          </article>
          <article className="journey-board">
            <p className="journey-board-label"><MapPin size={14}/> NSB · VISAKHAPATNAM</p>
            <ul><li>JEE 10+2 B.Tech entry</li></ul>
          </article>
        </div>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-4 py-14 md:py-16">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6"><div><p className="text-khaki text-xs tracking-[.22em]">YOUR PREPARATION MAP</p><h2 className="font-display text-3xl md:text-4xl mt-2">Choose a section</h2></div><Link className="text-sm text-sand/60 hover:text-khaki inline-flex items-center gap-2" to="/notes">Go to my notes <ArrowRight size={15} /></Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(({ icon: Icon, title, detail, to, index }) => <Link key={to} to={to} className="home-preparation-card panel group p-5 transition-colors">
          <div className="flex items-center justify-between"><Icon size={20} className="text-khaki" /><span className="text-[10px] tracking-widest text-offwhite/35">{index}</span></div>
          <h3 className="font-display text-xl mt-5 group-hover:text-khaki transition-colors">{title}</h3><p className="text-sm text-offwhite/55 leading-6 mt-2 min-h-12">{detail}</p>
          <span className="inline-flex items-center gap-2 mt-4 text-xs uppercase tracking-widest text-khaki/80">Open section <ArrowRight size={13} /></span>
        </Link>)}
      </div>
    </section>
    <section className="inspiration-section max-w-6xl mx-auto px-4 pb-16 md:pb-20" aria-labelledby="inspiration-title">
      <div className="inspiration-feature">
        <div className="inspiration-feature-copy">
          <p className="inspiration-kicker"><span /> A LITTLE EXTRA MOTIVATION</p>
          <h2 id="inspiration-title">Inspiration<br /><span>for the journey.</span></h2>
          <p className="inspiration-intro">Keep stories of courage, service and purpose close as you prepare for your own path.</p>
          <div className="inspiration-orbit" aria-hidden="true"><span /><i /><b>SSB</b></div>
          <span className="inspiration-coordinate" aria-hidden="true">SERVICE · PURPOSE · RESOLVE</span>
        </div>
      </div>
      <div className="inspiration-profile-grid" aria-label="Inspiration profiles on Instagram">
        {inspirationProfiles.map(({ name, handle, image }, index) => <a key={handle} className="inspiration-profile" href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">
          <span className="inspiration-profile-index">INSPIRATION / 0{index + 1}</span>
          <InspirationAvatar image={image} name={name} />
          <strong>{name}</strong>
          <span className="inspiration-profile-handle">@{handle}</span>
          <span className="inspiration-profile-action">VIEW INSTAGRAM <ExternalLink size={13} /></span>
        </a>)}
      </div>
    </section>
  </div>;
}
