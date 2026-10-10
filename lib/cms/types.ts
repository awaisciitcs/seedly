export type CmsKind = 'page' | 'global' | 'config';
export type CmsContent = Record<string, unknown>;
export interface CmsFieldDefinition {
  key: string; label: string; type: 'text'|'textarea'|'image'|'url'|'number'|'boolean'|'select'|'object'|'list';
  required?: boolean; readOnly?: boolean; maxLength?: number; min?: number; max?: number;
  options?: { value: string; label: string }[]; fields?: CmsFieldDefinition[]; item?: CmsFieldDefinition; help?: string;
}
export interface CmsDefinition { slug: string; title: string; description: string; kind: CmsKind; fields: CmsFieldDefinition[]; routineOptions?: Record<string,string[]>; }
export interface CmsPublishedDocument { slug: string; kind: CmsKind; title: string; route: string|null; content: CmsContent; version: number; updated_at: string; published_at: string; }
export interface CmsSiteSnapshot { documents: Record<string, CmsPublishedDocument>; revision: string; }
export interface CmsDocumentSummary {
  slug: string; title: string; kind: CmsKind; route: string|null; version: number; updated_at: string;
  published_version: number|null; published_at: string|null;
}
export interface CmsRevisionSummary { id: string; version: number; action: 'create'|'save'|'publish'|'unpublish'|'restore'; created_at: string; created_by: string|null; }
export interface CmsAdminDocument extends CmsDocumentSummary { content: CmsContent; published_content: CmsContent|null; definition: CmsDefinition; revisions: CmsRevisionSummary[]; }
