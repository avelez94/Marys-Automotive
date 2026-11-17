'use client';

import Image from 'next/image';
import { CameraIcon } from './Icons';
import type { StockPhoto } from '@/content/photos';

const unsplashLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 70}`;

/**
 * Stock photography is always labeled so it is never mistaken for the shop itself.
 * Swap in real shop photos by adding entries with kind: 'shop' in content/photos.ts.
 */
export function Photo({
  photo,
  sizes,
  priority = false,
  className = '',
}: {
  photo: StockPhoto;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`photo ${className}`}>
      <Image
        loader={photo.kind === 'stock' ? unsplashLoader : undefined}
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={70}
      />
      {photo.kind === 'stock' ? <span className="photo__tag">Stock photo</span> : null}
    </div>
  );
}

/** Placeholder for a real photograph the shop still needs to supply. */
export function PhotoSlot({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`photo-slot ${className}`} role="img" aria-label={`Photo coming soon: ${label}`}>
      <CameraIcon />
      <strong>{label}</strong>
      <span>Real shop photo coming soon</span>
    </div>
  );
}
