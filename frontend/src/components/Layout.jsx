import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Compass } from 'lucide-react';
import { branches } from '../data/branches.js';
import TacticalCanvas from './TacticalCanvas.jsx';

const links = [['/', 'Briefing'], ['/process', 'SSB Process'], ['/oir-ppdt', 'OIR / PPDT'], ['/psychology', 'Psychology'], ['/gto', 'GTO'], ['/interview', 'Interview'], ['/resources', 'Resources'], ['/notes', 'My Notes']];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [branch, setBranch] = useState(() => {
    try { const value = localStorage.getItem('ssb_service_branch'); return branches[value] ? value : 'navy'; }
    catch { return 'navy'; }
  });
  const changeBranch = (value) => {
    setBranch(value);
    try { localStorage.setItem('ssb_service_branch', value); } catch { /* Keep the selection for this session. */ }
  };
  const selectedBranch = branches[branch];
  const cls = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;
  const navLinks = links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={cls}>{label}</NavLink>);

  return <div className="app-root min-h-screen flex flex-col" data-branch={branch} style={{ '--tactical-accent': selectedBranch.accent, '--tactical-accent-bright': selectedBranch.bright, '--tactical-deep': selectedBranch.deep, '--tactical-glow': selectedBranch.glow }}>
    <TacticalCanvas branch={selectedBranch} backgroundLayer />
    <header className="bg-charcoal/95 border-b border-olive sticky top-0 z-30 backdrop-blur">
      <nav aria-label="Main" className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <NavLink to="/" className="font-display text-lg tracking-[.15em] text-khaki flex items-center gap-2 shrink-0"><Compass size={19} />SSB COMMAND</NavLink>
        <div className="hidden xl:flex items-center gap-1 overflow-x-auto">{navLinks}</div>
        <button className="xl:hidden p-2 text-sand" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </nav>
      {open && <div className="xl:hidden max-h-[80vh] overflow-y-auto px-4 pb-4 flex flex-col border-t border-olive">{navLinks}</div>}
    </header>
    <main className="flex-1"><Outlet context={{ branch, changeBranch }} /></main>
    <footer className="border-t border-olive px-4 py-5 text-center text-xs text-sand/50">A personal collection of resources and notes, prepared by a defence aspirant.</footer>
  </div>;
}
