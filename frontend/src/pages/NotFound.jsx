import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="text-center py-24"><h1 className="font-display text-5xl text-khaki">404</h1><p className="my-3">Off the map.</p><Link className="btn btn-gold" to="/">Return to base</Link></div>; }
