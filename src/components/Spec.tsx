export function Spec({ code, children, plain = false }: { code?: string; children: React.ReactNode; plain?: boolean }) {
  return (
    <p className={plain ? 'spec spec--plain' : 'spec'}>
      {code ? <span className="spec__code">{code}</span> : null}
      <span>{children}</span>
    </p>
  );
}
