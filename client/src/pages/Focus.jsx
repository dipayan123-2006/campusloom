import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Focus() {
  const { student, setStudent, token } = useAuth();
  const [mins, setMins] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [run]);

  useEffect(() => {
    if (run && left <= 0) {
      setRun(false);
      api('/me/focus', { method: 'POST', token, body: { minutes: mins } })
        .then((s) => { setStudent(s); setMsg(`Session complete! +${mins} min logged. Streak: ${s.streak}.`); })
        .catch((x) => setMsg(x.message));
    }
  }, [left]); // eslint-disable-line

  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  useEffect(() => {
    if (run) document.title = `${mm}:${ss} · Focus`;
    return () => { document.title = 'CampusLoom – Student Portal'; };
  }, [run, mm, ss]);

  const pick = (m) => { if (!run) { setMins(m); setLeft(m * 60); setMsg(''); } };
  return (
    <div className="card center">
      <p className="lead">Pick a length and stay on this tab. Finished sessions add to your streak, XP and the leaderboard.</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 0 }}>
        {[1, 25, 45].map((m) => <button key={m} className={'ghost' + (mins === m ? ' pick' : '')} onClick={() => pick(m)}>{m === 1 ? '1 min (demo)' : m + ' min'}</button>)}
      </div>
      <div className="ring big" style={{ '--p': Math.round((1 - left / (mins * 60)) * 100) }}><b className="clock">{mm}:{ss}</b></div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn" onClick={() => setRun(!run)}>{run ? 'Pause' : left < mins * 60 ? 'Resume' : 'Start'}</button>
        <button className="btn alt" onClick={() => { setRun(false); setLeft(mins * 60); }}>Reset</button>
      </div>
      {msg && <p className="ok" role="status">{msg}</p>}
      <small>Total focus: {student.focusMinutes} min · Streak: {student.streak} day(s)</small>
    </div>
  );
}
