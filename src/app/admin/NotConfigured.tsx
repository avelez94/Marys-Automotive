export function NotConfigured() {
  return (
    <main className="admin-wrap admin-page">
      <h1 className="admin-h1">Admin is not connected yet</h1>
      <p className="admin-muted">
        Supabase environment variables are missing for this deployment. See README, section
        &ldquo;Environment&rdquo;.
      </p>
    </main>
  );
}
