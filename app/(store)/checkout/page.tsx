'use client';
import {identifyLead,journeyContext,trackEvent} from '@/lib/tracking/client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent } from '@/lib/cms/storefront-types';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { OrderProcessingOverlay, type OrderProcessingStage } from '@/components/cart/OrderProcessingOverlay';
import { useCart } from '@/lib/store/cart';
import { useCartQuote } from '@/hooks/useCartQuote';
import { formatPKR } from '@/lib/utils';
import type { CheckoutLine, PaymentMethod } from '@/lib/types';
import { clearPendingCheckout, readPendingCheckout, savePendingCheckout, type CheckoutAttempt } from '@/lib/checkout-attempt';
import { CITY_PROVINCE_MAP, PROVINCES } from '@/lib/delivery';
import { CouponControls } from '@/components/cart/CouponControls';
import { CheckoutCitySelect } from '@/components/cart/CheckoutCitySelect';
import { MAX_UPLOAD_FILE_BYTES } from '@/lib/upload-limits';
import { validateCheckoutFields } from '@/lib/checkout-fields';

export default function CheckoutPage() {
  const cms = useSiteContent<CmsPageContent>('checkout'); const { copy, links, images } = cms;

  const router = useRouter();
  const { couponCode, setCouponCode, items, isLoaded, isSyncing, syncError, syncLivePrices, completeOrder, setIsCartOpen, settings, settingsError, refreshSettings } = useCart();
  const [fields, setFields] = useState({ customer_name: '', customer_email: '', customer_phone: '', shipping_address: '', shipping_city: 'Lahore', shipping_province: 'Punjab', shipping_postal_code: '', shipping_notes: '' });
  const { quote, loading, error: quoteError, refresh } = useCartQuote(true, fields.customer_email);
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const [wallet, setWallet] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [tid, setTid] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const errors = validationAttempted ? validateCheckoutFields(fields) : {};
  const hasFieldErrors = Object.keys(errors).length > 0;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<OrderProcessingStage>('prices');
  const [recovering, setRecovering] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [copied, setCopied] = useState(false);
  const submitting = useRef(false);
  const attempt = useRef<CheckoutAttempt | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { setIsCartOpen(false); void syncLivePrices(); }, [setIsCartOpen, syncLivePrices]);
  useEffect(() => {
    try {
      const pending = readPendingCheckout(window.sessionStorage);
      if (!pending?.submitted) return;
      attempt.current = pending;
      const body = pending.submitted;
      setCouponCode(typeof body.coupon_code === 'string' ? body.coupon_code : '');
      setFields(old => Object.fromEntries(Object.keys(old).map(name => [name, typeof body[name] === 'string' ? body[name] : ''])) as typeof old);
      setPayment(body.payment_method as PaymentMethod);
      setRecovering(true);
      setError('A previous order is awaiting confirmation. Recover that order before placing another one. Your original order details will be used.');
    } catch { /* Checkout still works when session storage is unavailable. */ }
  }, []);
  const update = (name: keyof typeof fields, value: string) => {
    setFields(old => ({ ...old, [name]: value, ...(name === 'shipping_city' && CITY_PROVINCE_MAP[value] ? { shipping_province: CITY_PROVINCE_MAP[value] } : {}) }));
  };
  const methodEnabled=(method:PaymentMethod)=>!!settings?.enabled_payment_methods?.includes(method);
  const bankReady = !!(methodEnabled('bank_transfer') && settings?.ordering_available && settings?.receipt_upload_available && settings?.bank_name && settings.bank_account_title && settings.bank_account_number);
  const walletAccountReady=(provider:'jazzcash'|'easypaisa')=>!!settings?.[provider+'_number' as 'jazzcash_number'] && !!settings?.[provider+'_title' as 'jazzcash_title'];
  const walletReady = !!(methodEnabled('wallet_aggregator') && settings?.ordering_available && walletAccountReady(wallet));
  const someWalletReady=methodEnabled('wallet_aggregator')&&(walletAccountReady('jazzcash')||walletAccountReady('easypaisa'));
  useEffect(()=>{if(!recovering&&!walletAccountReady(wallet)){const next=walletAccountReady('jazzcash')?'jazzcash':walletAccountReady('easypaisa')?'easypaisa':null;if(next)setWallet(next);}},[settings,wallet,recovering]);
  const paymentReady = !!settings?.ordering_available && methodEnabled(payment) && (payment === 'COD' || (payment === 'bank_transfer' ? bankReady : walletReady));
  const choosePayment = (method: PaymentMethod) => { if(!methodEnabled(method))return; setPayment(method); setFile(null); setError(''); };
  useEffect(()=>{if(!recovering && settings && !settings.enabled_payment_methods.includes(payment)){const next=settings.enabled_payment_methods[0];if(next){setPayment(next);setFile(null);}}},[settings,payment,recovering]);
  const uploadFile = (selected?: File) => {
    setFile(null);
    if (attempt.current && !attempt.current.submitted) attempt.current = null;
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selected.type) || !selected.size || selected.size > MAX_UPLOAD_FILE_BYTES) { setError('Choose a JPG, PNG or PDF receipt under 4 MB.'); return; }
    setError(''); setFile(selected);
  };
  const copyAccount = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(true); } catch { setError('Copy is unavailable. Please select and copy the account number.'); }
  };
  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    setError('');
    const recoveringSubmission = !!attempt.current?.submitted;
    if (!recoveringSubmission) {
    if (!settings?.ordering_available) { setError('Ordering is temporarily unavailable. Please contact our team before transferring payment.'); return; }
    const next = validateCheckoutFields(fields);
    setValidationAttempted(true);
    if (Object.keys(next).length) {
      formRef.current?.querySelector<HTMLInputElement>('[name="' + Object.keys(next)[0] + '"]')?.focus();
      return;
    }
    if (!paymentReady) { setError('This payment method is currently unavailable. Choose another method.'); return; }
    if (payment === 'bank_transfer' && !file) { setError('Attach your bank transfer receipt before placing the order.'); document.getElementById('receipt')?.focus(); return; }
    if (syncError || isSyncing || !items.length) { setError('Please review your basket before placing the order.'); return; }
    }
    submitting.current = true; setSubmissionStage('prices'); setBusy(true);
    try {
      const payload = { ...fields, coupon_code: couponCode, customer_email: fields.customer_email.trim().toLowerCase(), customer_phone: fields.customer_phone.replace(/[\s()-]/g, ''), payment_method: payment, shipping_notes: fields.shipping_notes + (payment === 'wallet_aggregator' ? ' [' + wallet + ' transaction: ' + (tid.trim() || 'Pending verification') + ']' : ''), items: items.map(({ product_id, variant_id, kit_id, quantity }) => ({ product_id, variant_id, kit_id, quantity })) };
      const signature = JSON.stringify({ payload, file: file ? [file.name, file.size, file.lastModified] : null });
      if (!attempt.current?.submitted && (!attempt.current || attempt.current.signature !== signature)) attempt.current = { signature, key: crypto.randomUUID() };
      const current = attempt.current;
      if (!current) throw new Error('Could not start checkout. Please retry.');
      let body = current.submitted;
      if (!body) {
        const fresh = await refresh();
        if (!fresh) throw new Error('Could not confirm the current price or stock. Review your basket and retry.');
        if (!quote || fresh.total_minor !== quote.total_minor || fresh.coupon_code !== quote.coupon_code || fresh.coupon_version !== quote.coupon_version || JSON.stringify(fresh.items.map(i => i.unit_price_minor)) !== JSON.stringify(quote.items.map(i => i.unit_price_minor))) throw new Error('Your basket prices have updated. Review the new total before placing the order.');
        if (file && payment !== 'COD' && !current.receipt) {
          setSubmissionStage('receipt');
          const data = new FormData(); data.append('receipt', file);
          const response = await fetch('/api/payments/bank-transfer/receipt', { method: 'POST', headers: { 'Idempotency-Key': current.key, 'X-Checkout-Quote': fresh.token }, body: data, signal: AbortSignal.timeout(30000) });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error?.message || 'Receipt upload failed. Your order has not been placed. Please retry.');
          current.receipt = { path: result.data.receipt_path, proof: result.data.receipt_proof };
        }
        body = { ...payload, idempotency_key: current.key, quote_token: fresh.token, receipt_path: current.receipt?.path, receipt_proof: current.receipt?.proof };
        current.submitted = body; setRecovering(true);
        try { savePendingCheckout(window.sessionStorage, current); } catch { /* Keep the in-memory attempt if storage is blocked. */ }
      }
      setSubmissionStage('order');
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': current.key }, body: JSON.stringify({...body,journey:journeyContext()}), signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) {
        if (response.status < 500) {
          current.submitted = undefined; setRecovering(false);
          try { clearPendingCheckout(window.sessionStorage); } catch { /* Storage may be blocked. */ }
        }
        throw new Error(result.error?.message || 'Could not place your order. Your details are still here; please retry.');
      }
      if (!result.data?.order_number || !result.tracking_token) throw new Error('We could not confirm the response. Retry with the same details to recover your order.');
      try { clearPendingCheckout(window.sessionStorage); } catch { /* Storage may be blocked. */ }
      setRecovering(false); setSubmissionStage('complete'); setPlaced(true); completeOrder(body.items as CheckoutLine[]);
      identifyLead(result.data.lead_id,'checkout');
      trackEvent('order_confirmed',{total_minor:result.data.total_minor});
      router.push('/order/' + encodeURIComponent(result.data.order_number) + '?token=' + encodeURIComponent(result.tracking_token));
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection interrupted. Retry with the same details to recover your order safely.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  const field = (name: keyof typeof fields, label: string, type = 'text', complete?: string, required = true, max = 200) => <div className={name === 'shipping_address' ? 'sm:col-span-2' : ''}>
    <label htmlFor={name} className="field-label">{label}{!required && <span className="text-muted-gray font-normal"> {copy.text_optional}</span>}</label>
    <input className="form-input" id={name} name={name} type={type} autoComplete={complete} value={fields[name]} onChange={event => update(name, event.target.value)} required={required} maxLength={max} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? name + '-error' : undefined} />
    {errors[name] && <p id={name + '-error'} className="text-sm text-rose-700 mt-2">{errors[name]}</p>}
  </div>;
  if (!isLoaded) return <div className="store-container py-24" role="status">{copy.text_loading_your_basket}</div>;
  if (!items.length && !placed && !recovering) return <div className="store-container py-24 text-center"><h1 className="text-3xl mb-6">{copy.text_your_basket_is_empty}</h1><Link className="button-primary" href={links.href_shop}>{copy.text_explore_the_shop}</Link></div>;
  const accountNumber = payment === 'bank_transfer' ? settings?.bank_account_number : wallet === 'jazzcash' ? settings?.jazzcash_number : settings?.easypaisa_number;
  const accountTitle = payment === 'bank_transfer' ? settings?.bank_account_title : wallet === 'jazzcash' ? settings?.jazzcash_title : settings?.easypaisa_title;
  return <div className="store-container py-8 sm:py-14">
    <OrderProcessingOverlay open={busy || placed} stage={submissionStage} />
    <Link href={links.href_cart} className="inline-flex items-center gap-2 text-sm mb-8"><ArrowLeft size={16} />{copy.text_back_to_basket}</Link>
    <h1 className="text-3xl sm:text-4xl mb-2">{copy.text_checkout}</h1><p className="text-muted-gray mb-8">{copy.text_a_few_details_and_your_pantry_order_is_on_its_way_no_ac}</p>
    <form ref={formRef} onSubmit={placeOrder} aria-busy={busy || placed} noValidate className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-14">
      <fieldset disabled={busy || placed || recovering} className="min-w-0 space-y-8">
        <ManagedSection document="checkout" sectionId="page_section_01"><section className="checkout-section"><h2 className="text-xl mb-5">{copy.text_1_contact_details}</h2><div className="grid sm:grid-cols-2 gap-5">{field('customer_name', 'Full name', 'text', 'name')}{field('customer_email', 'Email address', 'email', 'email')}{field('customer_phone', 'Mobile number', 'tel', 'tel')}</div></section></ManagedSection>
        <ManagedSection document="checkout" sectionId="page_section_02"><section className="checkout-section"><h2 className="text-xl mb-5">{copy.text_2_delivery_address}</h2><div className="grid sm:grid-cols-2 gap-5">
          {field('shipping_address', 'House, street and area', 'text', 'street-address', true, 500)}
          <div><CheckoutCitySelect id="shipping_city" label={copy.text_city_town} value={fields.shipping_city} onChange={value => update('shipping_city', value)} invalid={!!errors.shipping_city} describedBy={errors.shipping_city ? 'shipping_city-error' : undefined} disabled={busy || recovering} />{errors.shipping_city && <p id="shipping_city-error" className="text-rose-700 text-sm mt-2">{errors.shipping_city}</p>}</div>
          <div><label className="field-label" htmlFor="shipping_province">{copy.text_province_region}</label><select id="shipping_province" name="shipping_province" className="form-input" value={fields.shipping_province} onChange={e => update('shipping_province', e.target.value)} autoComplete="address-level1">{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></div>
          {field('shipping_postal_code', 'Postal code', 'text', 'postal-code', false, 20)}
          <div className="sm:col-span-2"><label htmlFor="shipping_notes" className="field-label">{copy.text_delivery_instructions}<span className="font-normal text-muted-gray">{copy.text_optional_2}</span></label><textarea id="shipping_notes" name="shipping_notes" className="form-input" rows={3} maxLength={800} value={fields.shipping_notes} onChange={e => update('shipping_notes', e.target.value)} /></div>
        </div></section></ManagedSection>
        <ManagedSection document="checkout" sectionId="page_section_03"><section className="checkout-section"><fieldset><legend className="text-xl mb-5">{copy.text_3_payment_method}</legend><div className="space-y-3">{([{ value: 'COD', label: 'Cash on delivery', detail: 'Pay the courier when your parcel arrives.' }, { value: 'bank_transfer', label: 'Bank transfer', detail: 'Manual payment, verified before preparation.' }, { value: 'wallet_aggregator', label: 'JazzCash / Easypaisa', detail: 'Transfer to our configured wallet account.' }] as const).filter(method=>methodEnabled(method.value)).map(method => <label key={method.value} className={'payment-choice ' + (payment === method.value ? 'selected' : '')}><input type="radio" name="payment" value={method.value} disabled={method.value === "bank_transfer" && !bankReady || method.value === "wallet_aggregator" && !someWalletReady} checked={payment === method.value} onChange={() => choosePayment(method.value)} /><span><strong className="block">{method.label}</strong><span className="text-sm text-muted-gray">{method.value === "bank_transfer" && !bankReady ? "Currently unavailable. Contact us before transferring payment." : method.detail}</span></span></label>)}</div></fieldset>
          {payment !== 'COD' && <div className="mt-5 space-y-4 rounded-xl bg-cream p-5">
            {settingsError && <p role="alert">{settingsError} <button type="button" className="underline" onClick={() => void refreshSettings()}>{copy.text_retry}</button></p>}
            {payment === 'wallet_aggregator' && <fieldset className="flex flex-wrap gap-4"><legend className="sr-only">{copy.text_wallet_provider}</legend>{(['jazzcash', 'easypaisa'] as const).map(provider => <label key={provider} className="inline-flex gap-2 items-center min-h-11"><input type="radio" name="wallet" disabled={!walletAccountReady(provider)} checked={wallet === provider} onChange={() => { setWallet(provider); setFile(null); }} />{provider === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}</label>)}</fieldset>}
            {paymentReady ? <><p className="font-semibold">{payment === 'bank_transfer' ? settings?.bank_name : wallet === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}</p><p>{accountTitle}</p><div className="flex gap-3 items-center flex-wrap"><span className="break-all font-mono">{accountNumber}</span><button type="button" className="icon-button" aria-label={copied ? 'Account number copied' : 'Copy account number'} onClick={() => void copyAccount(accountNumber || '')}>{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>{payment === 'bank_transfer' && settings?.bank_iban && <p className="text-sm break-all">{copy.text_iban}{settings.bank_iban}</p>}<p>{copy.text_transfer_amount}<strong>{quote && !loading ? formatPKR(quote.total_minor) : 'Checking your total…'}</strong></p><p className="text-sm text-muted-gray">{copy.text_your_payment_will_remain_under_review_until_confirmed_b}</p></> : <p role="alert">{copy.text_account_details_are_unavailable_choose_cash_on_delivery}</p>}
            {payment === 'wallet_aggregator' && <div><label htmlFor="tid" className="field-label">{copy.text_transaction_id_optional}</label><input id="tid" className="form-input" value={tid} onChange={e => setTid(e.target.value)} maxLength={100} /></div>}
            <div><label htmlFor="receipt" className="field-label">{copy.text_payment_receipt}{payment === 'bank_transfer' ? '(required)' : '(optional)'}</label><input type="file" id="receipt" disabled={!settings?.receipt_upload_available} accept="image/jpeg,image/png,application/pdf" onChange={e => uploadFile(e.target.files?.[0])} className="form-input text-sm" /><p className="text-sm text-muted-gray mt-2">{file ? file.name + ' attached. ' : ''}{settings?.receipt_upload_available ? "JPG, PNG or PDF, up to 4 MB." : "Receipt uploads are currently unavailable. Keep your transaction ID for manual verification."}</p>{file && <button type="button" className="text-sm underline min-h-11" onClick={() => { setFile(null); const input = document.getElementById('receipt') as HTMLInputElement; if (input) input.value = ''; }}>{copy.text_remove_receipt}</button>}</div>
          </div>}
        </section></ManagedSection>
      </fieldset>
      <aside className="lg:sticky lg:top-28 self-start checkout-section space-y-5">
        <h2 className="text-xl">{recovering ? 'Previous order confirmation' : 'Your order'}</h2>{recovering ? <p className="text-sm text-muted-gray">{copy.text_we_will_recover_the_original_submitted_basket_and_total}</p> : <details open className="border-b border-border-gray pb-5"><summary className="text-sm cursor-pointer min-h-11">{items.reduce((n, item) => n + item.quantity, 0)} {copy.text_items}<Link href={links.href_cart} className="underline ml-2">{copy.text_edit_basket}</Link></summary><div className="space-y-4 mt-3">{items.map(item => { const line = quote?.items.find(l => l.product_id === item.product_id && l.variant_id === item.variant_id && l.kit_id === item.kit_id); return <div key={item.id} className="flex gap-3 items-center"><div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-lg"><Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" /></div><div className="flex-1 min-w-0 text-sm"><p className="font-medium">{item.name}</p><p className="text-muted-gray">{item.variant_label} {copy.text_qty}{item.quantity}</p></div><span className="text-sm">{line ? formatPKR(line.line_total_minor) : '—'}</span></div>; })}</div></details>}
        {!recovering && syncError && <p role="alert" className="text-sm text-rose-700">{syncError} <button type="button" onClick={() => void syncLivePrices()} className="underline">{copy.text_retry}</button></p>}
        {!recovering && quoteError && <p role="alert" className="text-sm text-rose-700">{quoteError} <button type="button" className="underline" onClick={() => void refresh()}>{copy.text_update_total}</button></p>}
        <CouponControls quote={quote} customerEmail={fields.customer_email} disabled={busy || placed || recovering || isSyncing} />
        {!recovering && quote && <dl className="space-y-3"><div className="flex justify-between"><dt>{copy.text_subtotal}</dt><dd>{formatPKR(quote.subtotal_minor)}</dd></div><div className="flex justify-between"><dt>{copy.text_delivery}</dt><dd>{quote.shipping_minor ? formatPKR(quote.shipping_minor) : 'Free'}</dd></div>{!!quote.discount_minor && <div className="flex justify-between gap-3 text-seedly-primary"><dt>Discount <span className="text-xs">({quote.coupon_code})</span></dt><dd>−{formatPKR(quote.discount_minor)}</dd></div>}<div className="flex justify-between border-t border-border-gray pt-4 text-xl font-semibold"><dt>{copy.text_total}</dt><dd>{formatPKR(quote.total_minor)}</dd></div></dl>}
        {!recovering && (loading || isSyncing) && <p role="status" className="text-sm">{copy.text_checking_current_prices_and_stock}</p>}
        {!recovering && hasFieldErrors && <p role="alert" className="text-sm text-rose-700 bg-rose-50 p-4 rounded-lg">{copy.text_please_correct_the_highlighted_fields}</p>}
        {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 p-4 rounded-lg">{error}</p>}
        {!recovering && settings && !settings.ordering_available && <p role="alert" className="text-sm text-rose-700 bg-rose-50 p-4 rounded-lg">{copy.text_ordering_is_temporarily_unavailable_please}<Link className="underline" href={links.href_contact}>{copy.text_contact_our_team}</Link> {copy.text_before_transferring_payment}</p>}
        {!recovering && settingsError && <p role="alert" className="text-sm text-rose-700">{settingsError} <button type="button" className="underline" onClick={() => void refreshSettings()}>{copy.text_retry}</button></p>}
        <button type="submit" disabled={busy || placed || (!recovering && (!quote || loading || isSyncing || !!syncError || !paymentReady))} className="button-primary w-full">{busy ? 'Confirming your order…' : recovering ? 'Recover order confirmation' : 'Confirm order'}</button>
        <p className="text-sm text-muted-gray">{copy.text_by_placing_your_order_you_agree_to_our}<Link href={links.href_terms} className="underline">{copy.text_terms}</Link> {copy.text_and}<Link href={links.href_shipping} className="underline">{copy.text_delivery_policy}</Link>.</p><Link className="text-sm underline" href={links.href_contact}>{copy.text_need_help_with_your_order}</Link>
      </aside>
    </form>
  </div>;
}
