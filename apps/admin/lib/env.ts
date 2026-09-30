export const env = {
  MEDUSA_URL: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  COOKIE_NAME: process.env.ADMIN_COOKIE_NAME ?? "byshree_admin",
  COOKIE_DOMAIN: process.env.ADMIN_COOKIE_DOMAIN || undefined,
  IS_PROD: process.env.NODE_ENV === "production",
};
