import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { readAdminJson } from '@/lib/admin-validation';
import { RequestError } from '@/lib/request-guards';
import { readTrackingSettings, updateTrackingSettings } from '@/lib/services/tracking';
export const dynamic='force-dynamic';
const failure=(error:unknown)=>NextResponse.json({error:{message:error instanceof RequestError||error instanceof AdminAuthError?error.message:'Tracking settings are temporarily unavailable.'}},{status:error instanceof RequestError||error instanceof AdminAuthError?error.status:503,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{await requireAdmin('OWNER');return NextResponse.json({data:await readTrackingSettings()},{headers:{'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
export async function PATCH(request:Request){try{await requireAdmin('OWNER');return NextResponse.json({data:await updateTrackingSettings(await readAdminJson(request))},{headers:{'Cache-Control':'no-store'}});}catch(error){return failure(error);}}
