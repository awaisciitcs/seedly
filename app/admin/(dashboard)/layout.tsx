import 'server-only';
import React from 'react';
import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { AdminShellClient } from '@/components/admin/AdminShellClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminOrRedirect();

  return (
    <AdminShellClient initialAdmin={session.admin}>
      {children}
    </AdminShellClient>
  );
}
