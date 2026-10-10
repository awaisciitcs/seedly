'use client';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
export function TrackingForm({ onNavigate }: { onNavigate?: () => void }) {
  const { config: siteConfig } = useSiteContent<{ config: { url: string } }>('site');
  const id = useId(); const router = useRouter(); const [ref, setRef] = useState(''); const [error, setError] = useState('');
  const track = (event: React.FormEvent) => {
    event.preventDefault();
    let value = ref.trim().replace(/^#/, ''); let token = '';
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        if (![window.location.hostname, new URL(siteConfig.url).hostname].includes(url.hostname)) throw new Error();
        const match = url.pathname.match(/^\/order\/([^/]+)\/?$/);
        if (!match) throw new Error();
        value = decodeURIComponent(match[1]); token = url.searchParams.get('token') || '';
        if (token && !/^[a-f0-9]{64}$/i.test(token)) throw new Error();
      } catch { setError('Paste the complete Seedly confirmation link or your order reference.'); return; }
    }
    value = value.toUpperCase();
    if (!/^SED-[A-Z0-9-]{4,80}$/.test(value)) { setError('Enter the Seedly order reference or confirmation link.'); return; }
    router.push('/order/' + encodeURIComponent(value) + (token ? '?token=' + encodeURIComponent(token) : '')); onNavigate?.();
  };
  return <form className="space-y-4" onSubmit={track}>
    <div><label htmlFor={id} className="field-label">Order reference or confirmation link</label><input data-autofocus id={id} className="form-input" value={ref} onChange={event => { setRef(event.target.value); setError(''); }} maxLength={2048} autoComplete="off" placeholder="SED-100200 or your confirmation link" required aria-invalid={!!error} aria-describedby={id + '-hint'} /><p id={id + '-hint'} className="mt-2 text-sm text-muted-gray">Use the full link from checkout or your confirmation email to view private order details.</p></div>
    {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}<button className="button-primary w-full" type="submit">View order</button>
  </form>;
}
