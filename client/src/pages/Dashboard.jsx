import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Tasks from './Tasks.jsx';
import Focus from './Focus.jsx';
import Gpa from './Gpa.jsx';
import Board from './Board.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIMES = ['9:00', '10:00', '11:00', '12:00', '1:00'];
const COLORS = ['#1B998B', '#F0A202', '#E4572E', '#6C5CE7', '#16204A', '#D63384'];
const RANKS = ['Freshman', 'Explorer', 'Scholar', 'Achiever', 'Mastermind', 'Legend'];
const TABS = ['Overview', 'Timetable', 'Tasks', 'Focus', 'GPA', 'Leaderboard'];

function Overview() {
  const { student: s, setStudent, token } = useAuth();
  const [f, setF] = useState({ name: s.name, year: s.year, avatar: s.avatar });
  const [saved, setSaved] = useState('');
  const done = s.tasks.filter((t) => t.done).length;
  const rate = s.tasks.length ? Math.round((done / s.tasks.length) * 100) : 0;
  const xp = s.focusMinutes + done * 10;
  const level = Math.floor(Math.sqrt(xp / 20)) + 1;
  const base = 20 * (level - 1) ** 2, next = 20 * level ** 2;
  const pct = Math.round(((xp - base) / (next - base)) * 100);

  async function save(e) {
    e.preventDefault();
    setStudent(await api('/me', { method: 'PUT', token, body: { ...f, year: Number(f.year) } }));
    setSaved('Saved!'); setTimeout(() => setSaved(''), 2000);
  }
  return (
    <>
      <div className="card id">
        <div className="avatar" style={{ background: s.avatar }}>{s.name[0].toUpperCase()}</div>
        <div><small>Roll number</small><b>{s.rollNo}</b></div>
        <div><small>Department</small><b>{s.department}</b></div>
        <div><small>Year</small><b>{s.year}</b></div>
        <div><small>Email</small><b>{s.email}</b></div>
      </div>
      <div className="stats">
        <div className="card"><small>Level {level}</small><h2>{RANKS[Math.min(level - 1, 5)]}</h2>
          <div className="bar"><i style={{ width: pct + '%' }} /></div><small>{xp} XP · focus minutes + 10 per finished task</small></div>
        <div className="card center"><small>Tasks done</small><div className="ring" style={{ '--p': rate }}><b>{rate}%</b></div></div>
        <div className="card center"><small>Focus streak</small><h2>{s.streak} day{s.streak === 1 ? '' : 's'}</h2><small>{s.focusMinutes} min total</small></div>
      </div>
      <h2>Edit profile</h2>
      <form className="card form" onSubmit={save}>
        <div className="two">
          <label>Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label>Year<select value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })}>{[1, 2, 3, 4, 5].map((y) => <option key={y}>{y}</option>)}</select></label>
        </div>
        <div className="sw" role="radiogroup" aria-label="Avatar colour">
          {COLORS.map((c) => <button type="button" key={c} aria-label={c} className={f.avatar === c ? 'on' : ''} style={{ background: c }} onClick={() => setF({ ...f, avatar: c })} />)}
        </div>
        <button className="btn">Save changes</button>{saved && <p className="ok">{saved}</p>}
      </form>
    </>
  );
}

function Timetable() {
  const { student, setStudent, token } = useAuth();
  const [courses, setCourses] = useState([]);
  useEffect(() => { api('/courses', { token }).then(setCourses).catch(() => {}); }, [token]);
  const mine = courses.filter((c) => student.courses.includes(c.code));
  const clashesWith = (c) => !student.courses.includes(c.code) && mine.some((m) => m.day === c.day && m.slot === c.slot);
  const clashing = mine.filter((c) => mine.some((o) => o !== c && o.day === c.day && o.slot === c.slot));
  async function toggle(code) { setStudent(await api('/me/courses/' + code, { method: 'POST', token })); }
  return (
    <>
      {clashing.length > 0 && <p className="err" role="alert">Clash: {[...new Set(clashing.map((c) => c.code))].join(', ')} share a time slot. Drop one to fix it.</p>}
      <div className="table-wrap">
        <div className="grid">
          <span />{DAYS.map((d) => <b key={d}>{d}</b>)}
          {TIMES.map((t, r) => (
            <div className="rowgrp" key={t}>
              <b>{t}</b>
              {DAYS.map((_, c) => {
                const hit = mine.filter((m) => m.day === c && m.slot === r);
                return <i key={c} className={hit.length > 1 ? 'coral' : hit.length ? 'teal' : ''}>{hit.map((h) => h.code).join(' / ')}</i>;
              })}
            </div>
          ))}
        </div>
      </div>
      <h2>Course catalogue</h2>
      <ul className="courses">
        {courses.map((c) => {
          const on = student.courses.includes(c.code);
          return (
            <li key={c.code} className="card">
              <div><b>{c.code}</b> {c.title}<small>{DAYS[c.day]} at {TIMES[c.slot]}{clashesWith(c) ? ' · clashes with your timetable' : ''}</small></div>
              <button className={on ? 'btn alt' : 'btn'} onClick={() => toggle(c.code)}>{on ? 'Drop' : 'Enrol'}</button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Dashboard() {
  const { student } = useAuth();
  const [tab, setTab] = useState('Overview');
  if (!student) return <p className="page">Loading…</p>;
  const view = { Overview: <Overview />, Timetable: <Timetable />, Tasks: <Tasks />, Focus: <Focus />, GPA: <Gpa />, Leaderboard: <Board /> }[tab];
  return (
    <section className="page">
      <h1>Hello, {student.name.split(' ')[0]}</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {view}
    </section>
  );
}
