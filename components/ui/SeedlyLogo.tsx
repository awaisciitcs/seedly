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
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
    >
      {/* Botanical Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-seedly-primary fill-current"
        >
          {/* Top Heart Arc */}
          <path
            d="M50 38C44 26 34 26 30 32C25 40 33 50 50 64C67 50 75 40 70 32C66 26 56 26 50 38Z"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Leaf */}
          <path
            d="M50 48C45 35 32 30 24 33C21 44 28 55 48 57C48 57 49 53 50 48Z"
            fill="currentColor"
          />
          {/* Right Leaf */}
          <path
            d="M50 48C55 35 68 30 76 33C79 44 72 55 52 57C52 57 51 53 50 48Z"
            fill="currentColor"
          />
          {/* Bottom Seed Drop */}
          <path
            d="M50 55C45 55 42 63 50 73C58 63 55 55 50 55Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          className={`font-sans tracking-tight font-medium lowercase ${textColor} ${textSizes[size]}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          seedly
        </span>
      )}
    </Link>
  );
}
