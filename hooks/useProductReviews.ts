'use client';
import { useEffect, useState } from 'react';
import type { Review } from '@/lib/types';

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setReviews([]);
    void (async () => {
      try {
        const response = await fetch('/api/reviews?productId=' + encodeURIComponent(productId), { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.data)) throw new Error();
        if (!controller.signal.aborted) setReviews(result.data);
      } catch {
        if (!controller.signal.aborted) setError('Reviews could not load. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [productId, revision]);
  return { reviews, loading, error, retry: () => setRevision(value => value + 1) };
}
