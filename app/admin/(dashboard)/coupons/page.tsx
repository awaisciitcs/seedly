import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { CouponsClient } from '@/components/admin/CouponsClient';
export const dynamic = 'force-dynamic';
export default async function CouponsPage() {
  const session = await requireAdminOrRedirect();
  return <CouponsClient canEdit={session.admin.role === 'OWNER'} />;
}
