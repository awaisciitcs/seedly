import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
if(fs.existsSync(root+'.env.local'))process.loadEnvFile(root+'.env.local');
const secret=process.env.EMAIL_CRON_SECRET;
if(!secret || secret.length<32)throw Error('Configure EMAIL_CRON_SECRET with at least 32 random characters.');
const origin=new URL(process.env.EMAIL_WORKER_ORIGIN || 'http://127.0.0.1:3000');
if(origin.username || origin.password || (origin.protocol!=='https:' && !(origin.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(origin.hostname))))throw Error('Use an HTTPS worker origin or a local loopback URL.');
const once=process.argv.includes('--once');
let stopping=false;
process.on('SIGINT',()=>{stopping=true;});process.on('SIGTERM',()=>{stopping=true;});
do {
 try {
  const response=await fetch(new URL('/api/internal/email-delivery',origin),{method:'POST',headers:{Authorization:'Bearer '+secret},signal:AbortSignal.timeout(55000)});
  const result=await response.json();
  if(!response.ok){console.error('Email worker unavailable (HTTP '+response.status+').');if(once)process.exitCode=1;}
  else console.log(JSON.stringify(result));
 } catch {console.error('Email worker could not reach the server.');if(once)process.exitCode=1;}
 if(once || stopping)break;
 for(let second=0;second<60 && !stopping;second++)await new Promise(resolve=>setTimeout(resolve,1000));
}while(!stopping);
