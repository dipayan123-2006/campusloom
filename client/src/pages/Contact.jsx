import { useState } from 'react';
import { api } from '../api.js';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', body: '' });
  const [msg, setMsg] = useState({ ok: true, text: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try {
      const r = await api('/contact', { method: 'POST', body: f });
      setMsg({ ok: true, text: r.message }); setF({ name: '', email: '', subject: '', body: '' });
    } catch (x) { setMsg({ ok: false, text: x.message }); }
  }
  return (
    <section className="page narrow">
      <h1>Contact the registrar's desk</h1>
      <p className="lead">Open Mon–Fri, 9:00–17:00 · registrar@campusloom.example · Block C, Room 104</p>
      <form onSubmit={submit} className="card form">
        <div className="two">
          <label>Name<input required value={f.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        </div>
        <label>Subject<input value={f.subject} onChange={set('subject')} /></label>
        <label>Message<textarea required rows="5" value={f.body} onChange={set('body')} /></label>
        {msg.text && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.text}</p>}
        <button className="btn">Send message</button>
      </form>
      <h2>Quick answers</h2>
      {[['How do I get my roll number?', 'It is generated automatically when you register.'],
        ['I forgot my password.', 'Send us a message here with your registered email and we will help.'],
        ['How do streaks work?', 'Finish at least one focus session per day to keep your streak going.']].map(([q, a]) => (
        <details key={q} className="mini faq"><summary>{q}</summary><p>{a}</p></details>
      ))}
    </section>
  );
}
