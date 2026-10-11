export interface TrackingSettings {
 id: number; version: number; updated_at: string;
 posthog_enabled: boolean; posthog_token: string; posthog_region: 'eu' | 'us'; posthog_project_id: string;
 clarity_enabled: boolean; clarity_project_id: string;
 leads_enabled: boolean; retention_days: number;
 banner_title: string; banner_body: string; form_title: string; form_intro: string; form_button: string; privacy_notice: string;
}
export interface JourneyContext { analytics_consent: boolean; posthog_id?: string; landing_page?: string; page?: string; referrer?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string; }
export interface Lead { id: string; name: string | null; email: string | null; phone: string | null; city: string | null; source: 'contact' | 'checkout' | 'restock'; posthog_id: string | null; analytics_consent: boolean; marketing_consent: boolean; landing_page: string | null; page: string | null; referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; order_id: string | null; created_at: string; expires_at: string; }
export const DISABLED_TRACKING: TrackingSettings = {id:1,version:0,updated_at:'',posthog_enabled:false,posthog_token:'',posthog_region:'eu',posthog_project_id:'',clarity_enabled:false,clarity_project_id:'',leads_enabled:false,retention_days:90,banner_title:'Your privacy choices',banner_body:'With your permission, we use analytics to understand visits and improve the shop. Optional recordings show interactions with sensitive text masked. You can shop without accepting.',form_title:'Ask our team to get in touch',form_intro:'Leave your details and our customer care team can contact you.',form_button:'Request a reply',privacy_notice:'We use the details you submit to respond to your request. Marketing is optional. If you accept analytics, your request can be linked to your website journey.'};
