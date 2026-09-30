import Link from 'next/link';
import { siteConfig } from '../../lib/config';

export function AnnouncementBar() {
  return (
    <div className="bg-seedly-dark px-4 py-2.5 text-center text-[11px] leading-5 tracking-wide text-cream sm:text-xs">
      <Link href="/shipping" className="transition-colors hover:text-white">
        Free delivery across Pakistan on orders of Rs. {siteConfig.shipping.freeThreshold.toLocaleString('en-PK')}+
      </Link>
    </div>
  );
}

export default AnnouncementBar;
