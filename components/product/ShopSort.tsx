'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface ShopSortProps {
  value: string;
  category: string;
  search: string;
  options: { label: string; value: string }[];
  variant?: 'brutal' | 'editorial';
}

export function ShopSort({ value, category, search, options, variant = 'brutal' }: ShopSortProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [pending, startTransition] = useTransition();

  useEffect(() => setSelected(value), [value]);

  if (variant === 'editorial') {
    return (
      <div className="flex items-center gap-1.5 text-xs" aria-busy={pending}>
        <label htmlFor="shop-sort" className="sr-only">Sort by</label>
        <div className="relative">
          <select
            id="shop-sort"
            name="sort"
            value={selected}
            disabled={pending}
            onChange={(event) => {
              const sort = event.currentTarget.value;
              setSelected(sort);
              const params = new URLSearchParams({ category, sort });
              if (search) params.set('search', search);
              startTransition(() => router.replace(`/shop?${params.toString()}`, { scroll: false }));
            }}
            className="appearance-none bg-transparent py-1.5 pl-2 pr-7 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-black focus:outline-none cursor-pointer disabled:opacity-60 transition-colors"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                SORT: {option.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" aria-hidden="true" />
        </div>
        <span className="sr-only" role="status">{pending ? 'Updating product order' : ''}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs" aria-busy={pending}>
      <label htmlFor="shop-sort" className="sr-only">Sort by</label>
      <div className="relative">
        <select
          id="shop-sort"
          name="sort"
          value={selected}
          disabled={pending}
          onChange={(event) => {
            const sort = event.currentTarget.value;
            setSelected(sort);
            const params = new URLSearchParams({ category, sort });
            if (search) params.set('search', search);
            startTransition(() => router.replace(`/shop?${params.toString()}`, { scroll: false }));
          }}
          className="appearance-none rounded-full border border-gray-200/90 bg-white py-2 pl-4 pr-9 text-xs font-semibold uppercase tracking-wider text-neutral-900 shadow-xs hover:bg-neutral-50 focus:outline-none cursor-pointer disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" aria-hidden="true" />
      </div>
      <span className="sr-only" role="status">{pending ? 'Updating product order' : ''}</span>
    </div>
  );
}

export default ShopSort;
