'use client';
import Link from 'next/link';
export default function ApplicationError({reset}:{reset:()=>void}) {
 return <main className="mx-auto max-w-lg px-6 py-20 text-center"><h1 className="text-3xl font-semibold">This page is temporarily unavailable</h1><p className="mt-4">Please try again. Your basket remains saved on this device.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><button type="button" onClick={reset} className="rounded-lg bg-[#1e382c] px-5 py-3 text-white">Try again</button><Link href="/" className="px-5 py-3 underline">Return to the shop</Link></div></main>;
}
