import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Tasks() {
  const { student, setStudent, token } = useAuth();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [err, setErr] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const list = [...student.tasks].sort((a, b) => a.done - b.done || (a.due || '9').localeCompare(b.due || '9'));
  const run = async (p, o) => { try { setStudent(await api(p, { token, ...o })); setErr(''); } catch (x) { setErr(x.message); } };

  return (
    <>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); run('/me/tasks', { method: 'POST', body: { title, due } }); setTitle(''); setDue(''); }}>
        <div className="two">
          <label>New task<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish DBMS assignment" /></label>
          <label>Due date<input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        </div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn">Add task</button>
      </form>
      <h2>Your tasks ({student.tasks.filter((t) => !t.done).length} open)</h2>
      {list.length === 0 && <p className="lead">Nothing here yet. Add a task to start earning XP.</p>}
      <ul className="tasks">
        {list.map((t) => (
          <li key={t.id} className={'mini' + (t.done ? ' done' : '')}>
            <input type="checkbox" checked={t.done} onChange={() => run('/me/tasks/' + t.id, { method: 'PATCH' })} aria-label={'Complete ' + t.title} />
            <span className="t">{t.title}{t.due && <small className={!t.done && t.due < today ? 'late' : ''}> · due {t.due}{!t.done && t.due < today ? ' (overdue)' : ''}</small>}</span>
            <button className="ghost" onClick={() => run('/me/tasks/' + t.id, { method: 'DELETE' })}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
