'use client';
import { useId } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import type { CmsFieldDefinition } from '@/lib/cms/types';

type Value = unknown;
interface CmsFieldsProps { fields: CmsFieldDefinition[]; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void; onUploadingChange?: (id: string, uploading: boolean) => void; }
const inputClass = 'glass-input-3d w-full min-w-0 rounded-xl px-3 py-2.5 text-sm text-white';
function object(value: unknown): Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function blank(field: CmsFieldDefinition): Value {
  if (field.type === 'object') return Object.fromEntries((field.fields || []).map(child => [child.key, blank(child)]));
  if (field.type === 'list') return [];
  if (field.type === 'boolean') return false;
  if (field.type === 'number') return field.min ?? 0;
  if (field.type === 'select') return field.options?.[0]?.value || '';
  return '';
}
function itemTitle(value: unknown, index: number): string {
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 70);
  const row = object(value);
  for (const key of ['title', 'heading', 'label', 'name', 'question', 'eyebrow']) if (typeof row[key] === 'string' && (row[key] as string).trim()) return (row[key] as string).trim().slice(0, 70);
  return 'Item ' + (index + 1);
}
function CmsField({ field, value, onChange, onUploadingChange }: { field: CmsFieldDefinition; value: Value; onChange: (value: Value) => void; onUploadingChange?: (id: string, uploading: boolean) => void; }) {
  const id = useId();
  const label = field.label + (field.required && field.type !== 'boolean' ? ' *' : '');
  const helpId = field.help ? id + '-help' : undefined;
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const help = field.help ? <p id={helpId} className="mt-1.5 text-xs leading-relaxed text-botanical-sage">{field.help}</p> : null;
  if (field.type === 'object') return <fieldset className="min-w-0 space-y-4 rounded-2xl border border-white/10 p-4 sm:p-5">
    <legend className="px-2 text-sm font-semibold text-white">{label}</legend>{help}
    <CmsFields fields={field.fields || []} value={object(value)} onChange={onChange} onUploadingChange={onUploadingChange} />
  </fieldset>;
  if (field.type === 'list') {
    const rows = Array.isArray(value) ? value : [];
    const item = field.item;
    return <fieldset className="min-w-0 space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
      <legend className="px-2 text-sm font-semibold text-white">{label} <span className="text-botanical-sage">({rows.length})</span></legend>{help}
      {!rows.length && <p className="rounded-xl bg-white/5 px-4 py-5 text-sm text-botanical-sage">No items yet. Add an item to build this section.</p>}
      {item && rows.map((row, index) => {
        const title = itemTitle(row, index);
        const move = (offset: number) => { const next = [...rows]; const target = index + offset; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
        return <details key={index} open={rows.length < 4 || index === rows.length - 1} className="min-w-0 rounded-xl border border-white/10 bg-black/10">
          <summary className="cursor-pointer break-words px-4 py-3 text-sm font-medium text-white">{index + 1}. {title}</summary>
          <div className="space-y-4 border-t border-white/10 p-4">
            <div className="flex flex-wrap justify-end gap-1">
              <button type="button" aria-label={'Move ' + title + ' up'} disabled={index === 0} onClick={() => move(-1)} className="glass-btn-3d min-h-10 min-w-10 rounded-lg p-2 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" aria-label={'Move ' + title + ' down'} disabled={index === rows.length - 1} onClick={() => move(1)} className="glass-btn-3d min-h-10 min-w-10 rounded-lg p-2 disabled:opacity-30"><ArrowDown size={16} /></button>
              <button type="button" aria-label={'Remove ' + title} disabled={rows.length <= (field.min ?? 0)} onClick={() => onChange(rows.filter((_, i) => i !== index))} className="glass-btn-3d flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs text-rose-300 disabled:opacity-30"><Trash2 size={15} /> Remove</button>
            </div>
            <CmsField field={{ ...item, label: item.label || 'Item details' }} value={row} onUploadingChange={onUploadingChange} onChange={next => onChange(rows.map((current, i) => i === index ? next : current))} />
          </div>
        </details>;
      })}
      {item && <button type="button" disabled={field.max !== undefined && rows.length >= field.max} onClick={() => onChange([...rows, blank(item)])} className="glass-btn-3d inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold disabled:opacity-40"><Plus size={16} /> Add {item.label?.toLowerCase() || 'item'}</button>}
    </fieldset>;
  }
  if (field.type === 'image') return <div className="min-w-0"><ImageUpload value={text} onChange={onChange} label={label} onUploadingChange={uploading => onUploadingChange?.(id, uploading)} />{help}</div>;
  if (field.type === 'boolean') return <div className="min-w-0"><label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 p-3 text-sm text-white">
    <input id={id} type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} aria-describedby={helpId} className="h-4 w-4 accent-lime" /><span>{field.label}</span>
  </label>{help}</div>;
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-2 block text-xs font-semibold text-white/90">{label}</label>
    {field.type === 'textarea' ? <textarea id={id} value={text} rows={5} required={field.required} maxLength={field.maxLength} aria-describedby={helpId} onChange={e => onChange(e.target.value)} className={inputClass + ' resize-y'} />
      : field.type === 'select' ? <select id={id} value={text} required={field.required} aria-describedby={helpId} onChange={e => onChange(e.target.value)} className={inputClass}>
        {(field.options || []).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      : <input id={id} type={field.type === 'number' ? 'number' : 'text'} inputMode={field.type === 'url' ? 'url' : field.type === 'number' ? 'numeric' : undefined} value={text} required={field.required} maxLength={field.maxLength} min={field.min} max={field.max} step={field.type === 'number' ? 'any' : undefined} aria-describedby={helpId} onChange={e => onChange(field.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)} className={inputClass} />}
    {help}
  </div>;
}
export function CmsFields({ fields, value, onChange, onUploadingChange }: CmsFieldsProps) {
  return <div className="min-w-0 space-y-4">{fields.map(field => field.readOnly ? <fieldset key={field.key} disabled className="min-w-0 rounded-xl border border-white/10 bg-white/[0.02] p-3"><div className="pointer-events-none opacity-75"><CmsField field={field} value={value[field.key]} onChange={() => {}} /></div><p className="mt-2 text-xs text-botanical-sage">Read only: managed in its dedicated dashboard area.</p></fieldset> : <CmsField key={field.key} field={field} value={value[field.key]} onUploadingChange={onUploadingChange} onChange={next => onChange({ ...value, [field.key]: next })} />)}</div>;
}
