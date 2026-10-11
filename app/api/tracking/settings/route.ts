import { NextResponse } from 'next/server';
import { readTrackingSettings } from '@/lib/services/tracking';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json({data:await readTrackingSettings()},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:{message:'Tracking settings unavailable.'}},{status:503,headers:{'Cache-Control':'no-store'}});}}
