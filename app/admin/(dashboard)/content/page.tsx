import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { CmsWorkspace } from '@/components/admin/CmsWorkspace';
export const dynamic = 'force-dynamic';
export default async function AdminContentPage() {
  await requireAdminOrRedirect(undefined, '/admin/content');
  return <CmsWorkspace />;
}
