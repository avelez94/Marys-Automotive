export type Faq = { q: string; a: string; pending?: boolean };

export const faqs: Faq[] = [
  {
    q: 'Do you work on foreign cars?',
    a: 'Yes. We work on domestic and foreign vehicles. If you want to check on something specific, call with the year, make and model.',
  },
  {
    q: 'Will I see an estimate before any work starts?',
    a: 'Yes. We go over what we found and what it will cost, and nothing gets repaired until you approve it.',
    pending: true,
  },
  {
    q: 'My check engine light is on. What should I do?',
    a: 'Get it checked soon. A steady light means the car has stored a fault code that should be looked at. A flashing light usually points to a misfire that can damage the catalytic converter, so drive as little as possible and give us a call.',
  },
  {
    q: 'How do I get a quote?',
    a: 'Call, text or send a request through the form. We will get back to you to talk about the problem and set a time to look at the vehicle. A form request is not a confirmed appointment, and most repairs need an inspection before we can give an accurate price.',
  },
  {
    q: 'What are your hours?',
    a: 'Please call the shop for current hours before you come in.',
    pending: true,
  },
];
