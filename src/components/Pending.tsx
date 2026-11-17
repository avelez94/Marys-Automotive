import { showPendingMarkers } from '@/lib/env';

/**
 * Flags content that still needs owner confirmation. Visible on preview deployments only,
 * so reviewers can see exactly what is unverified. Renders nothing in production.
 */
export function Pending({ note, block = false }: { note?: string; block?: boolean }) {
  if (!showPendingMarkers()) return null;
  return (
    <span className={block ? 'pending pending--block' : 'pending'} role="note">
      {block ? `Pending confirmation: ${note ?? ''}` : (note ?? 'Pending confirmation')}
    </span>
  );
}

/** Wraps content that must not appear in production until verified. */
export function PreviewOnly({ children }: { children: React.ReactNode }) {
  if (!showPendingMarkers()) return null;
  return <>{children}</>;
}
