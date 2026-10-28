export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORDER_MANAGER: 'order_manager',
  SUPPORT_ADMIN: 'support_admin'
};

export const EMAIL_TEMPLATES = {
  ORDER_CREATED: 'ORDER_CREATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  ADMIN_NEW_ORDER_ALERT: 'ADMIN_NEW_ORDER_ALERT',
  PASSWORD_RESET_OTP: 'PASSWORD_RESET_OTP'
};

export const DEFAULT_PRODUCT = {
  name: 'Sathru Samhara Maha Yagam',
  slug: 'soora-samhara-pooja-box-2026',
  priceInPaise: 250000, // ₹2,500
  currency: 'INR',
  maxQuantityPerOrder: 20,
  minQuantityPerOrder: 1,
  eventDate: '2026-11-15T00:00:00+05:30',
  eventLocation: 'Thiruttani',
  eventTamilTitle: 'சத்ரு சம்ஹார மஹா யாகம்',
  insideBoxConfig: {
    eyebrow: 'Inside the box',
    title: '',
    description: 'Everything is packed as one box and travels together from temple to temple, ending at the Maha Yaagam in Thiruttani.'
  },
  contactConfig: {
    title: 'Contact Sri Sankara TV',
    tamilTitle: 'தொடர்புக்கு / உதவிக்கு',
    description: 'For any queries regarding the sacred Sathru Samhara Maha Yagam Pooja Box, booking assistance, temple travels, or delivery inquiries, our devotional care team is available to assist you.',
    phone1: '95917 47001',
    phone2: '95917 47002',
    email: 'Srisankaratvshop@gmail.com',
    whatsapp: '95917 47001',
    timings: 'Monday – Saturday: 9:00 AM – 8:00 PM IST',
    address: 'Sri Sankara TV Devotional Support Desk'
  }
};
