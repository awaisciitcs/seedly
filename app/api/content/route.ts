import { NextResponse } from 'next/server';
import { fetchSiteContent } from '@/lib/services/content';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 try{
  const snapshot=await fetchSiteContent();
  const headers={'Cache-Control':'no-store','Vary':'Accept-Encoding'};
  if(new URL(request.url).searchParams.get('revision')===snapshot.revision)return new Response(null,{status:204,headers});
  return NextResponse.json({data:snapshot},{headers});
 }catch{return NextResponse.json({error:{message:'Website content is temporarily unavailable. Please try again.'}},{status:503,headers:{'Cache-Control':'no-store'}});}
}
