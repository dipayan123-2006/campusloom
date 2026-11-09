import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault(); setErr('');
    try { login(await api('/auth/login', { method: 'POST', body: f })); nav('/dashboard'); }
    catch (x) { setErr(x.message); }
  }
  return (
    <section className="page narrow">
      <h1>Welcome back</h1>
      <form onSubmit={submit} className="card form">
        <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn">Log in</button>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
