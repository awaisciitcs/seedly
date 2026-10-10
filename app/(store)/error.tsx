'use client';
import Link from 'next/link';
export default function StoreError({ reset }: { reset: () => void }) { return <div className="store-container py-24 text-center"><h1 className="text-3xl mb-3">We couldn’t load this page</h1><p className="text-muted-gray">Please try again. Your basket is saved on this device.</p><div className="flex flex-wrap justify-center gap-4 mt-8"><button type="button" className="button-primary" onClick={reset}>Try again</button><Link href="/contact" className="button-secondary">Contact us</Link></div></div>; }
