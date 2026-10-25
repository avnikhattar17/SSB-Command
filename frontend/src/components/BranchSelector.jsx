import { Anchor, Plane, Shield } from 'lucide-react';
import { branches } from '../data/branches.js';

const icons = { navy: Anchor, army: Shield, airforce: Plane };

export default function BranchSelector({ value, onChange }) {
  return <section className="branch-panel" aria-label="Service theme selector">
    <div className="branch-heading"><span className="canvas-kicker">SELECT SERVICE</span><span className="branch-current">{branches[value].label}</span></div>
    <div className="branch-options" role="group" aria-label="Choose service theme">
      {Object.entries(branches).map(([key, branch]) => {
        const Icon = icons[key];
        return <button key={key} type="button" className={`branch-option ${value === key ? 'branch-option-active' : ''}`} aria-pressed={value === key} onClick={() => onChange(key)}>
          <Icon size={14} /><span>{branch.short}</span>
        </button>;
      })}
    </div>
    <p className="branch-motto">{branches[value].motto}</p>
  </section>;
}
