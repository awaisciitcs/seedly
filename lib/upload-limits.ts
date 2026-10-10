/** Keep multipart requests below Vercel's 4.5 MB function payload limit. */
export const MAX_UPLOAD_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_BODY_BYTES = MAX_UPLOAD_FILE_BYTES + 64_000;
