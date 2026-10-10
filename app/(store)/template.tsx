import type { ReactNode } from 'react';

// Next.js remounts templates on route changes; no navigation interception is needed.
export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="storefront-page">{children}</div>;
}
