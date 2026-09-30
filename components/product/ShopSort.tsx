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
    <div className="flex min-w-0 shrink-0 items-center gap-3 text-sm" aria-busy={pending}>
      <label htmlFor="shop-sort" className="shrink-0 text-muted-gray">Sort by</label>
      <div className="relative min-w-0 flex-1 sm:flex-none">
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
          className="min-h-11 w-full appearance-none rounded-full border border-border-gray bg-white py-2.5 pl-4 pr-10 text-charcoal transition-colors hover:border-seedly-primary focus:border-seedly-dark disabled:cursor-wait disabled:opacity-60"
        >
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-gray" aria-hidden="true" />
      </div>
      <span className="sr-only" role="status">{pending ? 'Updating product order' : ''}</span>
    </div>
  );
}
