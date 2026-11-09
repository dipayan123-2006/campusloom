import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Data Science', 'Business'];

function strength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', department: DEPTS[0], year: 1 });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sc = strength(f.password);

  async function submit(e) {
    e.preventDefault(); setErr(''); setBusy(true);
    try { login(await api('/auth/register', { method: 'POST', body: { ...f, year: Number(f.year) } })); nav('/dashboard'); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <section className="page narrow">
      <h1>Create your student account</h1>
      <form onSubmit={submit} className="card form">
        <label>Full name<input required value={f.name} onChange={set('name')} /></label>
        <label>University email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password
          <input type="password" required minLength={8} value={f.password} onChange={set('password')} />
          <span className="meter"><span style={{ width: sc * 25 + '%' }} data-s={sc} /></span>
          <small>{['Too short', 'Weak', 'Fair', 'Good', 'Strong'][sc]} – use 8+ characters, mixed case, a number and a symbol.</small>
        </label>
        <div className="two">
          <label>Department<select value={f.department} onChange={set('department')}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Year<select value={f.year} onChange={set('year')}>{[1, 2, 3, 4, 5].map((y) => <option key={y}>{y}</option>)}</select></label>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </section>
  );
}
