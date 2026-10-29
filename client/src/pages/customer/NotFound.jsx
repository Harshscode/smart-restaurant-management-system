import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
export default function NotFound() { return <section className="not-found container"><span>404</span><Compass size={49} /><h1>Looks like we're off the menu.</h1><p>We couldn't find that page, but there are plenty of good things waiting back home.</p><Link to="/" className="btn btn-primary">Back to home <ArrowRight size={17} /></Link></section>; }
