import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section tone-dark" style={{ minHeight: '70vh', display: 'grid', alignItems: 'center' }}>
      <div className="container">
        <p className="spec">Error 404</p>
        <h1 className="display h2" style={{ marginTop: '1.25rem' }}>That page isn&rsquo;t here.</h1>
        <div className="btn-row" style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/">Back to home</Link>
          <Link className="btn btn--outline" href="/request-a-quote">Request a Quote</Link>
        </div>
      </div>
    </main>
  );
}
