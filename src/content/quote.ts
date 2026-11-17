import { allServices } from './services';

export const quoteServiceOptions = [...allServices.map((s) => s.name), 'Not sure, need a diagnosis'] as const;
export const contactMethods = ['phone', 'text', 'email'] as const;
