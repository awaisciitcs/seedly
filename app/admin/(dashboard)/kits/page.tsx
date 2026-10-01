import React from 'react';
import { requireAdminOrRedirect } from '@/lib/auth/require-admin';
import { getKits } from '@/lib/services/kits';
import { getProducts } from '@/lib/services/products';
import { AdminKitsClient } from '@/components/admin/AdminKitsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminKitsPage() {
  await requireAdminOrRedirect();

  const [kits, products] = await Promise.all([
    getKits({ status: '' }),
    getProducts({ status: '' }),
  ]);

  return <AdminKitsClient initialKits={kits as any} initialProducts={products as any} />;
}
