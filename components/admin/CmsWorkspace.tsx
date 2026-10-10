'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileText, Globe, Loader2, Plus, RefreshCw, Search, Settings2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import type { CmsAdminDocument, CmsDocumentSummary } from '@/lib/cms/types';
import { CmsApiError, requestCms } from './CmsRequest';

function dateLabel(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Not yet updated' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
export function CmsWorkspace() {
  const router = useRouter();
  const [documents, setDocuments] = useState<CmsDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [creating, setCreating] = useState(false);
  const [template, setTemplate] = useState<CmsAdminDocument | null>(null);
  const [templateError, setTemplateError] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const loadController = useRef<AbortController | null>(null);
  const templateController = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController(); loadController.current = controller;
    setLoading(true); setError(''); setAuthError(false);
    try { const rows = await requestCms<CmsDocumentSummary[]>('/api/admin/content', {}, controller.signal); if (!controller.signal.aborted) setDocuments(rows); }
    catch (cause) { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Content could not be loaded.'); setAuthError(cause instanceof CmsApiError && cause.status === 401); } }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { void load(); return () => loadController.current?.abort(); }, [load]);
  const loadTemplate = useCallback(async () => {
    templateController.current?.abort();
    const controller = new AbortController(); templateController.current = controller;
    setTemplateLoading(true); setTemplateError('');
    try { const result = await requestCms<CmsAdminDocument>('/api/admin/content/page-template', {}, controller.signal); if (!controller.signal.aborted) setTemplate(result); }
    catch (cause) { if (!controller.signal.aborted) setTemplateError(cause instanceof Error ? cause.message : 'The page template could not be loaded.'); }
    finally { if (!controller.signal.aborted) setTemplateLoading(false); }
  }, []);
  useEffect(() => { if (creating && !template) void loadTemplate(); return () => templateController.current?.abort(); }, [creating, template, loadTemplate]);
  async function createPage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving || !template) return;
    setSaving(true); setCreateError('');
    try {
      const content = structuredClone(template.content);
      if (typeof content.title === 'string') content.title = title.trim();
      if (content.seo && typeof content.seo === 'object' && !Array.isArray(content.seo)) content.seo = { ...content.seo, title: title.trim() };
      const result = await requestCms<CmsAdminDocument>('/api/admin/content', { method: 'POST', body: JSON.stringify({ slug: slug.trim(), title: title.trim(), kind: 'page', content }) });
      router.push('/admin/content/' + encodeURIComponent(result.slug)); router.refresh();
    } catch (cause) { setCreateError(cause instanceof Error ? cause.message : 'The page could not be created.'); setSaving(false); }
  }
  const visible = documents.filter(document => document.slug !== 'page-template' && (kind === 'all' || document.kind === kind) && (!query.trim() || (document.title + ' ' + document.slug).toLowerCase().includes(query.trim().toLowerCase())));
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Website content</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-botanical-sage">Manage pages, images, navigation, search visibility, and the routine finder. Save drafts, then publish approved changes to the storefront.</p></div>
      <button type="button" onClick={() => { setTitle(''); setSlug(''); setCreateError(''); setCreating(true); }} className="btn-lime-3d inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"><Plus size={17} /> New page</button>
    </div>
    <div className="glass-panel-3d space-y-4 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-botanical-sage" /><input type="search" aria-label="Search website content" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a page or setting" className="glass-input-3d min-h-11 w-full rounded-xl py-2.5 pl-10 pr-3 text-sm" /></div>
        <select aria-label="Filter content type" value={kind} onChange={event => setKind(event.target.value)} className="glass-input-3d min-h-11 rounded-xl px-3 text-sm"><option value="all">All content</option><option value="page">Pages</option><option value="global">Brand & navigation</option><option value="config">Configuration</option></select>
        <button type="button" onClick={() => void load()} disabled={loading} aria-label="Refresh website content" className="glass-btn-3d inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl disabled:opacity-50"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
      </div>
      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-950/50 p-4 text-sm text-rose-200"><AlertCircle size={18} className="shrink-0" /><div><p>{error}</p>{authError ? <Link href="/admin/login?redirectTo=%2Fadmin%2Fcontent" className="mt-2 inline-block underline">Sign in again</Link> : <button type="button" onClick={() => void load()} className="mt-2 underline">Try again</button>}</div></div>}
      {loading && <div role="status" className="flex items-center justify-center gap-2 py-14 text-sm text-botanical-sage"><Loader2 size={18} className="animate-spin" /> Loading website content?</div>}
      {!loading && !error && !visible.length && <div className="rounded-xl border border-dashed border-white/15 px-5 py-14 text-center"><FileText size={30} className="mx-auto text-botanical-sage" /><p className="mt-3 text-sm font-semibold text-white">{documents.length ? 'No matching content' : 'No content has been configured'}</p><p className="mt-2 text-sm text-botanical-sage">{documents.length ? 'Try another search or content type.' : 'Create a page or ask your owner to complete the content migration.'}</p></div>}
      {!loading && visible.length > 0 && <div className="grid gap-3 md:grid-cols-2">{visible.map(document => {
        const Icon = document.kind === 'global' ? Globe : document.kind === 'config' ? Settings2 : FileText;
        const published = document.published_version !== null;
        const draft = published && document.published_version !== document.version;
        return <Link key={document.slug} href={'/admin/content/' + encodeURIComponent(document.slug)} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/30 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime">
          <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lime"><Icon size={19} /></span><div className="min-w-0 flex-1"><h2 className="break-words text-base font-semibold text-white">{document.title}</h2><p className="mt-1 break-all text-xs text-botanical-sage">{document.slug}</p></div></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs"><span className={'rounded-full px-2.5 py-1 ' + (draft ? 'bg-amber-400/10 text-amber-200' : published ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/10 text-white/70')}>{draft ? 'Unpublished changes' : published ? 'Published' : 'Draft'}</span><span className="text-botanical-sage">{dateLabel(document.updated_at)} ? v{document.version}</span></div>
        </Link>;
      })}</div>}
    </div>
    <div className="rounded-xl border border-white/10 p-4 text-sm leading-relaxed text-botanical-sage">Products, kit recipes, stock, reviews, and delivery or payment settings remain in their dedicated dashboard areas. Content changes become public only when an owner publishes them.</div>
    <Dialog open={creating} onClose={() => { if (!saving) setCreating(false); }} title="Create a website page" className="!max-w-xl !bg-transparent">
      <div className="glass rounded-2xl border border-white/20 p-5 text-white sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">Create a page</h2><button type="button" disabled={saving} aria-label="Close create page" onClick={() => setCreating(false)} className="glass-btn-3d flex min-h-11 min-w-11 items-center justify-center rounded-xl"><X size={19} /></button></div>
        <p className="mb-5 text-sm leading-relaxed text-botanical-sage">New pages start as drafts. Edit their sections, add a navigation link where needed, and publish when ready.</p>
        {templateLoading && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-botanical-sage"><Loader2 size={17} className="animate-spin" /> Loading page template?</p>}
        {templateError && <div role="alert" className="mb-4 rounded-xl bg-rose-950/50 p-3 text-sm text-rose-200">{templateError}<button type="button" onClick={() => void loadTemplate()} className="ml-2 underline">Retry</button></div>}
        {createError && <p role="alert" className="mb-4 rounded-xl bg-rose-950/50 p-3 text-sm text-rose-200">{createError}</p>}
        <form onSubmit={createPage} className="space-y-4">
          <div><label htmlFor="cms-new-title" className="mb-2 block text-xs font-semibold">Page name *</label><input id="cms-new-title" data-autofocus value={title} onChange={event => { setTitle(event.target.value); setCreateError(''); }} required maxLength={200} disabled={saving} placeholder="For example, Our sourcing" className="glass-input-3d min-h-11 w-full rounded-xl px-3 text-sm" /></div>
          <div><label htmlFor="cms-new-slug" className="mb-2 block text-xs font-semibold">URL name *</label><input id="cms-new-slug" value={slug} onChange={event => { setSlug(event.target.value); setCreateError(''); }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} disabled={saving} placeholder="our-sourcing" spellCheck={false} autoCapitalize="none" className="glass-input-3d min-h-11 w-full rounded-xl px-3 font-mono text-sm" /><p className="mt-1.5 break-all text-xs text-botanical-sage">/pages/{slug || 'your-page-name'} ? lowercase letters, numbers, and hyphens</p></div>
          <div className="flex justify-end gap-2 pt-3"><button type="button" onClick={() => setCreating(false)} disabled={saving} className="glass-btn-3d min-h-11 rounded-xl px-4 text-sm">Cancel</button><button type="submit" disabled={!template || templateLoading || saving} className="btn-lime-3d inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-40">{saving && <Loader2 size={16} className="animate-spin" />}{saving ? 'Creating?' : 'Create draft'}</button></div>
        </form>
      </div>
    </Dialog>
  </div>;
}
