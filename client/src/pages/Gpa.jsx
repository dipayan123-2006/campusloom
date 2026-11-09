import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const G = { 'A+': 10, A: 9, B: 8, C: 7, D: 6, F: 0 };

export default function Gpa() {
  const { student, token } = useAuth();
  const [rows, setRows] = useState([{ name: 'Course 1', credits: 3, grade: 'A' }]);
  const upd = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const credits = rows.reduce((a, r) => a + Number(r.credits || 0), 0);
  const gpa = credits ? rows.reduce((a, r) => a + G[r.grade] * Number(r.credits || 0), 0) / credits : 0;

  async function importCourses() {
    const all = await api('/courses', { token });
    const mine = all.filter((c) => student.courses.includes(c.code));
    if (mine.length) setRows(mine.map((c) => ({ name: c.code + ' ' + c.title, credits: 3, grade: 'A' })));
  }
  return (
    <>
      <div className="card center"><small>Projected GPA (10-point scale)</small><h1>{gpa.toFixed(2)}</h1>
        <div className="bar"><i style={{ width: gpa * 10 + '%' }} /></div><small>{credits} credits</small></div>
      <h2>What-if calculator</h2>
      <ul className="tasks">
        {rows.map((r, i) => (
          <li key={i} className="mini">
            <input className="t" value={r.name} onChange={(e) => upd(i, 'name', e.target.value)} aria-label="Course name" />
            <input type="number" min="1" max="6" style={{ width: 70 }} value={r.credits} onChange={(e) => upd(i, 'credits', e.target.value)} aria-label="Credits" />
            <select value={r.grade} onChange={(e) => upd(i, 'grade', e.target.value)} aria-label="Grade">{Object.keys(G).map((g) => <option key={g}>{g}</option>)}</select>
            <button className="ghost" onClick={() => setRows(rows.filter((_, j) => j !== i))}>✕</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <button className="btn" onClick={() => setRows([...rows, { name: 'Course ' + (rows.length + 1), credits: 3, grade: 'A' }])}>Add course</button>
        <button className="btn alt" onClick={importCourses}>Import my enrolled courses</button>
      </div>
    </>
  );
}
