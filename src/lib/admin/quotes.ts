export const STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'closed'] as const;
export type QuoteStatus = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<QuoteStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  completed: 'Completed',
  closed: 'Closed',
};
export const isStatus = (v: unknown): v is QuoteStatus => typeof v === 'string' && (STATUSES as readonly string[]).includes(v);

export type QuoteRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: QuoteStatus;
  name: string;
  phone: string;
  email: string | null;
  preferred_contact: 'phone' | 'text' | 'email';
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  mileage: number | null;
  service: string | null;
  description: string;
  source_page: string | null;
};

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Indiana/Indianapolis',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const telFor = (phone: string) => `tel:+1${phone.replace(/\D/g, '').slice(-10)}`;
export const smsFor = (phone: string) => `sms:+1${phone.replace(/\D/g, '').slice(-10)}`;
