import { Spec } from './Spec';

export function PageHead({ spec, title, lead, children }: { spec: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="page-head tone-dark">
      <div className="container">
        <Spec>{spec}</Spec>
        <h1 className="display">{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
