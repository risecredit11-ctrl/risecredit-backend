import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/rates', label: 'Rates & Terms' },
  { path: '/apply', label: 'Apply' },
  { path: '/partners', label: 'Banking Partners' },
  { path: '/creditinsurance', label: 'Credit Insurance' },
  { path: '/contact', label: 'Contact Us' },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogoClick = async (e) => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 8) {
      e.preventDefault(); // Stop normal navigation
      const password = window.prompt("Admin Access - Enter Password:");
      if (password !== null) {
        try {
          const res = await fetch('/api/settings/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          const data = await res.json();
          
          if (data.success) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            sessionStorage.setItem('adminToken', data.token);
            navigate('/admin');
          } else {
            alert("Access Denied: Incorrect password.");
          }
        } catch (err) {
          console.error('Failed to verify password:', err);
          alert("Error verifying password. Please try again.");
        }
      }
      setLogoClickCount(0); // Reset counter
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" id="nav-logo" onClick={handleLogoClick}>
          <img src="/logo.png" alt="Rise Credit" className="navbar__logo-img" />
          <span className="navbar__logo-text">Credit</span>
        </Link>

        <nav className={`navbar__nav ${isOpen ? 'navbar__nav--open' : ''}`} id="nav-menu">
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
                  id={`nav-link-${link.path.replace('/', '') || 'home'}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/apply" className="btn btn-primary btn-small navbar__cta" id="nav-apply-btn">
            Apply Now
          </Link>
        </nav>

        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          id="nav-toggle"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {isOpen && <div className="navbar__overlay" onClick={() => setIsOpen(false)} />}
    </header>
  );
}

export default Navbar;
