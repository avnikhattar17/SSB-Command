import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, ExternalLink, X } from 'lucide-react';

const days = [
  {
    id: 1, label: 'D-01', title: 'Screening', phase: 'STAGE I · DAY ONE', summary: 'Reasoning, picture perception and a group discussion. Screening decides who continues to Stage II.',
    practice: 'Practice plan: complete timed OIR sets, observe a picture for 30 seconds, then draft a story in 4 minutes.',
    tips: ['Read each OIR instruction before starting the timer.', 'Build a story from details you can actually see.', 'In discussion, speak clearly and make room for others.'],
    route: '/resources?section=general',
    tests: [
      { id: 'oir', name: 'OIR', detail: 'Verbal and non-verbal reasoning: practise accuracy first, then add a timer.', query: 'SSB OIR reasoning practice questions' },
      { id: 'ppdt', name: 'PPDT', detail: 'Observe the scene, write a plausible story, then discuss a shared narrative.', query: 'SSB PPDT picture perception practice' },
    ],
  },
  {
    id: 2, label: 'D-02', title: 'Psych tests', phase: 'STAGE II · ASSESSMENT', summary: 'Written psychology exercises invite brief, spontaneous responses based on your observation and experience.',
    practice: 'Practice plan: spend about 4 minutes per TAT story, 15 seconds per WAT word, 30 minutes on an SRT set, and 15 minutes on self-description.',
    tips: ['Write a clear action and outcome instead of a memorised formula.', 'Keep responses practical and connected to the prompt.', 'Use real examples when reflecting on your strengths and growth.'],
    route: '/resources?section=general',
    tests: [
      { id: 'tat', name: 'TAT', detail: 'Study the scene, identify a realistic situation and write a connected story.', query: 'SSB TAT practice picture stories' },
      { id: 'wat', name: 'WAT', detail: 'Practise direct associations that reflect a constructive, natural thought.', query: 'SSB WAT word association practice' },
      { id: 'srt', name: 'SRT', detail: 'Respond to each situation with a safe, concrete next step.', query: 'SSB SRT situation reaction practice' },
      { id: 'sd', name: 'SD', detail: 'Compare your own view with feedback from people who know you well.', query: 'SSB self description test preparation' },
    ],
  },
  {
    id: 3, label: 'D-03', title: 'GTO tasks', phase: 'STAGE II · GROUP WORK', summary: 'Group discussion and planning, followed by practical outdoor tasks with shared goals and constraints.',
    practice: 'Practice plan: give one GPE 20 to 25 minutes, then review how you used facts, time and resources.',
    tips: ['Listen for constraints before suggesting a plan.', 'Explain an idea simply and help the group test it.', 'Follow safety rules and the GTO’s instructions.'],
    route: '/resources?section=gto',
    tests: [
      { id: 'gd', name: 'Group discussion', detail: 'Offer relevant points, listen actively and help the group progress.', query: 'SSB group discussion practice topics' },
      { id: 'gpe', name: 'Group planning', detail: 'Prioritise the situation, then plan a safe sequence using time and resources.', query: 'SSB group planning exercise GPE practice' },
      { id: 'pgt', name: 'Group tasks', detail: 'Work with the team to test practical ideas and share useful roles.', query: 'SSB progressive group task demonstration' },
      { id: 'gor', name: 'Group Obstacle Race (GOR)', detail: 'Coordinate with the group to carry the team resource through the obstacle course while following the GTO’s instructions.', query: 'SSB group obstacle race GOR' },
    ],
  },
  {
    id: 4, label: 'D-04', title: 'GTO & interview', phase: 'STAGE II · INDIVIDUAL + TEAM', summary: 'Group activities, individual tasks and the personal interview make up this stage.',
    practice: 'Practice plan: give a 3-minute lecturette, then try a 15-minute mock interview.',
    tips: ['Organise a short talk into an opening, a few points and a close.', 'Answer interview questions directly and use specific examples.', 'If you do not know something, say so plainly.'],
    route: '/interview',
    tests: [
      { id: 'lecturette', name: 'Lecturette', detail: 'Choose a clear angle and organise a short talk that is easy to follow.', query: 'SSB lecturette practice topics' },
      { id: 'command', name: 'Command task', detail: 'Understand the task, give clear directions and keep safety in view.', query: 'SSB command task demonstration' },
      { id: 'interview', name: 'Interview', detail: 'Review your application, life experiences, interests and decisions.', query: 'SSB personal interview practice questions' },
    ],
  },
  {
    id: 5, label: 'D-05', title: 'Conference', phase: 'STAGE II · BOARD REVIEW', summary: 'The assessors confer and meet candidates. The board communicates its decision and next steps.',
    practice: 'Conference day: review your reporting plan and prepare your personal timeline.',
    tips: ['Listen carefully for your instructions and reporting time.', 'Answer any questions calmly and honestly.', 'If recommended, follow the official medical and documentation guidance.'],
    route: '/process',
    tests: [
      { id: 'conference', name: 'Conference', detail: 'A concluding board interaction. There is no useful script to memorise; stay composed and answer naturally.', query: 'SSB conference day process' },
      { id: 'next', name: 'Next steps', detail: 'Recommendation is followed by service-specific medicals and merit procedures.', query: 'official SSB recommended candidate next steps' },
    ],
  },
];

function Radar({ active = false }) {
  return <svg className={`radar-icon ${active ? 'radar-active' : ''}`} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="11" /><circle cx="16" cy="16" r="6" /><circle cx="16" cy="16" r="2.3" className="radar-core" />
    <path d="M16 2v5M16 25v5M2 16h5M25 16h5M6.1 6.1l3.5 3.5M22.4 22.4l3.5 3.5M25.9 6.1l-3.5 3.5M9.6 22.4l-3.5 3.5" />
  </svg>;
}

export default function SsbTimeline() {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState({});
  const closeRef = useRef(null);
  useEffect(() => {
    if (!selected) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const active = days.find((day) => day.id === selected);
  return <section className="timeline-section my-12" aria-labelledby="timeline-heading">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div><p className="text-khaki text-xs tracking-[.25em]">FIVE-DAY FIELD SEQUENCE</p><h2 id="timeline-heading" className="font-display text-3xl md:text-4xl mt-2">The selection timeline</h2><p className="text-sm text-offwhite/55 mt-2 max-w-2xl">Select a day to open its field brief. Tap any radar marker to expand a test summary.</p></div>
      <span className="badge shrink-0"><span className="status-dot" /> 5 DAYS · TWO STAGES</span>
    </div>

    <div className="timeline-shell relative overflow-hidden rounded border border-olive px-3 py-8 md:px-8 md:py-12">
      <svg className="contour-map" viewBox="0 0 1000 1200" preserveAspectRatio="none" aria-hidden="true">
        <g fill="none" stroke="#86aec2" strokeWidth="1"><path d="M-20 100c190-130 270 140 460 12S770-30 1020 80M-40 127c190-130 270 140 460 12s330-142 580-12M-20 560c170-90 260 100 420 12s320-100 620 0M-20 590c170-90 260 100 420 12s320-100 620 0M-20 940c170-150 270 90 430 10s350-140 610-10M-20 970c170-150 270 90 430 10s350-140 610-10"/><path d="M80-30c-80 120 140 180 50 300S20 420 110 550 200 710 80 810 40 1030 160 1230M130-30c-80 120 140 180 50 300S70 420 160 550 250 710 130 810 90 1030 210 1230M760-30c100 130-90 220 20 350s40 180-50 270-60 180 30 280 80 220-30 360M810-30c100 130-90 220 20 350s40 180-50 270-60 180 30 280 80 220-30 360"/></g>
      </svg>
      <div className="timeline-cable" aria-hidden="true"><span /></div>
      <div className="timeline-days">
        {days.map((day, index) => <div key={day.id} className={`timeline-row ${index % 2 ? 'timeline-row-right' : 'timeline-row-left'} ${selected === day.id ? 'timeline-row-selected' : ''}`}>
          <article className="timeline-card panel">
            <button type="button" className="timeline-card-open" onClick={() => setSelected(day.id)} aria-label={`Open ${day.label}: ${day.title}`}>
              <span className="timeline-phase">{day.phase}</span><span className="timeline-card-title"><span className="font-display text-xl md:text-2xl">{day.title}</span><ArrowUpRight size={16} /></span>
              <span className="timeline-summary">{day.summary}</span>
            </button>
            <div className="radar-list" aria-label={`${day.title} test details`}>
              {day.tests.map((test) => {
                const key = `${day.id}-${test.id}`;
                return <div className={`radar-item ${expanded[key] ? 'radar-item-open' : ''}`} key={test.id}>
                  <button type="button" className="radar-trigger" aria-expanded={!!expanded[key]} onClick={() => setExpanded((value) => ({ ...value, [key]: !value[key] }))}><Radar active={!!expanded[key]} /><span>{test.name}</span></button>
                  {expanded[key] && <div className="radar-detail"><p>{test.detail}</p><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(test.query)}`} target="_blank" rel="noopener noreferrer">Find a practice video <ExternalLink size={12} /></a></div>}
                </div>;
              })}
            </div>
          </article>
          <button type="button" className={`day-badge ${selected === day.id ? 'day-badge-active' : ''}`} onClick={() => setSelected(day.id)} aria-label={`Open ${day.label}: ${day.title}`} aria-pressed={selected === day.id}>
            <svg viewBox="0 0 84 94" aria-hidden="true"><polygon points="22,3 62,3 81,23 81,71 62,91 22,91 3,71 3,23" /><polygon className="badge-inner" points="25,10 59,10 74,26 74,68 59,84 25,84 10,68 10,26" /></svg><span>{day.label}</span>
          </button>
          <div className="timeline-spacer" aria-hidden="true" />
        </div>)}
      </div>
    </div>

    {active && <>
      <button type="button" className="timeline-backdrop" aria-label="Close field brief" onClick={() => setSelected(null)} />
      <aside className="timeline-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-topline"><span className="badge"><span className="status-dot" /> FIELD BRIEF · {active.label}</span><button ref={closeRef} type="button" className="drawer-close" aria-label="Close field brief" onClick={() => setSelected(null)}><X size={18} /></button></div>
        <p className="timeline-phase mt-8">{active.phase}</p><h2 id="drawer-title" className="font-display text-3xl mt-2">{active.title}</h2><p className="text-sm text-offwhite/65 leading-6 mt-4">{active.summary}</p>
        <div className="drawer-time mt-6"><Clock3 size={16} className="text-khaki shrink-0 mt-0.5"/><div><p className="text-[10px] tracking-[.2em] text-khaki">PRACTICE WINDOW</p><p className="text-sm text-sand/75 leading-6 mt-2">{active.practice}</p></div></div>
        <div className="mt-7"><p className="text-[10px] tracking-[.2em] text-khaki">FIELD TIPS</p><ul className="drawer-tips mt-3">{active.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
        <div className="mt-auto pt-8"><Link to={active.route} onClick={() => setSelected(null)} className="btn btn-gold w-full justify-center">Open related study material <ArrowUpRight size={15} /></Link><button type="button" className="drawer-dismiss" onClick={() => setSelected(null)}>Close brief</button></div>
      </aside>
    </>}
  </section>;
}
