import { getContentDocument } from '@/lib/services/content';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { getContentMetadata } from '@/lib/cms/metadata';
import { DeliveryNote } from '@/components/storefront/DeliveryNote';
import { getCustomerStoreSettings } from '@/lib/services/settings';
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin, Banknote, MessageCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getContentMetadata('shipping');
}

export default async function ShippingPage() {
  const cms = await getContentDocument<CmsPageContent>('shipping'); const { copy, links, images } = cms;
const siteConfig = (await getContentDocument<SiteContent>('site')).config;
 const paymentSettings = await getCustomerStoreSettings().catch(() => null);
 const codAvailable = Boolean(paymentSettings?.ordering_available && paymentSettings.enabled_payment_methods.includes('COD'));
 const prepaidAvailable = Boolean(paymentSettings?.ordering_available && paymentSettings.enabled_payment_methods.some(method => method !== 'COD'));

  return (
    <div className="bg-white text-stone-900">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-12 md:py-20 space-y-12">
        {/* Page Header */}
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500">
            {copy.text_nationwide_logistics}</span>
          <h1 className="font-heading font-medium text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {copy.text_shipping_delivery_policy}</h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            {copy.text_carefully_packaged_raw_pantry_seeds_and_mountain_teas_d}</p>
        </header>

        {/* 3 Overview Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <Truck className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">{copy.text_delivery_charges}</h2>
            <DeliveryNote />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <Clock className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">{copy.text_daily_dispatch_cutoff}</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {copy.text_our_team_prepares_orders_during_business_days_bank_and}</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-[#FBFBFA] p-6 space-y-2.5 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-stone-800 mb-1" />
            <h2 className="font-heading font-medium text-base text-stone-900">{copy.text_courier_partners}</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {copy.text_we_partner_exclusively_with}<strong>{copy.text_tcs}</strong> {copy.text_and}<strong>{copy.text_leopards_courier}</strong> {copy.text_for_secure_door_to_door_delivery_with_sms_status_notifi}</p>
          </div>
        </div>

        {/* Delivery Timelines Table */}
        <ManagedSection document="shipping" sectionId="page_section_01"><section aria-labelledby="timelines-heading" className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <h2 id="timelines-heading" className="font-heading font-medium text-xl sm:text-2xl text-stone-900">
            {copy.text_estimated_delivery_timelines}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-start border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-900 font-semibold bg-[#FBFBFA]">
                  <th className="py-3.5 px-4 text-start">{copy.text_destination_region}</th>
                  <th className="py-3.5 px-4 text-start">{copy.text_expected_transit_window}</th>
                  <th className="py-3.5 px-4 text-start">{copy.text_courier_network}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                {siteConfig.shipping.timelines.map((timeline, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-stone-900">{timeline.area}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">{timeline.time}</td>
                    <td className="py-3.5 px-4">{copy.text_tcs_leopards_courier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-500">
            {copy.text_remote_addresses_or_extreme_seasonal_weather_conditions}</p>
        </section></ManagedSection>

        {/* Packaging & Payment Verification */}
        <ManagedSection document="shipping" sectionId="page_section_02"><section className="rounded-3xl border border-stone-200 bg-[#FBFBFA] p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-stone-700 shadow-xs">
          <div className="space-y-2">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-stone-800" />
              <span>Payment availability and verification</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              {codAvailable ? <>{copy.text_cash_on_delivery_is_available_across_all_serviceable_de}<strong>{siteConfig.contact.phone}</strong> {copy.text_to_confirm_your_delivery_address_prior_to_handing_parce}</> : <>Cash on delivery is not currently available. Check the enabled payment options at checkout before placing an order.</>}</p>
            <p className="text-stone-600 leading-relaxed">
              {prepaidAvailable ? 'Use only the bank or wallet details shown for an enabled payment option at checkout. Prepaid payments remain under review until our team verifies them; preparation does not advance automatically.' : 'Do not transfer payment while prepaid checkout is unavailable. Please contact our team if you need assistance.'}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200/60">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-800" />
              <span>{copy.text_airtight_packaging_transit_protection}</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              {copy.text_all_raw_seeds_are_heat_sealed_in_thick_food_grade_moist}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200/60">
            <h2 className="font-heading font-medium text-lg text-stone-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>{copy.text_order_tracking_delivery_support}</span>
            </h2>
            <p className="text-stone-600 leading-relaxed">
              {copy.text_courier_details_appear_on_your_order_tracking_page_when}{' '}
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-600"
              >
                {siteConfig.contact.phone}
              </a>{' '}
              {copy.text_or_email}{' '}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-stone-900 font-semibold underline underline-offset-4 hover:text-stone-600"
              >
                {siteConfig.contact.email}
              </a>.
            </p>
          </div>
        </section></ManagedSection>
      </div>
    </div>
  );
}
