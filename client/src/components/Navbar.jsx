import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { token, student, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('cl_theme') === 'dark');
  const nav = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('cl_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const close = () => setOpen(false);
  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={close}><span className="knot" />CampusLoom</Link>
      <button className="burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <nav className={open ? 'links open' : 'links'}>
        <NavLink to="/" end onClick={close}>Home</NavLink>
        <NavLink to="/about" onClick={close}>About</NavLink>
        <NavLink to="/contact" onClick={close}>Contact</NavLink>
        {token ? (
          <>
            <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
            <button className="ghost" onClick={() => { logout(); close(); nav('/'); }}>Log out{student ? ` (${student.name.split(' ')[0]})` : ''}</button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={close}>Log in</NavLink>
            <NavLink to="/register" className="cta" onClick={close}>Register</NavLink>
          </>
        )}
        <button className="ghost" onClick={() => setDark(!dark)} aria-label="Switch theme">{dark ? 'Light' : 'Dark'}</button>
      </nav>
    </header>
  );
}
