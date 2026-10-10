'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import type { CmsSiteSnapshot } from '@/lib/cms/types';

const SiteContentContext = createContext<CmsSiteSnapshot | null>(null);
export function SiteContentProvider({ initialContent, children }: { initialContent: CmsSiteSnapshot; children: ReactNode }) {
  const [content, setContent] = useState(initialContent);
  const revision = useRef(initialContent.revision);
  const router = useRouter();
  useEffect(() => { revision.current = initialContent.revision; setContent(initialContent); }, [initialContent]);
  useEffect(() => {
    let closed = false; let timer: ReturnType<typeof setTimeout> | undefined;
    let running: AbortController | null = null; let followup = false;
    const refresh = async () => {
      if (closed || document.hidden || !navigator.onLine) return;
      if (running) { followup = true; return; }
      const controller = new AbortController(); running = controller;
      try {
        const response = await fetch('/api/content?revision=' + encodeURIComponent(revision.current), { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
        if (response.status === 204) return;
        if (!response.ok) return;
        const payload = await response.json();
        const next: CmsSiteSnapshot = payload.data;
        if (closed || controller.signal.aborted || !next?.documents?.site || typeof next.revision !== 'string') return;
        if (next.revision !== revision.current) {
          revision.current = next.revision; setContent(next);
          window.dispatchEvent(new Event('seedly:store-updated'));
          router.refresh();
        }
      } catch { /* Keep the last published snapshot during a transient outage. */ }
      finally {
        if (running === controller) running = null;
        if (!closed && followup) { followup = false; timer = setTimeout(() => void refresh(), 300); }
      }
    };
    const queue = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => void refresh(), 300); };
    const visibility = () => { if (!document.hidden) queue(); };
    const supabase = createClient();
    const channel = supabase.channel('store-content-invalidation')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_change_events' }, queue)
      .subscribe(status => { if (status === 'SUBSCRIBED') queue(); });
    const poll = setInterval(queue, 30000);
    window.addEventListener('online', queue); window.addEventListener('focus', queue);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      closed = true; if (timer) clearTimeout(timer); clearInterval(poll); running?.abort();
      window.removeEventListener('online', queue); window.removeEventListener('focus', queue);
      document.removeEventListener('visibilitychange', visibility); void supabase.removeChannel(channel);
    };
  }, [router]);
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
export function useSiteContent<T extends object>(slug: string): T {
  const snapshot = useContext(SiteContentContext);
  const document = snapshot?.documents[slug];
  if (!document) throw new Error('Published website content is temporarily unavailable.');
  return document.content as T;
}
