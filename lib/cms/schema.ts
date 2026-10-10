import definitions from './definitions.generated.json';
import { RequestError } from '../request-guards';
import { adminImageUrl, adminText } from '../admin-validation';
import type { CmsContent, CmsDefinition, CmsFieldDefinition, CmsKind } from './types';

export const CMS_DEFINITIONS = definitions as CmsDefinition[];
const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);
export function validateCmsSlug(value: unknown): string {
  if (typeof value !== 'string' || value.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new RequestError('Use a page slug with lowercase words separated by hyphens.');
  return value;
}
export function getCmsDefinition(slug: string, kind?: CmsKind): CmsDefinition {
  const existing = CMS_DEFINITIONS.find(item => item.slug === slug);
  if (existing) return existing;
  if (kind && kind !== 'page') throw new RequestError('Custom documents must be website pages.');
  const template = CMS_DEFINITIONS.find(item => item.slug === 'page-template');
  if (!template) throw new RequestError('The custom page template is unavailable.', 503);
  return { ...template, slug, kind: 'page', title: slug.replaceAll('-', ' '), description: 'Custom website page.' };
}
export function validateCmsLink(value: unknown, label = 'Link'): string {
  const text = adminText(value, label, 2048);
  if (!text) return text;
  if (/[\\\s]/.test(text) || text.startsWith('//')) throw new RequestError(label + ' must be a safe website, email, telephone, or local link.');
  if (/^\/(?!\/)/.test(text) || /^#[A-Za-z][A-Za-z0-9_-]*$/.test(text)) return text;
  if (/^mailto:[^?\s@]+@[^?\s@]+\.[^?\s@]+(?:\?[^\r\n]*)?$/.test(text) || /^tel:\+?[0-9()-]{5,25}$/.test(text)) return text;
  try { const url = new URL(text); if (url.protocol === 'https:' && !url.username && !url.password && url.hostname) return text; } catch {}
  throw new RequestError(label + ' must use HTTPS or a safe local link.');
}
function validateField(value: unknown, field: CmsFieldDefinition, path: string, depth: number): unknown {
  if (depth > 12) throw new RequestError('Content nesting is too deep.');
  if (field.type === 'object') return validateObject(value, field.fields || [], path, depth + 1);
  if (field.type === 'list') {
    if (!Array.isArray(value) || value.length < (field.min ?? 0) || value.length > (field.max ?? 100) || !field.item) throw new RequestError(path + ' must contain an allowed number of items.');
    const rows = value.map((item, index) => validateField(item, field.item!, path + ' ' + (index + 1), depth + 1));
    const ids = rows.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)).map(item => item.id).filter(id => typeof id === 'string' && id);
    if (new Set(ids).size !== ids.length) throw new RequestError(path + ' has duplicate item IDs.');
    return rows;
  }
  if (field.type === 'boolean') { if (typeof value !== 'boolean') throw new RequestError(path + ' must be true or false.'); return value; }
  if (field.type === 'number') { if (typeof value !== 'number' || !Number.isFinite(value) || value < (field.min ?? 0) || value > (field.max ?? 1_000_000_000)) throw new RequestError(path + ' must be a valid number.'); return value; }
  const text = adminText(value, path, field.maxLength ?? 16000, field.required);
  if (field.type === 'image') return adminImageUrl(text);
  if (field.type === 'url') return validateCmsLink(text, path);
  if (field.type === 'select' && !field.options?.some(option => option.value === text)) throw new RequestError(path + ' has an invalid selection.');
  return text;
}
function validateObject(value: unknown, fields: CmsFieldDefinition[], path: string, depth: number): CmsContent {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw new RequestError(path + ' must be an object.');
  const input = value as CmsContent;
  const allowed = new Set(fields.map(field => field.key));
  if (Object.keys(input).some(key => forbiddenKeys.has(key) || !allowed.has(key))) throw new RequestError(path + ' contains an unknown field.');
  return Object.fromEntries(fields.map(field => {
    if (!Object.prototype.hasOwnProperty.call(input, field.key)) throw new RequestError(path + ': ' + field.label + ' is missing.');
    return [field.key, validateField(input[field.key], field, path ? path + ' / ' + field.label : field.label, depth)];
  }));
}
export function validateCmsContent(slug: string, content: unknown, kind?: CmsKind): CmsContent {
  let serialized: string;
  try { serialized = JSON.stringify(content); } catch { throw new RequestError('Invalid content.'); }
  if (!serialized || new TextEncoder().encode(serialized).length > 128 * 1024) throw new RequestError('A content document must be under 128 KB.', 413);
  const definition = getCmsDefinition(slug, kind);
  const validated = validateObject(content, definition.fields, '', 0);
  if (definition.routineOptions) {
    const questions = validated.questions as Array<{id:string;options:Array<{value:string}>}>;
    for (const [id, expected] of Object.entries(definition.routineOptions)) {
      const values = questions.find(question => question.id === id)?.options.map(option => option.value).sort();
      if (!values || JSON.stringify(values) !== JSON.stringify([...expected].sort())) throw new RequestError('Keep the supported choices for each routine question. Labels and images can be edited.');
    }
  }
  if (slug === 'site') {
    const config = validated.config as {url:string};
    const origin = new URL(config.url);
    if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new RequestError('Website URL must be the HTTPS origin, without a path, query, or fragment.');
  }
  return validated;
}
