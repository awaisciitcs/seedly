import { NextResponse } from 'next/server';
import { contactFields } from '@/lib/tracking/validation';
import { requireSameOrigin, readJson, RequestError } from '@/lib/request-guards';
import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { saveLead } from '@/lib/services/leads';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 requireSameOrigin(request);if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new RequestError('Use the contact form to submit your request.',415);
 const body=await readJson(request,8192);
 await enforcePublicRateLimit(request,'leads');
 if(typeof body.website==='string'&&body.website)return NextResponse.json({data:{id:null},success:true},{headers:{'Cache-Control':'no-store'}});
 const input=contactFields(body);const id=await saveLead({...input,source:'contact'});
 if(!id)throw new RequestError('Contact requests are currently paused. Please use our other contact options.',503);
 return NextResponse.json({data:{id},success:true},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:{message:error instanceof RequestError?error.message:'We could not save your request. Please contact our team.'}},{status:error instanceof RequestError?error.status:503,headers:rateLimitHeaders(error)});}}
