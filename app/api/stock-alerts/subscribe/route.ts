import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { NextResponse } from 'next/server';
import { subscribeToStockAlert } from '@/lib/services/stockAlerts';
import { requireSameOrigin, readJson, RequestError } from '@/lib/request-guards';
export const dynamic='force-dynamic';
export async function POST(request:Request){
  try{
    requireSameOrigin(request);
    const body=await readJson(request,8192);
    if(!process.env.SUPABASE_SECRET_KEY)throw new RequestError('Restock requests are temporarily unavailable. Please contact our team for availability.',503);
    const {productId,variantId,kitId,sellableTitle,email}=body;
    const validId=(value:unknown)=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(value);
    if(typeof email!=='string'||email.length>254||typeof sellableTitle!=='string'||!sellableTitle.trim()||sellableTitle.length>200)throw new RequestError('Enter a valid email and product selection.');
    if(kitId ? !validId(kitId)||!!productId||!!variantId : !validId(productId)||!validId(variantId))throw new RequestError('Please select a valid product pack.');
    await enforcePublicRateLimit(request, 'restock');
    const result=await subscribeToStockAlert({productId:productId as string|undefined,variantId:variantId as string|undefined,kitId:kitId as string|undefined,sellableTitle:sellableTitle.trim(),email});
    if(!result.success)return NextResponse.json({error:{message:result.message},alreadyInStock:result.alreadyInStock},{status:result.alreadyInStock?409:400});
    // Never return subscription credentials or another customer's existing record.
    return NextResponse.json({success:true,message:'Your restock request has been saved.'},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return NextResponse.json({error:{message:error instanceof RequestError?error.message:'We could not save your request. Please try again or contact our team.'}},{status:error instanceof RequestError?error.status:503,headers:rateLimitHeaders(error)});}
}
