import { NextResponse } from 'next/server';
import { requireAdmin,AdminAuthError } from '@/lib/auth/require-admin';
import { readAdminJson } from '@/lib/admin-validation';
import { RequestError } from '@/lib/request-guards';
import { getAdminContent,mutateAdminContent } from '@/lib/services/content';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
type Context={params:Promise<{slug:string}>};
function fail(error:unknown){const known=error instanceof RequestError||error instanceof AdminAuthError;return NextResponse.json({error:{message:known?error.message:'Content is temporarily unavailable. Please try again.'}},{status:known?error.status:503,headers});}
export async function GET(_request:Request,context:Context){try{await requireAdmin();return NextResponse.json({data:await getAdminContent((await context.params).slug)},{headers});}catch(error){return fail(error);}}
export async function PATCH(request:Request,context:Context){try{const body=await readAdminJson(request);await requireAdmin(body.action==='publish'||body.action==='unpublish'?'OWNER':undefined);return NextResponse.json({data:await mutateAdminContent((await context.params).slug,body)},{headers});}catch(error){return fail(error);}}
