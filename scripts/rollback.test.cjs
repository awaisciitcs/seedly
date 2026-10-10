const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
test('rollback previews, restores checked files, saves current versions and rejects tampered backups',()=>{
 const tempRoot=path.resolve(os.tmpdir());
 const stage=fs.mkdtempSync(path.join(tempRoot,'seedly-rollback-'));
 try{
  const workspace=path.join(stage,'workspace');const backup=path.join(stage,'backup');
  fs.mkdirSync(path.join(workspace,'scripts'),{recursive:true});fs.mkdirSync(path.join(backup,'snapshot'),{recursive:true});
  fs.copyFileSync(path.join(__dirname,'restore-version.mjs'),path.join(workspace,'scripts','restore-version.mjs'));
  fs.mkdirSync(path.join(workspace,'nested'),{recursive:true});fs.mkdirSync(path.join(backup,'snapshot','nested'),{recursive:true});
  fs.writeFileSync(path.join(workspace,'nested','style.css'),'new design');fs.writeFileSync(path.join(backup,'snapshot','nested','style.css'),'original design');
  fs.writeFileSync(path.join(workspace,'section.css'),'new design');fs.writeFileSync(path.join(workspace,'added.txt'),'new functionality');fs.writeFileSync(path.join(backup,'snapshot','section.css'),'original design');
  const hash=crypto.createHash('sha256').update('original design').digest('hex').toUpperCase();
  fs.writeFileSync(path.join(backup,'manifest.json'),'\uFEFF'+JSON.stringify({workspace,files:[{path:'section.css',sha256:hash},{path:'nested\\style.css',sha256:hash}]}));
  fs.writeFileSync(path.join(backup,'changes.json'),JSON.stringify({files:[{path:'section.css'},{path:'added.txt'},{path:'nested/style.css'}],sections:{appearance:['section.css']}}));
  const run=(...args)=>spawnSync(process.execPath,[path.join(workspace,'scripts','restore-version.mjs'),'--backup',backup,...args],{encoding:'utf8'});
  const preview=run('--section','appearance');assert.equal(preview.status,0,preview.stderr);assert.equal(fs.readFileSync(path.join(workspace,'section.css'),'utf8'),'new design');
  fs.writeFileSync(path.join(backup,'snapshot','section.css'),'tampered');const failed=run('--apply');assert.notEqual(failed.status,0);assert.equal(fs.readFileSync(path.join(workspace,'section.css'),'utf8'),'new design');
  fs.writeFileSync(path.join(backup,'snapshot','section.css'),'original design');const restored=run('--apply');assert.equal(restored.status,0,restored.stderr);
  assert.equal(fs.readFileSync(path.join(workspace,'section.css'),'utf8'),'original design');assert.equal(fs.existsSync(path.join(workspace,'added.txt')),false);
  assert.equal(fs.readFileSync(path.join(workspace,'nested','style.css'),'utf8'),'original design');
  const recovery=fs.readdirSync(backup).find(name=>name.startsWith('recovery-'));assert.equal(fs.readFileSync(path.join(backup,recovery,'section.css'),'utf8'),'new design');assert.equal(fs.readFileSync(path.join(backup,recovery,'added.txt'),'utf8'),'new functionality');
  assert.notEqual(run('--file','../outside.txt','--apply').status,0);
 }finally{
  const target=path.resolve(stage);
  if(!target.startsWith(tempRoot+path.sep)||!path.basename(target).startsWith('seedly-rollback-'))throw Error('Unsafe test cleanup path');
  fs.rmSync(target,{recursive:true,force:true});
 }
});
