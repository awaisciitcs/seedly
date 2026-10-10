'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Link2, Check, AlertCircle } from 'lucide-react';
import { MAX_UPLOAD_FILE_BYTES } from '@/lib/upload-limits';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  onUploadingChange?: (uploading: boolean) => void;
}
function safeImage(value: string): boolean {
  if (!value || value.includes('#') || value.length > 2048 || /[\\\s\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    let storageHost = 'fyqmbjzpajmnyyqcrmgc.supabase.co';
    try { storageHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://' + storageHost).hostname; } catch { /* Config is checked server-side. */ }
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash
      && (url.hostname === 'images.unsplash.com' || url.hostname === storageHost && url.pathname.startsWith('/storage/v1/object/public/product-images/'));
  } catch { return false; }
}
export function ImageUpload({ value, onChange, label = 'Product Image', helperText = 'Upload JPG, PNG, WebP or GIF up to 4MB', onUploadingChange }: ImageUploadProps) {
  const id = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const uploadingRef = useRef(false);
  const callbackRef = useRef(onUploadingChange); callbackRef.current = onUploadingChange;
  const validImage = safeImage(value);
  function notifyUploading(next: boolean) {
    if (uploadingRef.current !== next) { uploadingRef.current = next; callbackRef.current?.(next); }
    setIsUploading(next);
  }
  function cancelUpload() { generation.current++; controllerRef.current?.abort(); controllerRef.current = null; notifyUploading(false); }
  useEffect(() => { setPreviewFailed(false); }, [value]);
  useEffect(() => () => {
    generation.current++; controllerRef.current?.abort();
    if (uploadingRef.current) { uploadingRef.current = false; callbackRef.current?.(false); }
  }, []);
  async function handleUpload(file: File) {
    setErrorMsg(''); cancelUpload();
    if (!file || file.size === 0) { setErrorMsg('Choose a non-empty image file.'); return; }
    if (file.size > MAX_UPLOAD_FILE_BYTES) { setErrorMsg('Image file size exceeds 4MB.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setErrorMsg('Use a JPG, PNG, WebP, or GIF image.'); return; }
    controllerRef.current?.abort();
    const current = ++generation.current;
    const controller = new AbortController(); controllerRef.current = controller;
    notifyUploading(true);
    try {
      const formData = new FormData(); formData.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData, credentials: 'same-origin', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) });
      const json = await response.json().catch(() => null);
      if (current !== generation.current || controller.signal.aborted) return;
      if (!response.ok) throw new Error(json?.error?.message || 'Image upload failed. Please try again.');
      const url = json?.data?.url;
      if (typeof url !== 'string' || !safeImage(url)) throw new Error('The image service returned an invalid image URL. Please try again.');
      setPreviewFailed(false); onChange(url);
    } catch (cause) {
      if (current === generation.current && !controller.signal.aborted) setErrorMsg(cause instanceof Error && cause.name !== 'TimeoutError' ? cause.message : 'Image upload timed out. Please try again.');
    } finally {
      if (current === generation.current) { controllerRef.current = null; notifyUploading(false); }
    }
  }
  function clearImage() { cancelUpload(); setErrorMsg(''); onChange(''); }
  const visibleError = errorMsg || (value && !validImage ? 'Use a local image path, an Unsplash HTTPS image, or this store?s public Supabase product image URL.' : '');
  return <div className="min-w-0 space-y-2">
    <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={showUrlInput ? id + '-url' : id + '-file'} className="block text-xs font-semibold text-white/90">{label}</label><button type="button" disabled={isUploading} aria-pressed={showUrlInput} onClick={() => setShowUrlInput(!showUrlInput)} className="flex min-h-8 items-center gap-1 text-[11px] text-lime/90 transition-colors hover:text-lime disabled:opacity-50"><Link2 size={13} />{showUrlInput ? 'Switch to file upload' : 'Enter URL instead'}</button></div>
    {visibleError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/70 p-2.5 text-xs text-rose-300"><AlertCircle size={16} className="shrink-0" /><span>{visibleError}</span></div>}
    {showUrlInput ? <div className="flex min-w-0 items-center gap-2"><input id={id + '-url'} type="text" inputMode="url" placeholder="/images/? or https://?" value={value} disabled={isUploading} maxLength={2048} aria-describedby={id + '-help'} aria-invalid={!!value && !validImage} onChange={event => { cancelUpload(); setErrorMsg(''); onChange(event.target.value); }} className="glass-input-3d min-h-11 min-w-0 flex-1 rounded-xl px-3 text-xs" />{value && <button type="button" onClick={clearImage} aria-label={'Clear ' + label} className="glass-btn-3d flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-300"><X size={17} /></button>}</div>
      : value ? <div className="flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-black/30 p-2">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">{validImage && !previewFailed ? <Image src={value} alt={label + ' preview'} fill sizes="64px" className="object-cover" onError={() => setPreviewFailed(true)} /> : <span className="flex h-full items-center justify-center p-2 text-center text-[10px] text-botanical-sage">Preview unavailable</span>}</div>
        <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300"><Check size={15} /><span>{isUploading ? 'Replacing image?' : 'Image selected'}</span></div><p className="mt-1 truncate font-mono text-[10px] text-botanical-sage" title={value}>{value}</p></div>
        <div className="flex items-center gap-1.5"><button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="glass-btn-3d inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs text-white disabled:opacity-50">{isUploading && <Loader2 size={15} className="animate-spin" />}{isUploading ? 'Uploading?' : 'Replace'}</button><button type="button" onClick={clearImage} aria-label={'Remove ' + label} className="glass-btn-3d flex min-h-11 min-w-11 items-center justify-center rounded-lg text-rose-300"><X size={17} /></button></div>
      </div>
      : <button type="button" disabled={isUploading} aria-describedby={id + '-help'} onClick={() => fileInputRef.current?.click()} onDrop={event => { event.preventDefault(); setIsDragging(false); const file = event.dataTransfer.files[0]; if (file) void handleUpload(file); }} onDragOver={event => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} className={'flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-colors disabled:cursor-wait ' + (isDragging ? 'border-lime bg-lime/10' : 'border-white/20 bg-white/[0.02] hover:border-lime/60 hover:bg-white/[0.05]')}>
        {isUploading ? <><Loader2 size={24} className="animate-spin text-lime" /><span role="status" className="text-xs text-botanical-sage">Uploading image?</span></> : <><span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-lime"><UploadCloud size={21} /></span><span className="text-xs font-semibold text-white">Click to upload <span className="font-normal text-botanical-sage">or drag &amp; drop</span></span></>}
      </button>}
    <p id={id + '-help'} className="text-[10px] leading-relaxed text-botanical-sage">{helperText}</p>
    <input id={id + '-file'} ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label={label} disabled={isUploading} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void handleUpload(file); }} className="hidden" />
  </div>;
}
