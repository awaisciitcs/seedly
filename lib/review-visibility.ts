// These four IDs belong to the demonstration testimonials in db/seed.ts.
// Keep those records available to the admin, but never present them as customer
// feedback or include them in public rating totals.
export const PUBLIC_REVIEW_FILTER = "status = 'APPROVED' AND id NOT IN ('rev-1', 'rev-2', 'rev-3', 'rev-4')";
