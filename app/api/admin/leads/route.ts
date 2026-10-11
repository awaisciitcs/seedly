import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { readAdminJson } from '@/lib/admin-validation';
import { RequestError } from '@/lib/request-guards';
import { listLeads, eraseLead, purgeExpiredLeads } from '@/lib/services/leads';
export const dynamic='force-dynamic';
const failure=(error:unknown)=>NextResponse.json({error:{message:error instanceof RequestError||error instanceof AdminAuthError?error.message:'Leads are temporarily unavailable.'}},{status:error instanceof RequestError||error instanceof AdminAuthError?error.status:503,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:Request){try{await requireAdmin();return NextResponse.json({data:await listLeads(new URL(request.url).searchParams)},{headers:{'Cache-Control':'private, no-store'}});}catch(error){return failure(error);}}
export async function DELETE(request:Request){try{await requireAdmin('OWNER');const body=await readAdminJson(request);if(body.action==='purge_expired'&&Object.keys(body).length===1)return NextResponse.json({data:{removed:await purgeExpiredLeads()}},{headers:{'Cache-Control':'no-store'}});if(Object.keys(body).length!==1||typeof body.id!=='string')throw new RequestError('Select a valid lead.');await eraseLead(body.id);return NextResponse.json({success:true},{headers:{'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
