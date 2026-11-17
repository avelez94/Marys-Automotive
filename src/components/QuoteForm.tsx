'use client';

import { useId, useRef, useState } from 'react';
import { business, telHref } from '@/content/business';
import { quoteServiceOptions } from '@/content/quote';
import { ArrowIcon } from './Icons';

type Errors = Record<string, string>;
type State = 'idle' | 'sending' | 'sent' | 'error';

const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function validate(fd: FormData): Errors {
  const e: Errors = {};
  const v = (k: string) => String(fd.get(k) ?? '').trim();
  if (v('name').length < 2) e.name = 'Please enter your name.';
  if (v('phone').replace(/\D/g, '').length < 10) e.phone = 'Please enter a 10 digit phone number.';
  const email = v('email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Please enter a valid email address.';
  if (v('preferredContact') === 'email' && !email) e.email = 'Add an email address or choose another way to reach you.';
  const year = Number(v('vehicleYear'));
  const maxYear = new Date().getFullYear() + 1;
  if (!year || year < 1950 || year > maxYear) e.vehicleYear = `Enter a year between 1950 and ${maxYear}.`;
  if (!v('vehicleMake')) e.vehicleMake = 'Please enter the make.';
  if (!v('vehicleModel')) e.vehicleModel = 'Please enter the model.';
  const miles = v('mileage').replace(/[,\s]/g, '');
  if (miles && !/^\d{1,7}$/.test(miles)) e.mileage = 'Numbers only, for example 87500.';
  if (!v('service')) e.service = 'Choose the closest match.';
  if (v('description').length < 10) e.description = 'Please tell us a little more about the problem.';
  return e;
}

export function QuoteForm({ sourcePage = '/' }: { sourcePage?: string }) {
  const uid = useId();
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const id = (name: string) => `${uid}-${name}`;
  const err = (name: string) =>
    errors[name]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${id(name)}-err` }
      : { 'aria-invalid': false as const };
  const ErrorText = ({ name }: { name: string }) =>
    errors[name] ? (
      <span className="field__error" id={`${id(name)}-err`}>
        {errors[name]}
      </span>
    ) : null;

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (state === 'sending') return;
    const fd = new FormData(ev.currentTarget);
    const found = validate(fd);
    setErrors(found);
    if (Object.keys(found).length) {
      setState('error');
      setMessage('Please check the highlighted fields.');
      const first = ev.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
      return;
    }

    setState('sending');
    setMessage('');
    const payload = Object.fromEntries(fd.entries());
    payload.mileage = String(payload.mileage ?? '').replace(/[,\s]/g, '');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, startedAt: startedAt.current, sourcePage }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fieldErrors?: Errors };
      if (res.ok) {
        setState('sent');
        formRef.current?.reset();
        return;
      }
      setErrors(data.fieldErrors ?? {});
      setState('error');
      setMessage(data.error ?? `Something went wrong. Please call us at ${business.phone.display}.`);
    } catch {
      setState('error');
      setMessage(`We couldn't reach the server. Check your connection or call ${business.phone.display}.`);
    }
  }

  if (state === 'sent') {
    return (
      <div className="ticket" aria-live="polite">
        <div className="ticket__success">
          <span className="stamp">Received</span>
          <h3 className="h3">Thanks. We have your request.</h3>
          <p>
            Someone from the shop will reach out using the contact method you chose. This is a request, not a
            confirmed appointment or a final price.
          </p>
          <p>
            Need us sooner? Call <a href={telHref}>{business.phone.display}</a>.
          </p>
          <div className="btn-row" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn--outline" onClick={() => { startedAt.current = Date.now(); setState('idle'); }}>
              Send another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} className="ticket" noValidate onSubmit={onSubmit} aria-describedby={`${id('note')}`}>
      <div className="ticket__head">
        <span className="ticket__title">Repair Request</span>
        <span className="ticket__meta">
          Mary&rsquo;s Automotive · {today()}
        </span>
      </div>

      <div className="ticket__body">
        <fieldset>
          <legend>Customer</legend>
          <div className="field-grid field-grid--2">
            <div className="field">
              <label htmlFor={id('name')}>Name</label>
              <input id={id('name')} name="name" autoComplete="name" maxLength={120} required {...err('name')} />
              <ErrorText name="name" />
            </div>
            <div className="field">
              <label htmlFor={id('phone')}>Phone</label>
              <input id={id('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} required {...err('phone')} />
              <ErrorText name="phone" />
            </div>
            <div className="field">
              <label htmlFor={id('email')}>
                Email <span className="opt">(optional)</span>
              </label>
              <input id={id('email')} name="email" type="email" autoComplete="email" maxLength={254} {...err('email')} />
              <ErrorText name="email" />
            </div>
            <div className="field">
              <span className="label" id={id('pc-label')}>Best way to reach you</span>
              <div className="segmented" role="radiogroup" aria-labelledby={id('pc-label')}>
                {(['phone', 'text', 'email'] as const).map((m, i) => (
                  <label key={m}>
                    <input type="radio" name="preferredContact" value={m} defaultChecked={i === 0} />
                    {m === 'phone' ? 'Call' : m === 'text' ? 'Text' : 'Email'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Vehicle</legend>
          <div className="field-grid field-grid--4">
            <div className="field">
              <label htmlFor={id('vehicleYear')}>Year</label>
              <input id={id('vehicleYear')} name="vehicleYear" inputMode="numeric" maxLength={4} placeholder="2016" required {...err('vehicleYear')} />
              <ErrorText name="vehicleYear" />
            </div>
            <div className="field">
              <label htmlFor={id('vehicleMake')}>Make</label>
              <input id={id('vehicleMake')} name="vehicleMake" maxLength={60} placeholder="Honda" required {...err('vehicleMake')} />
              <ErrorText name="vehicleMake" />
            </div>
            <div className="field">
              <label htmlFor={id('vehicleModel')}>Model</label>
              <input id={id('vehicleModel')} name="vehicleModel" maxLength={60} placeholder="Accord" required {...err('vehicleModel')} />
              <ErrorText name="vehicleModel" />
            </div>
            <div className="field">
              <label htmlFor={id('mileage')}>
                Mileage <span className="opt">(optional)</span>
              </label>
              <input id={id('mileage')} name="mileage" inputMode="numeric" maxLength={9} {...err('mileage')} />
              <ErrorText name="mileage" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>The Problem</legend>
          <div className="field-grid">
            <div className="field">
              <label htmlFor={id('service')}>What do you need help with?</label>
              <select id={id('service')} name="service" defaultValue="" required {...err('service')}>
                <option value="" disabled>
                  Choose the closest match
                </option>
                {quoteServiceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ErrorText name="service" />
            </div>
            <div className="field">
              <label htmlFor={id('description')}>What&rsquo;s going on?</label>
              <textarea
                id={id('description')}
                name="description"
                maxLength={4000}
                required
                placeholder="Noises, warning lights, when it happens, anything you've noticed."
                {...err('description')}
              />
              <ErrorText name="description" />
            </div>
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor={id('company')}>Company</label>
            <input id={id('company')} name="company" tabIndex={-1} autoComplete="off" />
          </div>
        </fieldset>

        {state === 'error' && message ? (
          <p className="form-alert form-alert--error" role="alert">
            {message}
          </p>
        ) : null}

        <div className="ticket__foot">
          <p className="ticket__note" id={id('note')}>
            This sends a request to the shop. It is not a confirmed appointment or a final price. We only use your
            details to respond.
          </p>
          <button className="btn" type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send Request'} <ArrowIcon />
          </button>
        </div>
      </div>
    </form>
  );
}
