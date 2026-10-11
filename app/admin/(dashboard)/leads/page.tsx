import {requireAdminOrRedirect} from '@/lib/auth/require-admin';import {safeTrackingSettings} from '@/lib/services/tracking';import {LeadsClient} from '@/components/admin/LeadsClient';
export default async function LeadsPage(){const session=await requireAdminOrRedirect();return <LeadsClient isOwner={session.admin.role==='OWNER'} settings={await safeTrackingSettings()}/>;}
