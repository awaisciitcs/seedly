'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import type { ProductSearchResponse } from '../../lib/product-search';
import { formatPKR } from '../../lib/utils';

interface ProductSearchProps {
  onClose: () => void;
}

export function ProductSearch({ onClose }: ProductSearchProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const latestTerm = useRef('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<ProductSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const term = query.trim();
  const resultsHref = term ? '/shop?search=' + encodeURIComponent(term) : '/shop';

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const isCurrent = () => !controller.signal.aborted && latestTerm.current === term;
    setIsSearching(true);
    setError(false);

    // A short debounce keeps typing responsive without requesting every keystroke.
    const timeout = setTimeout(async () => {
      try {
        const result = await fetch('/api/search?q=' + encodeURIComponent(term), { signal: controller.signal });
        if (!result.ok) throw new Error('Search unavailable');
        const data: ProductSearchResponse = await result.json();
        if (isCurrent()) {
          setResponse(data);
          setLoading(false);
        }
      } catch {
        if (isCurrent()) setError(true);
      } finally {
        if (isCurrent()) {
          setIsSearching(false);
          setLoading(false);
        }
      }
    }, term ? 150 : 0);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [term, retry]);

  const items = response?.items || [];
  const total = response?.total || 0;
  const showResultsLink = Boolean(term) && total > 0 && !loading && !error;

  const changeQuery = (value: string) => {
    latestTerm.current = value.trim();
    setQuery(value);
    if (value.trim() !== term) {
      setIsSearching(true);
      setError(false);
    }
  };

  const viewResults = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(resultsHref);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      id="catalog-search"
      aria-labelledby="catalog-search-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="motion-search fixed inset-x-0 bottom-auto top-4 m-0 mx-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-[28px] border-2 border-ink bg-paper p-0 text-ink shadow-brutal-xl backdrop:bg-ink/50 backdrop:backdrop-blur-xs sm:top-[10vh] sm:max-h-[80dvh]"
    >
      <div className="flex max-h-[calc(100dvh_-_2rem_-_4px)] flex-col sm:max-h-[calc(80dvh_-_4px)]">
        <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="catalog-search-title" className="font-heading font-extrabold text-lg text-ink">Search Seedly Pantry</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="btn-brutal h-9 w-9 bg-white text-ink hover:bg-seed-lime"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <form role="search" onSubmit={viewResults}>
            <label htmlFor="catalog-search-input" className="sr-only">Search products</label>
            <div className="flex items-center gap-3 rounded-full border-2 border-ink bg-white px-5 shadow-brutal-sm transition-colors focus-within:ring-2 focus-within:ring-seed-lime">
              <Search className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
              <input
                ref={inputRef}
                id="catalog-search-input"
                name="search"
                type="search"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || !items.length) return;
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    resultRefs.current[event.key === 'ArrowDown' ? 0 : items.length - 1]?.focus();
                  }
                }}
                placeholder="Search seeds, kits and teas"
                autoComplete="off"
                spellCheck={false}
                maxLength={100}
                aria-controls="catalog-search-results"
                aria-describedby="catalog-search-hint"
                className="h-14 min-w-0 flex-1 appearance-none bg-transparent text-base text-charcoal outline-none placeholder:text-muted-gray [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    changeQuery('');
                    inputRef.current?.focus();
                  }}
                  className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-gray transition-colors hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-seedly-dark"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
          <p id="catalog-search-hint" className="sr-only">Results update as you type. Use the arrow keys to browse products, Enter to open, and Escape to close.</p>
          <div className="flex min-h-12 items-center justify-between gap-3 text-xs text-muted-gray">
            <p role="status" aria-live="polite" aria-atomic="true" className="break-words [overflow-wrap:anywhere]">
              {isSearching ? 'Searching...' : error ? 'Unable to load products' : term ? total + (total === 1 ? ' result' : ' results') + ' for \u201c' + term + '\u201d' : 'Explore the range'}
            </p>
            {isSearching && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-seedly-primary motion-reduce:animate-none" aria-hidden="true" />}
          </div>
        </div>

        <div id="catalog-search-results" aria-busy={isSearching} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 sm:px-3">
          {loading && !response ? (
            <div className="space-y-1 px-2" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-4 rounded-xl py-3 motion-safe:animate-pulse">
                  <div className="h-[72px] w-[72px] shrink-0 rounded-lg bg-cream" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-24 rounded bg-cream" />
                    <div className="h-4 w-3/4 rounded bg-cream" />
                    <div className="h-3 w-20 rounded bg-cream" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && !response ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-gray">We couldn&apos;t load products. Please try again.</p>
              <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-4 min-h-11 rounded-full border border-border-gray px-5 text-sm font-medium transition-colors hover:bg-cream">Try again</button>
            </div>
          ) : items.length ? (
            <ul aria-label={term ? 'Matching products' : 'Products to explore'} className={isSearching ? 'opacity-80 transition-opacity duration-150' : 'opacity-100 transition-opacity duration-150'}>
              {items.map((item, index) => (
                <li key={item.id} className="motion-result" style={{ animationDelay: Math.min(index * 25, 100) + 'ms' }}>
                  <Link
                    ref={(element) => { resultRefs.current[index] = element; }}
                    href={item.href}
                    onClick={onClose}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                      event.preventDefault();
                      const next = index + (event.key === 'ArrowDown' ? 1 : -1);
                      if (next < 0 || next >= items.length) inputRef.current?.focus();
                      else resultRefs.current[next]?.focus();
                    }}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-seedly-dark sm:gap-4 sm:p-3"
                  >
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-cream sm:h-20 sm:w-20">
                      <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs text-muted-gray">{item.category}{item.size && <> &middot; {item.size}</>}</p>
                      <p className="text-sm font-medium leading-snug text-seedly-dark sm:text-base">{item.name}</p>
                      <p className="mt-1.5 text-sm tabular-nums text-charcoal">{formatPKR(item.priceMinor)}</p>
                    </div>
                    <ArrowRight className="mr-1 hidden h-4 w-4 shrink-0 text-seedly-primary transition-transform motion-safe:group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="font-medium text-seedly-dark">No products found</p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-gray">Try a product or ingredient, like pumpkin, flax or chamomile.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {['Pumpkin', 'Flax', 'Chamomile'].map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => { changeQuery(suggestion); inputRef.current?.focus(); }} className="min-h-11 rounded-full border border-border-gray px-4 text-sm transition-colors hover:border-seedly-primary hover:bg-cream">{suggestion}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border-gray bg-cream/60 px-5 py-2 sm:px-6">
          <Link href={showResultsLink ? resultsHref : '/shop'} onClick={onClose} className="flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-seedly-dark transition-colors hover:text-seedly-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-seedly-dark">
            <span>{showResultsLink ? 'View all ' + total + (total === 1 ? ' result' : ' results') : 'Browse all products'}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </dialog>
  );
}