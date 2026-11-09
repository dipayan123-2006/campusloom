import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Board() {
  const { student, token } = useAuth();
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/leaderboard', { token }).then(setRows).catch(() => setRows([])); }, [token]);
  if (!rows) return <p>Loading…</p>;
  return (
    <>
      <p className="lead">Top 5 students by focus minutes. Only first names are shown.</p>
      {rows.length === 0 && <p>No sessions yet. Finish a Focus session to take the first spot.</p>}
      <ol className="tasks">
        {rows.map((r, i) => (
          <li key={r.id} className={'mini' + (r.id === student.id ? ' me' : '')}>
            <b>#{i + 1}</b><span className="avatar sm" style={{ background: r.avatar }}>{r.name[0]}</span>
            <span className="t">{r.name} <small>{r.department} · {r.streak}-day streak</small></span><b>{r.minutes} min</b>
          </li>
        ))}
      </ol>
    </>
  );
}
