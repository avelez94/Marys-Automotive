/**
 * Temporary stock photography, licensed under the Unsplash License (free commercial use, no
 * attribution required). These are NOT photos of Mary's Automotive and are labeled on the page.
 * Replace with real shop photography as it becomes available.
 */
export type StockPhoto = {
  kind: 'stock' | 'shop';
  src: string;
  alt: string;
  /** Source page, kept for license records. */
  credit?: string;
};

export const photos = {
  heroHands: {
    kind: 'stock',
    src: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e',
    alt: 'Close view of a mechanic’s hands working a wrench under the hood of an older car',
    credit: 'https://unsplash.com/photos/Fd6osyVbtG4 (Christian Buehner)',
  },
  underHood: {
    kind: 'stock',
    src: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f',
    alt: 'Technician leaning over an open engine bay inspecting components',
    credit: 'https://unsplash.com/photos/bEGTsOCnHro',
  },
  tire: {
    kind: 'stock',
    src: 'https://images.unsplash.com/photo-1645445522156-9ac06bc7a767',
    alt: 'Gloved hands checking a tire on a raised car',
    credit: 'https://unsplash.com/photos/9uHal2Dd9aE',
  },
} satisfies Record<string, StockPhoto>;
