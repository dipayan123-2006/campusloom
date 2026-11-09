export default function About() {
  return (
    <section className="page narrow">
      <h1>About CampusLoom</h1>
      <p className="lead">CampusLoom is the university's student portal. It replaces paper forms and scattered spreadsheets with one record per student.</p>
      <div className="card">
        <h2>What you can do</h2>
        <p>Register with your university email, receive a roll number automatically, enrol in courses, and see your weekly timetable with clashes highlighted.</p>
        <h2>How it is built</h2>
        <p>React and React Router on the front end, Express and MongoDB on the back end. Passwords are hashed with bcrypt and sessions use signed tokens.</p>
      </div>
    </section>
  );
}
