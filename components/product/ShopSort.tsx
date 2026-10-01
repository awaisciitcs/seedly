'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface ShopSortProps {
  value: string;
  category: string;
  search: string;
  options: { label: string; value: string }[];
}

export function ShopSort({ value, category, search, options }: ShopSortProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [pending, startTransition] = useTransition();

  useEffect(() => setSelected(value), [value]);

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
          className="appearance-none rounded-full border-2 border-ink bg-white py-2 pl-4 pr-9 text-xs font-black uppercase tracking-wider text-ink shadow-brutal-sm hover:bg-paper focus:outline-none focus:ring-2 focus:ring-seed-lime cursor-pointer disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink" aria-hidden="true" />
      </div>
      <span className="sr-only" role="status">{pending ? 'Updating product order' : ''}</span>
    </div>
  );
}

export default ShopSort;
