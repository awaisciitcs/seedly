'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Check, Download, ExternalLink, History, Loader2, RefreshCw, Save, Send, X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import type { CmsAdminDocument, CmsRevisionSummary } from '@/lib/cms/types';
import { CmsFields } from './CmsFields';
import { CmsApiError, cmsPublicPath, requestCms } from './CmsRequest';

function time(value: string | null): string { if (!value) return 'Never'; const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
type Action = 'save' | 'publish' | 'unpublish' | 'restore';
export function CmsEditor({ slug, isOwner }: { slug: string; isOwner: boolean }) {
  const router = useRouter();
  const [documentData, setDocumentData] = useState<CmsAdminDocument | null>(null);
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [title, setTitle] = useState('');
  const [section, setSection] = useState(0);
  const [fieldSearch, setFieldSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoring, setRestoring] = useState<CmsRevisionSummary | null>(null);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [reloadOpen, setReloadOpen] = useState(false);
  const [leaveHref, setLeaveHref] = useState<string | null>(null);
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(() => new Set());
  const uploadingRef = useRef(new Set<string>());
  const onUploadingChange = useCallback((id: string, uploading: boolean) => { const next = new Set(uploadingRef.current); if (uploading) next.add(id); else next.delete(id); uploadingRef.current = next; setUploadingFields(next); }, []);
  const isUploading = uploadingFields.size > 0;
  const loadController = useRef<AbortController | null>(null);
  const allowLeave = useRef(false);
  const dirty = documentData !== null && (title !== documentData.title || JSON.stringify(content) !== JSON.stringify(documentData.content));
  const conflict = errorStatus === 409;
  const acceptDocument = useCallback((next: CmsAdminDocument) => { setDocumentData(next); setContent(next.content); setTitle(next.title); setError(''); setErrorStatus(null); }, []);
  const load = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController(); loadController.current = controller;
    setLoading(true); setError(''); setErrorStatus(null);
    setDocumentData(null); setContent({}); setTitle(''); setSection(0); setMessage(''); allowLeave.current = false;
    try { const next = await requestCms<CmsAdminDocument>('/api/admin/content/' + encodeURIComponent(slug), {}, controller.signal); if (!controller.signal.aborted) acceptDocument(next); }
    catch (cause) { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'This content could not be loaded.'); setErrorStatus(cause instanceof CmsApiError ? cause.status : 503); } }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, [acceptDocument, slug]);
  useEffect(() => { void load(); return () => loadController.current?.abort(); }, [load]);
  useEffect(() => {
    if (!dirty && !busy && !isUploading) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (!allowLeave.current) { event.preventDefault(); event.returnValue = ''; } };
    const interceptLink = (event: MouseEvent) => {
      if (allowLeave.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      event.preventDefault();
      if (!busy) setLeaveHref(destination.pathname + destination.search + destination.hash);
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', interceptLink, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', interceptLink, true); };
  }, [dirty, busy, isUploading]);
  async function update(action: Action, revision?: CmsRevisionSummary) {
    if (!documentData || busy || conflict || uploadingRef.current.size > 0) return;
    setBusy(action); setError(''); setErrorStatus(null); setMessage('');
    try {
      const next = await requestCms<CmsAdminDocument>('/api/admin/content/' + encodeURIComponent(slug), { method: 'PATCH', body: JSON.stringify({
        action, expected_version: documentData.version,
        ...(action === 'save' || action === 'publish' ? { title: title.trim(), content } : {}),
        ...(revision ? { revision_id: revision.id } : {}),
      }) });
      acceptDocument(next);
      setMessage(action === 'publish' ? 'Published. The storefront now uses this version.' : action === 'unpublish' ? 'Page unpublished. Its content and history are preserved.' : action === 'restore' ? 'Revision restored as a new draft. Review it before publishing.' : 'Draft saved. The published website stays on its current version.');
      setRestoring(null); setUnpublishOpen(false); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Content could not be updated.');
      setErrorStatus(cause instanceof CmsApiError ? cause.status : 503);
      setRestoring(null); setUnpublishOpen(false);
    } finally { setBusy(null); }
  }
  function exportDraft() {
    const blob = new Blob([JSON.stringify({ slug, title, content, based_on_version: documentData?.version }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'seedly-' + slug + '-draft.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function edit(next: Record<string, unknown>) { setContent(next); setMessage(''); if (!conflict) { setError(''); setErrorStatus(null); } }
  const fields = documentData?.definition.fields || [];
  const currentField = fields[Math.min(section, Math.max(fields.length - 1, 0))];
  const exposedFields = currentField?.fields?.filter(field => !(slug === 'about' && currentField.key === 'images' && field.key === 'hero'));
  const searchable = currentField?.type === 'object' && (exposedFields?.length || 0) > 8;
  const childValue = currentField && content[currentField.key] && typeof content[currentField.key] === 'object' ? content[currentField.key] as Record<string, unknown> : {};
  const query = fieldSearch.trim().toLowerCase();
  const visibleFields = searchable && query ? exposedFields?.filter(field => (field.label + ' ' + field.key + ' ' + JSON.stringify(childValue[field.key] ?? '')).toLowerCase().includes(query)) : exposedFields;
  const displayedField = currentField?.type === 'object' ? { ...currentField, fields: visibleFields || [] } : currentField;
  const publicPath = cmsPublicPath(slug);
  const canUnpublish = documentData?.kind === 'page' && publicPath.startsWith('/pages/') && documentData.published_version !== null;
  if (loading) return <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-botanical-sage"><Loader2 size={18} className="animate-spin" /> Loading content editor...</div>;
  if (!documentData) return <div className="mx-auto max-w-3xl space-y-5"><Link href="/admin/content" className="inline-flex min-h-11 items-center gap-2 text-sm text-botanical-sage"><ArrowLeft size={16} /> All content</Link><div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-950/50 p-5 text-sm text-rose-200">{error || 'This document could not be found.'}<div className="mt-4">{errorStatus === 401 ? <Link href={'/admin/login?redirectTo=' + encodeURIComponent('/admin/content/' + slug)} className="underline">Sign in again</Link> : <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center gap-2 underline"><RefreshCw size={16} /> Try again</button>}</div></div></div>;
  return <div className="mx-auto max-w-6xl space-y-5">
    <Link href="/admin/content" className="inline-flex min-h-11 items-center gap-2 text-sm text-botanical-sage hover:text-white"><ArrowLeft size={16} /> All content</Link>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="min-w-0"><h1 className="break-words text-3xl font-bold tracking-tight text-white">{documentData.title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-botanical-sage">{documentData.definition.description}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className={'rounded-full px-3 py-1 ' + (dirty || documentData.version !== documentData.published_version ? 'bg-amber-400/10 text-amber-200' : 'bg-emerald-400/10 text-emerald-200')}>{dirty ? 'Unsaved changes' : documentData.published_version === null ? 'Draft only' : documentData.version !== documentData.published_version ? 'Unpublished changes' : 'Published'}</span><span className="text-botanical-sage">Draft v{documentData.version}{documentData.published_version !== null ? ' | Published v' + documentData.published_version : ''}</span></div></div>
      <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => setHistoryOpen(true)} className="glass-btn-3d inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold"><History size={16} /> History</button><Link href={documentData.kind === 'page' ? publicPath : '/'} target="_blank" rel="noopener noreferrer" className="glass-btn-3d inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold"><ExternalLink size={16} /> View live site</Link></div>
    </div>
    {message && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-400/10 p-4 text-sm text-emerald-200"><Check size={17} className="shrink-0" />{message}</div>}
    {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/50 p-4 text-sm text-rose-200"><div className="flex items-start gap-2"><AlertCircle size={17} className="shrink-0" /><p>{error}</p></div>{conflict && <div className="mt-3 space-y-3"><p>Your edits are still here. Download them before loading the latest version, then apply the changes again.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={exportDraft} className="glass-btn-3d inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs"><Download size={15} /> Download my draft</button><button type="button" onClick={() => setReloadOpen(true)} className="glass-btn-3d min-h-11 rounded-xl px-3 text-xs">Load latest version</button></div></div>}{errorStatus === 401 && <Link href={'/admin/login?redirectTo=' + encodeURIComponent('/admin/content/' + slug)} className="mt-3 inline-block underline">Sign in again</Link>}</div>}
    <form onSubmit={event => { event.preventDefault(); const submitter = (event.nativeEvent as SubmitEvent).submitter; void update(submitter?.getAttribute('data-cms-action') === 'publish' ? 'publish' : 'save'); }} className="space-y-5">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-3"><nav aria-label="Content sections" className="glass-panel-3d flex flex-wrap gap-1 rounded-2xl p-2 lg:flex-col">{fields.map((field, index) => <button key={field.key} type="button" disabled={!!busy || isUploading} aria-pressed={section === index} onClick={() => { setSection(index); setFieldSearch(''); }} className={'min-h-11 rounded-xl px-3 py-2 text-left text-sm transition-colors ' + (section === index ? 'bg-white/10 font-semibold text-lime' : 'text-botanical-sage hover:bg-white/5 hover:text-white')}>{field.label}</button>)}</nav><p className="px-2 text-xs leading-relaxed text-botanical-sage">Sections with a visibility switch can be hidden. Reorder lists using their arrow controls.</p></aside>
        <div className="glass-panel-3d min-w-0 space-y-5 rounded-2xl p-4 sm:p-6">
          <fieldset disabled={!!busy} className={'min-w-0 space-y-5 ' + (busy ? 'pointer-events-none opacity-60' : '')}>
            <div><label htmlFor="cms-document-title" className="mb-2 block text-xs font-semibold text-white/90">Dashboard name *</label><input id="cms-document-title" required maxLength={200} value={title} onChange={event => { setTitle(event.target.value); setMessage(''); if (!conflict) { setError(''); setErrorStatus(null); } }} className="glass-input-3d min-h-11 w-full rounded-xl px-3 text-sm text-white" /><p className="mt-1.5 text-xs text-botanical-sage">This name identifies the document in the dashboard. Edit the page heading and SEO title in their sections.</p></div>
            {searchable && <div><label htmlFor="cms-field-search" className="mb-2 block text-xs font-semibold text-white/90">Find a field in this section</label><input id="cms-field-search" type="search" value={fieldSearch} onChange={event => setFieldSearch(event.target.value)} placeholder="Search field labels or current text" className="glass-input-3d min-h-11 w-full rounded-xl px-3 text-sm" /><p className="mt-1.5 text-xs text-botanical-sage">{visibleFields?.length || 0} of {exposedFields?.length || 0} fields shown. Other values are preserved.</p></div>}
            {searchable && query && !visibleFields?.length ? <p className="rounded-xl bg-white/5 p-5 text-sm text-botanical-sage">No matching fields. Try another word or clear the search.</p> : displayedField ? <CmsFields key={displayedField.key} fields={[displayedField]} value={content} onChange={edit} onUploadingChange={onUploadingChange} /> : <p className="rounded-xl bg-white/5 p-4 text-sm text-botanical-sage">This document has no editable fields.</p>}
          </fieldset>
        </div>
      </div>
      <div className="glass sticky bottom-3 z-20 flex flex-col justify-between gap-3 rounded-2xl border border-white/20 p-4 sm:flex-row sm:items-center">
        <div className="text-xs leading-relaxed text-botanical-sage">{busy ? <span role="status" className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" />{busy === 'publish' ? 'Publishing changes?' : busy === 'restore' ? 'Restoring revision?' : busy === 'unpublish' ? 'Unpublishing page?' : 'Saving draft...'}</span> : <><span className="block">{isUploading ? 'Wait for the image upload to finish before saving or publishing.' : dirty ? 'Your changes have not been saved.' : 'Last saved ' + time(documentData.updated_at)}</span><span className="block">Published {time(documentData.published_at)}</span></>}</div>
        <div className="flex flex-wrap items-center gap-2">{canUnpublish && isOwner && <button type="button" disabled={!!busy || isUploading || dirty || conflict} onClick={() => setUnpublishOpen(true)} className="glass-btn-3d min-h-11 rounded-xl px-3 text-xs text-rose-200 disabled:opacity-40" title={dirty ? 'Save your changes before unpublishing' : 'Hide this page from the public website'}>Unpublish</button>}<button type="submit" data-cms-action="save" disabled={!!busy || isUploading || !dirty || conflict} className="glass-btn-3d inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-40 sm:flex-none"><Save size={16} /> Save draft</button>{isOwner ? <button type="submit" data-cms-action="publish" disabled={!!busy || isUploading || conflict || !dirty && documentData.version === documentData.published_version} className="btn-lime-3d inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-40 sm:flex-none"><Send size={16} /> Publish changes</button> : <span className="text-xs text-botanical-sage">An owner can publish this draft.</span>}</div>
      </div>
    </form>
    <Dialog open={historyOpen} onClose={() => { if (!busy) setHistoryOpen(false); }} title="Content revision history" className="!max-w-2xl !bg-transparent">
      <div className="glass max-h-[80dvh] overflow-y-auto rounded-2xl border border-white/20 p-5 text-white sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Revision history</h2><button type="button" aria-label="Close revision history" disabled={!!busy} onClick={() => setHistoryOpen(false)} className="glass-btn-3d flex min-h-11 min-w-11 items-center justify-center rounded-xl"><X size={19} /></button></div><p className="mb-5 text-sm leading-relaxed text-botanical-sage">Restoring creates a new draft. It never changes the published website until an owner publishes it.</p>
        {!documentData.revisions.length && <p className="rounded-xl bg-white/5 p-5 text-sm text-botanical-sage">No revisions are available yet.</p>}
        <ol className="space-y-2">{documentData.revisions.map(revision => <li key={revision.id} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">Version {revision.version} | {revision.action}</p><p className="mt-1 text-xs text-botanical-sage">{time(revision.created_at)}</p></div><button type="button" disabled={!!busy || isUploading || conflict} onClick={() => { setHistoryOpen(false); setRestoring(revision); }} className="glass-btn-3d min-h-11 rounded-xl px-4 text-xs disabled:opacity-40">Restore as draft</button></li>)}</ol>
      </div>
    </Dialog>
    <Dialog open={!!restoring} onClose={() => { if (!busy) setRestoring(null); }} title="Restore a content revision" className="!max-w-lg !bg-transparent"><div className="glass rounded-2xl border border-white/20 p-6 text-white"><h2 className="text-xl font-semibold">Restore version {restoring?.version}?</h2><p className="mt-3 text-sm leading-relaxed text-botanical-sage">This replaces the current draft with that revision.{dirty ? ' Your unsaved edits will be discarded.' : ''} The published version stays unchanged.</p><div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" disabled={!!busy} onClick={() => setRestoring(null)} className="glass-btn-3d min-h-11 rounded-xl px-4 text-sm">Cancel</button><button type="button" disabled={!!busy} onClick={() => restoring && void update('restore', restoring)} className="btn-lime-3d min-h-11 rounded-xl px-5 text-sm font-semibold">{busy ? 'Restoring...' : 'Restore draft'}</button></div></div></Dialog>
    <Dialog open={unpublishOpen} onClose={() => { if (!busy) setUnpublishOpen(false); }} title="Unpublish this page" className="!max-w-lg !bg-transparent"><div className="glass rounded-2xl border border-white/20 p-6 text-white"><h2 className="text-xl font-semibold">Unpublish this page?</h2><p className="mt-3 text-sm leading-relaxed text-botanical-sage">Visitors will no longer be able to open this page. Remove links to it from navigation before unpublishing. Its draft and revision history will remain available.</p><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={!!busy} onClick={() => setUnpublishOpen(false)} className="glass-btn-3d min-h-11 rounded-xl px-4 text-sm">Cancel</button><button type="button" disabled={!!busy} onClick={() => void update('unpublish')} className="glass-btn-3d min-h-11 rounded-xl px-5 text-sm font-semibold text-rose-200">{busy ? 'Unpublishing...' : 'Unpublish page'}</button></div></div></Dialog>
    <Dialog open={reloadOpen} onClose={() => setReloadOpen(false)} title="Load the latest content" className="!max-w-lg !bg-transparent"><div className="glass rounded-2xl border border-white/20 p-6 text-white"><h2 className="text-xl font-semibold">Load the latest version?</h2><p className="mt-3 text-sm leading-relaxed text-botanical-sage">This discards the unsaved edits in this editor. Download your draft first if you want to keep a copy.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setReloadOpen(false)} className="glass-btn-3d min-h-11 rounded-xl px-4 text-sm">Cancel</button><button type="button" onClick={() => { setReloadOpen(false); void load(); }} className="btn-lime-3d min-h-11 rounded-xl px-5 text-sm font-semibold">Load latest</button></div></div></Dialog>
    <Dialog open={!!leaveHref} onClose={() => setLeaveHref(null)} title="Unsaved content changes" className="!max-w-lg !bg-transparent"><div className="glass rounded-2xl border border-white/20 p-6 text-white"><h2 className="text-xl font-semibold">Leave without saving?</h2><p className="mt-3 text-sm leading-relaxed text-botanical-sage">Your edits will be lost. Stay on this page to save a draft or publish the changes.</p><div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setLeaveHref(null)} className="btn-lime-3d min-h-11 rounded-xl px-4 text-sm font-semibold">Keep editing</button><button type="button" onClick={() => { if (leaveHref) { allowLeave.current = true; router.push(leaveHref); setLeaveHref(null); } }} className="glass-btn-3d min-h-11 rounded-xl px-4 text-sm">Discard and leave</button></div></div></Dialog>
  </div>;
}
