import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎱</span>
          TD in a Box
        </Link>

        <button
          className={`nav-toggle ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/')}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/tournament/new" className={isActive('/tournament/new')}>
              New Tournament
            </Link>
          </li>
          <li className="nav-user">
            <button className="btn-logout">Sign In</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
