import { NextResponse } from 'next/server';
import { requireAdmin,AdminAuthError } from '@/lib/auth/require-admin';
import { readAdminJson } from '@/lib/admin-validation';
import { RequestError } from '@/lib/request-guards';
import { listAdminContent,mutateAdminContent } from '@/lib/services/content';
import { validateCmsSlug } from '@/lib/cms/schema';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function fail(error:unknown){const known=error instanceof RequestError||error instanceof AdminAuthError;return NextResponse.json({error:{message:known?error.message:'Content is temporarily unavailable. Please try again.'}},{status:known?error.status:503,headers});}
export async function GET(){try{await requireAdmin();return NextResponse.json({data:await listAdminContent()},{headers});}catch(error){return fail(error);}}
export async function POST(request:Request){try{await requireAdmin();const body=await readAdminJson(request);return NextResponse.json({data:await mutateAdminContent(validateCmsSlug(body.slug),body,true)},{status:201,headers});}catch(error){return fail(error);}}
