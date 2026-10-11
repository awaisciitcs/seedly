import {requireAdminOrRedirect} from '@/lib/auth/require-admin';import {TrackingSettingsClient} from '@/components/admin/TrackingSettingsClient';
export default async function AnalyticsPage(){await requireAdminOrRedirect('OWNER');return <TrackingSettingsClient/>;}
