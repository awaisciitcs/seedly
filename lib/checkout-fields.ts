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

export function validateCheckoutFields(fields: CheckoutFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (fields.customer_name.trim().length < 2) errors.customer_name = 'Enter your full name.';
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(fields.customer_email.trim())) errors.customer_email = 'Enter a valid email address.';
  if (!/^(\+92|0092|92|0)?3\d{9}$/.test(fields.customer_phone.replace(/[\s()-]/g, ''))) errors.customer_phone = 'Enter a Pakistani mobile number, for example 0300 1234567.';
  if (fields.shipping_address.trim().length < 8) errors.shipping_address = 'Include your house, street and area.';
  if (fields.shipping_city.trim().length < 2) errors.shipping_city = 'Enter your city.';
  return errors;
}
