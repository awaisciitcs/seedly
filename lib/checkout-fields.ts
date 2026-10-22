export interface CheckoutFields {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  shipping_notes: string;
}

/** Shared browser/server limits: never silently truncate a delivery address. */
export const CHECKOUT_FIELD_LIMITS: Record<keyof CheckoutFields, number> = {
  customer_name: 100, customer_email: 254, customer_phone: 40,
  shipping_address: 500, shipping_city: 100, shipping_province: 100,
  shipping_postal_code: 20, shipping_notes: 1000,
};
const invalidControl = /[\u0000-\u001f\u007f]/;

export function validateCheckoutFields(fields: CheckoutFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (fields.customer_name.trim().length < 2) errors.customer_name = 'Enter your full name.';
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(fields.customer_email.trim())) errors.customer_email = 'Enter a valid email address.';
  if (!/^(\+92|0092|92|0)?3\d{9}$/.test(fields.customer_phone.replace(/[\s()-]/g, ''))) errors.customer_phone = 'Enter a Pakistani mobile number, for example 0300 1234567.';
  if (fields.shipping_address.trim().length < 8) errors.shipping_address = 'Include your house, street and area.';
  if (fields.shipping_city.trim().length < 2) errors.shipping_city = 'Enter your city.';
  if (fields.shipping_province.trim().length < 2) errors.shipping_province = 'Select your province or region.';
  for (const field of Object.keys(CHECKOUT_FIELD_LIMITS) as (keyof CheckoutFields)[]) {
    const value = fields[field];
    // Delivery notes may contain ordinary newlines and tabs; identifiers may not.
    const controlValue = field === 'shipping_notes' ? value.replace(/[\t\r\n]/g, '') : value;
    if (invalidControl.test(controlValue)) errors[field] = 'Remove unsupported control characters.';
    else if (value.length > CHECKOUT_FIELD_LIMITS[field]) errors[field] = 'Use at most ' + CHECKOUT_FIELD_LIMITS[field] + ' characters.';
  }
  return errors;
}
