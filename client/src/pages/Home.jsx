import { Link } from 'react-router-dom';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const demo = { '0-0': 'teal', '1-1': 'saffron', '2-0': 'coral', '3-2': 'teal', '4-3': 'saffron', '2-4': 'coral' };

export default function Home() {
  return (
    <>
    <section className="page hero">
      <div>
        <h1>Your semester, woven into one place.</h1>
        <p className="lead">Register once, pick your courses, and CampusLoom builds your weekly timetable, flags clashes, and keeps your student details in one tidy record.</p>
        <div className="row">
          <Link className="btn" to="/register">Create your account</Link>
          <Link className="btn alt" to="/login">I already have one</Link>
        </div>
      </div>
      <div className="loom" aria-hidden="true">
        {days.map((d, c) => (
          <div key={d} className="col">
            <b>{d}</b>
            {[0, 1, 2, 3, 4].map((r) => <i key={r} className={demo[`${c}-${r}`] || ''} />)}
          </div>
        ))}
      </div>
    </section>
    <section className="page feats">
      {[['Timetable Loom', 'Enrol and watch clashes appear instantly.'], ['Task planner', 'Track deadlines and earn XP.'],
        ['Focus timer', 'Build streaks and climb the leaderboard.'], ['GPA what-if', 'Test grades before results arrive.']].map(([t, d]) => (
        <div className="card" key={t}><h2 style={{ marginTop: 0 }}>{t}</h2><p>{d}</p></div>
      ))}
    </section>
    </>
  );
}
