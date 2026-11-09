import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIMES = ['9:00', '10:00', '11:00', '12:00', '1:00'];

export default function Dashboard() {
  const { student, setStudent, token } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => { api('/courses', { token }).then(setCourses).catch(() => {}); }, [token]);
  if (!student) return <p className="page">Loading…</p>;

  const mine = courses.filter((c) => student.courses.includes(c.code));
  const clashesWith = (c) => !student.courses.includes(c.code) &&
    mine.some((m) => m.day === c.day && m.slot === c.slot);
  const clashing = mine.filter((c) => mine.some((o) => o !== c && o.day === c.day && o.slot === c.slot));

  async function toggle(code) { setStudent(await api('/me/courses/' + code, { method: 'POST', token })); }

  return (
    <section className="page">
      <h1>Hello, {student.name.split(' ')[0]}</h1>
      <div className="card id">
        <div><small>Roll number</small><b>{student.rollNo}</b></div>
        <div><small>Department</small><b>{student.department}</b></div>
        <div><small>Year</small><b>{student.year}</b></div>
        <div><small>Email</small><b>{student.email}</b></div>
        <div><small>Courses</small><b>{student.courses.length}</b></div>
      </div>

      <h2>Timetable Loom</h2>
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
    </section>
  );
}
