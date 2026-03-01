import { Link, useLocation } from 'react-router-dom';
import './NavigationBar.css';

export function NavigationBar() {
    const location = useLocation();

    // Optional: Hide on home page if you want
    if (location.pathname === '/') {
        return null; // Or return a different, minimal header if desired
    }

    return (
        <nav className="global-nav">
            <div className="global-nav__brand">
                <Link to="/">Pillar Worlds</Link>
            </div>
            <ul className="global-nav__links">
                <li><Link to="/how-to-play" className={location.pathname === '/how-to-play' ? 'active' : ''}>Rules</Link></li>
                <li><Link to="/character-creation" className={location.pathname === '/character-creation' ? 'active' : ''}>Create Character</Link></li>
                <li><Link to="/characters" className={location.pathname.startsWith('/character') && location.pathname !== '/character-creation' ? 'active' : ''}>My Characters</Link></li>
                <li><Link to="/equipment" className={location.pathname === '/equipment' ? 'active' : ''}>Equipment</Link></li>
                <li><Link to="/abilities" className={location.pathname === '/abilities' ? 'active' : ''}>Abilities</Link></li>
                <li><Link to="/monsters" className={location.pathname === '/monsters' ? 'active' : ''}>Monsters</Link></li>
                <li><Link to="/campaign-builder" className={location.pathname === '/campaign-builder' ? 'active' : ''}>Campaigns</Link></li>
                <li><Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Data</Link></li>
            </ul>
        </nav>
    );
}
