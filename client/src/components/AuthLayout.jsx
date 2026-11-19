export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth">
      <div className="auth-photo">
        <img src="/photos/hike.jpg" alt="Qadisha Valley in North Lebanon" />
        <p>Plan your hikes, beach days and ski trips around the weather.</p>
      </div>
      <div className="auth-card">
        <p className="brand">
          <img src="/favicon.svg" alt="" className="brand-logo" />
          Meshwar
        </p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
