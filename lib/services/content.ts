import 'server-only';
import { cache } from 'react';
import { createPublicClient } from '../supabase/public';
import { getScopedClient } from '../supabase/admin';
import { RequestError } from '../request-guards';
import { adminText } from '../admin-validation';
import { getCmsDefinition, validateCmsContent, validateCmsSlug } from '../cms/schema';
import type { Json } from '../supabase/database.types';
import type { CmsAdminDocument, CmsDocumentSummary, CmsSiteSnapshot } from '../cms/types';

export async function fetchSiteContent(): Promise<CmsSiteSnapshot> {
 const {data,error}=await createPublicClient().rpc('get_site_content_snapshot');
 const snapshot=data as unknown as CmsSiteSnapshot;
 if(error||!snapshot||typeof snapshot.revision!=='string'||!snapshot.documents?.site) throw new Error('Published website content is temporarily unavailable.');
 return snapshot;
}
/** React memoization is request-scoped; published data is never a build-time fallback. */
export const getSiteContent=cache(fetchSiteContent);
export async function getContentDocument<T extends object>(slug:string):Promise<T>{
 const document=(await getSiteContent()).documents[slug];
 if(!document)throw new RequestError('This published page is unavailable.',404);
 return document.content as T;
}
export async function listAdminContent():Promise<CmsDocumentSummary[]>{
 const client=await getScopedClient();
 const [{data:drafts,error},{data:published,error:publishedError}]=await Promise.all([
  client.from('site_content_drafts').select('slug,title,kind,route,version,updated_at').order('title'),
  client.from('site_documents').select('slug,version,published_at'),
 ]);
 if(error||publishedError||!drafts||!published)throw new Error('Content could not be loaded.');
 const versions=new Map(published.map(row=>[row.slug,row]));
 return drafts.map(row=>({...row,kind:row.kind as CmsDocumentSummary['kind'],published_version:versions.get(row.slug)?.version??null,published_at:versions.get(row.slug)?.published_at??null}));
}
export async function getAdminContent(slug:string):Promise<CmsAdminDocument>{
 slug=validateCmsSlug(slug);
 const client=await getScopedClient();
 const [{data:draft,error},{data:published,error:publishedError},{data:revisions,error:historyError}]=await Promise.all([
  client.from('site_content_drafts').select('slug,title,kind,route,content,version,updated_at').eq('slug',slug).maybeSingle(),
  client.from('site_documents').select('content,version,published_at').eq('slug',slug).maybeSingle(),
  client.from('site_content_revisions').select('id,version,action,created_at,created_by').eq('slug',slug).order('version',{ascending:false}).limit(100),
 ]);
 if(error||publishedError||historyError)throw new Error('Content could not be loaded.');
 if(!draft)throw new RequestError('This content document does not exist.',404);
 return {...draft,kind:draft.kind as CmsAdminDocument['kind'],content:draft.content as CmsAdminDocument['content'],
  published_content:published?.content as CmsAdminDocument['content']??null,published_version:published?.version??null,
  published_at:published?.published_at??null,definition:getCmsDefinition(slug,draft.kind as CmsAdminDocument['kind']),
  revisions:(revisions??[]) as CmsAdminDocument['revisions']};
}
const actions=new Set(['create','save','publish','unpublish','restore']);
export async function mutateAdminContent(slug:string,body:Record<string,unknown>,create=false):Promise<CmsAdminDocument>{
 slug=validateCmsSlug(slug);
 const action=create?'create':body.action;
 const allowed=new Set(['action','expected_version','title','content','revision_id',...(create?['slug','kind']:[])]);
 if(Object.keys(body).some(key=>!allowed.has(key)))throw new RequestError('Unknown content action field.');
 if(typeof action!=='string'||!actions.has(action)||!create&&action==='create')throw new RequestError('Invalid content action.');
 if(create&&body.kind!=='page')throw new RequestError('Custom documents must be website pages.');
 const expected=create?0:body.expected_version;
 if(typeof expected!=='number'||!Number.isSafeInteger(expected)||expected<0)throw new RequestError('Refresh this document before saving.');
 const title=body.title===undefined?null:adminText(body.title,'Document title',200,true);
 const content=body.content===undefined?null:validateCmsContent(slug,body.content,create?'page':undefined);
 if(create&&(!title||!content))throw new RequestError('A page title and content are required.');
 if(['save','publish'].includes(action)&&(!title||!content))throw new RequestError('Submit the complete document to save or publish.');
 const revision=body.revision_id??null;
 if(action==='restore'&&(typeof revision!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(revision)))throw new RequestError('Select a revision from this document.');
 if(['unpublish','restore'].includes(action)&&(title!==null||content!==null))throw new RequestError('This action does not accept edited content.');
 const client=await getScopedClient();
 const {error}=await client.rpc('mutate_site_content',{p_slug:slug,p_action:action,p_expected_version:expected,p_title:title??undefined,p_content:(content as Json|null)??undefined,p_revision_id:typeof revision==='string'?revision:undefined});
 if(error){
  if(error.code==='42501')throw new RequestError('Your current role does not allow this action.',403);
  if(['PT409','40001'].includes(error.code))throw new RequestError('This content changed while you were editing. Download your edits, then reload the latest version.',409);
  if(error.code==='P0002')throw new RequestError('This document or revision no longer exists.',404);
  if(error.code==='23505')throw new RequestError('That page slug is already in use.',409);
  if(['22023','23514','23503'].includes(error.code))throw new RequestError('The document contains invalid values or a protected setting. Review the fields.',400);
  throw new Error('Content update failed.');
 }
 return getAdminContent(slug);
}
