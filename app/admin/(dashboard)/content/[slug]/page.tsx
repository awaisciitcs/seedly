import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { CmsEditor } from '@/components/admin/CmsEditor';
export const dynamic = 'force-dynamic';
export default async function AdminContentEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireAdminOrRedirect(undefined, '/admin/content/' + slug);
  return <CmsEditor slug={slug} isOwner={session.admin.role === 'OWNER'} />;
}
