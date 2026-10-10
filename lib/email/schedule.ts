import 'server-only';
import { after } from 'next/server';
import { processOrderEmails } from './outbox';
export function scheduleOrderEmails() {
  try {
    after(async () => {
      try { await processOrderEmails(); }
      catch { console.error('Email queue processing unavailable; durable jobs remain queued.'); }
    });
  } catch { console.error('Background email scheduling unavailable; durable jobs remain queued.'); }
}
