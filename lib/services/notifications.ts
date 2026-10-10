import { formatPKR } from '../utils';

export interface NotificationPayload {
  type: 'ORDER_CREATED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REJECTED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED';
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalMinor: number;
  paymentMethod?: string;
  trackingCourier?: string;
  trackingNumber?: string;
  rejectionReason?: string;
}

export interface DispatchedLog {
  id: string;
  timestamp: string;
  channel: 'WhatsApp' | 'Email';
  recipient: string;
  subject: string;
  message: string;
  status: 'SENT';
}

const dispatchHistory: DispatchedLog[] = [];

export function dispatchNotification(payload: NotificationPayload) {
  const timestamp = new Date().toISOString();
  const amountStr = formatPKR(payload.totalMinor);

  let emailSubject = '';
  let emailBody = '';
  let whatsappBody = '';

  switch (payload.type) {
    case 'ORDER_CREATED': {
      const paymentNote = payload.paymentMethod === 'COD'
        ? 'Payment is due on delivery. Preparation has not started yet.'
        : 'Your payment must be verified by our team before preparation begins.';
      emailSubject = `Your Seedly order ${payload.orderNumber} is received`;
      emailBody = `Dear ${payload.customerName},\n\nWe have received order ${payload.orderNumber}, totaling ${amountStr}.\n\n${paymentNote}\nTrack your order: https://seedly.pk/order/${payload.orderNumber}`;
      whatsappBody = `Salam ${payload.customerName}! Your Seedly order #${payload.orderNumber} (${amountStr}) has been received.\n\n${paymentNote}\nTrack your order: https://seedly.pk/order/${payload.orderNumber}`;
      break;
    }

    case 'PAYMENT_CONFIRMED':
      emailSubject = `Payment confirmed: order ${payload.orderNumber}`;
      emailBody = `Dear ${payload.customerName},\n\nYour payment for order ${payload.orderNumber} has been verified. Preparation and packing will be updated separately by our team.\nTrack your order: https://seedly.pk/order/${payload.orderNumber}`;
      whatsappBody = `Salam ${payload.customerName}! Payment for Seedly order #${payload.orderNumber} is verified. Preparation and packing will be updated separately.\nTrack your order: https://seedly.pk/order/${payload.orderNumber}`;
      break;

    case 'PAYMENT_REJECTED':
      emailSubject = `Action Needed: Payment for Order ${payload.orderNumber}`;
      emailBody = `Dear ${payload.customerName},\n\nWe were unable to verify your bank transfer receipt for order ${payload.orderNumber}.\nReason: ${payload.rejectionReason || 'Receipt image unreadable or mismatched amount'}.\n\nPlease reply with an updated screenshot or reach us on WhatsApp.`;
      whatsappBody = `⚠️ *Seedly Pakistan*\n\nSalam ${payload.customerName}. We could not verify the transfer receipt for order *#${payload.orderNumber}*. Reason: ${payload.rejectionReason || 'Mismatched amount'}. Please reply with a clear receipt to process.`;
      break;

    case 'ORDER_SHIPPED':
      emailSubject = `Dispatched: Seedly Order ${payload.orderNumber} is on the way!`;
      emailBody = `Dear ${payload.customerName},\n\nGreat news! Your Seedly package has been handed over to ${payload.trackingCourier} with tracking number: ${payload.trackingNumber}.\n\nEstimated delivery within Pakistan is 1–3 business days.`;
      whatsappBody = `📦 *Seedly Order Dispatched!*\n\nSalam ${payload.customerName}! Your package is on the way via *${payload.trackingCourier}*.\nTracking Number: *${payload.trackingNumber}*\nTrack online: https://seedly.pk/order/${payload.orderNumber}`;
      break;

    case 'ORDER_DELIVERED':
      emailSubject = `Delivered: Your Seedly Wellness Package Has Arrived`;
      emailBody = `Dear ${payload.customerName},\n\nYour Seedly order ${payload.orderNumber} has been delivered! We hope you love your fresh seeds and calming herbal teas. Take a moment to share your experience with us.`;
      whatsappBody = `🌿 *Delivered!* Salam ${payload.customerName}. Your Seedly order *#${payload.orderNumber}* has been delivered safely. May it nourish your daily ritual! Let us know how you enjoy it.`;
      break;
  }

  // Push to in-memory notification log
  dispatchHistory.unshift(
    {
      id: `notif-email-${Date.now()}`,
      timestamp,
      channel: 'Email',
      recipient: payload.customerEmail,
      subject: emailSubject,
      message: emailBody,
      status: 'SENT',
    },
    {
      id: `notif-wa-${Date.now()}`,
      timestamp,
      channel: 'WhatsApp',
      recipient: payload.customerPhone,
      subject: 'WhatsApp Order Alert',
      message: whatsappBody,
      status: 'SENT',
    }
  );

  console.log(`[Notification dispatched] [${payload.type}] to ${payload.customerPhone} / ${payload.customerEmail}`);
}

export function getDispatchedNotifications(): DispatchedLog[] {
  return dispatchHistory.slice(0, 30);
}

export interface StockAlertNotificationPayload {
  type: 'STOCK_ALERT_CONFIRMATION' | 'STOCK_ALERT_ADMIN_ALERT' | 'STOCK_ALERT_BACK_IN_STOCK';
  email: string;
  sellableTitle: string;
  unsubscribeToken?: string;
  productUrl?: string;
}

export function dispatchStockAlertNotification(payload: StockAlertNotificationPayload) {
  const timestamp = new Date().toISOString();
  let subject = '';
  let message = '';

  switch (payload.type) {
    case 'STOCK_ALERT_CONFIRMATION':
      subject = `Restock Alert Confirmed: ${payload.sellableTitle} | Seedly`;
      message = `Salam,\n\nThank you for your interest! We have registered your restock notification for "${payload.sellableTitle}".\n\nAs soon as this botanical batch is replenished and passes purity inspection, we will email you directly so you can complete your order.\n\nTo manage or cancel this alert at any time:\nhttps://seedly.pk/api/stock-alerts/unsubscribe?token=${payload.unsubscribeToken || ''}`;
      break;

    case 'STOCK_ALERT_ADMIN_ALERT':
      subject = `[Admin] Back-In-Stock Subscriber: ${payload.sellableTitle}`;
      message = `Customer (${payload.email}) just subscribed to back-in-stock alerts for:\n${payload.sellableTitle}\n\nReview active subscriber demand in the Seedly Operations Desk.`;
      break;

    case 'STOCK_ALERT_BACK_IN_STOCK':
      subject = `Back In Stock: ${payload.sellableTitle} is Ready to Ship | Seedly`;
      message = `Salam,\n\nWonderful news! "${payload.sellableTitle}" is officially back in stock and freshly packed for nationwide dispatch.\n\nSince quantities can be limited, secure your harvest now:\n${payload.productUrl || 'https://seedly.pk/shop'}\n\nTo unsubscribe from future alerts for this item:\nhttps://seedly.pk/api/stock-alerts/unsubscribe?token=${payload.unsubscribeToken || ''}`;
      break;
  }

  dispatchHistory.unshift({
    id: `notif-stock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    channel: 'Email',
    recipient: payload.email,
    subject,
    message,
    status: 'SENT',
  });

  console.log(`[Stock Alert Dispatched] [${payload.type}] to ${payload.email} for "${payload.sellableTitle}"`);
}

