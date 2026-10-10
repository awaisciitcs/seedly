import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const defaultWorkspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const values=name=>args.flatMap((v,i)=>v===name&&args[i+1]?[args[i+1]]:[]);
const workspace=path.resolve(values('--workspace')[0]||defaultWorkspace);
const backup=values('--backup')[0];
if(!backup)throw new Error('Usage: node scripts/restore-version.mjs --backup <folder> [--workspace <folder>] [--section cms-and-storefront|admin-content|email|deployment|documentation|all] [--file relative/path] [--apply]');
const root=path.resolve(backup);
const manifest=JSON.parse((await fs.readFile(path.join(root,'manifest.json'),'utf8')).replace(/^\uFEFF/,''));
manifest.files=manifest.files.map(file=>({...file,path:file.path.replaceAll('\\','/')}));
const changes=JSON.parse(await fs.readFile(path.join(root,'changes.json'),'utf8'));
if(path.resolve(manifest.workspace)!==workspace)throw new Error('This backup belongs to a different workspace.');
const within=(base,relative)=>{const target=path.resolve(base,relative);if(!target.startsWith(base+path.sep))throw new Error('Unsafe backup path: '+relative);return target;};
async function checkParent(base,target){const actualBase=await fs.realpath(base);let parent=path.dirname(target);while(true){try{const actualParent=await fs.realpath(parent);const relative=path.relative(actualBase,actualParent);if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Restore path follows a link outside the target directory.');return;}catch(error){if(error.code!=='ENOENT')throw error;const next=path.dirname(parent);if(next===parent)throw error;parent=next;}}}
const section=values('--section')[0]||'all';
const list=values('--file').length?values('--file'):section==='all'?changes.files.filter(f=>f.rollback_policy!=='retain').map(f=>f.path):changes.sections[section];
if(!list?.length)throw new Error('No files match this section.');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const plan=[];
for(const relative of [...new Set(list)]) {
  const change=changes.files.find(f=>f.path===relative);if(!change)throw new Error('File is not in the recorded change manifest: '+relative);
  if(change.rollback_policy==='retain'||relative.startsWith('supabase/migrations/'))throw new Error('Retain applied migration history and restoration tooling; use a reviewed forward repair instead: '+relative);
  const target=within(workspace,relative);
  await checkParent(workspace,target);
  try {const info=await fs.lstat(target);if(info.isSymbolicLink()||!info.isFile())throw new Error('Restore target must be a regular file: '+relative);}catch(error){if(error.code!=='ENOENT')throw error;}
  const original=manifest.files.find(f=>f.path===relative);
  if(original){const source=within(path.join(root,'snapshot'),relative);await checkParent(path.join(root,'snapshot'),source);const sourceReal=await fs.realpath(source);if(!sourceReal.startsWith(path.resolve(root,'snapshot')+path.sep))throw new Error('Backup file follows an unsafe link.');const data=await fs.readFile(source);if(hash(data)!==original.sha256.toLowerCase())throw new Error('Backup checksum failed: '+relative);plan.push({relative,target,data});}
  else plan.push({relative,target,data:null});
}
console.log((args.includes('--apply')?'Restoring ':'Dry run: ')+plan.length+' files from '+root);
for(const entry of plan)console.log((entry.data?'RESTORE ':'REMOVE NEW FILE ')+entry.relative);
if(!args.includes('--apply')) {console.log('Nothing changed. Add --apply to restore. Rebuild and test after restoring a section.');process.exit(0);}
const recovery=path.join(root,'recovery-'+new Date().toISOString().replaceAll(':','-'));
for(const entry of plan) {
  try {const current=await fs.readFile(entry.target);const saved=within(recovery,entry.relative);await fs.mkdir(path.dirname(saved),{recursive:true});await fs.writeFile(saved,current);}catch(error){if(error.code!=='ENOENT')throw error;}
}
await fs.mkdir(recovery,{recursive:true});
await fs.writeFile(path.join(recovery,'files.json'),JSON.stringify(plan.map(p=>p.relative),null,2));
for(const entry of plan) {
  if(entry.data){await fs.mkdir(path.dirname(entry.target),{recursive:true});await fs.writeFile(entry.target,entry.data);if(hash(await fs.readFile(entry.target))!==hash(entry.data))throw new Error('Restored checksum failed: '+entry.relative);}
  else await fs.rm(entry.target,{force:true});
}
console.log('Restore complete. Previous current files saved in '+recovery);
