import React from 'react';
import Link from 'next/link';

interface SeedlyLogoProps {
  className?: string;
  iconOnly?: boolean;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SeedlyLogo({
  className = '',
  iconOnly = false,
  textColor = 'text-seedly-dark',
  size = 'md',
}: SeedlyLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-90 ${className}`}
    >
      {iconOnly ? (
        <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-seed-lime fill-current"
          >
            <path
              d="M50 38C44 26 34 26 30 32C25 40 33 50 50 64C67 50 75 40 70 32C66 26 56 26 50 38Z"
              stroke="#14201A"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M50 48C45 35 32 30 24 33C21 44 28 55 48 57C48 57 49 53 50 48Z"
              fill="currentColor"
            />
            <path
              d="M50 48C55 35 68 30 76 33C79 44 72 55 52 57C52 57 51 53 50 48Z"
              fill="currentColor"
            />
            <path
              d="M50 55C45 55 42 63 50 73C58 63 55 55 50 55Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ) : (
        <span
          className={`font-heading font-extrabold tracking-[-0.04em] lowercase inline-flex items-baseline gap-1 select-none ${textColor} ${textSizes[size]}`}
        >
          <span>seedly</span>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-kit-coral fill-current inline-block transform translate-y-[-1px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
      )}
    </Link>
  );
}
