import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const isProd = process.env.NODE_ENV === "production";

const s3Configured = Boolean(
  process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET
);

const stripeConfigured = Boolean(process.env.STRIPE_API_KEY);

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") ?? "shared",
    http: {
      storeCors: process.env.STORE_CORS ?? "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS ?? "http://localhost:9000,http://localhost:7001",
      authCors: process.env.AUTH_CORS ?? "http://localhost:3000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
      cookieSecret: process.env.COOKIE_SECRET ?? "dev-cookie-secret-change-me",
    },
  },
  admin: {
    disable: process.env.DISABLE_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  },
  modules: [
    { resolve: "./src/modules/blog" },
    { resolve: "./src/modules/review" },
    { resolve: "./src/modules/wishlist" },
    { resolve: "./src/modules/newsletter" },
    { resolve: "./src/modules/contact" },
    { resolve: "./src/modules/cms" },
    { resolve: "./src/modules/activity" },
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { redis: { url: process.env.REDIS_URL } },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          s3Configured
            ? {
                resolve: "@medusajs/medusa/file-s3",
                id: "s3",
                options: {
                  file_url: process.env.S3_FILE_URL,
                  access_key_id: process.env.S3_ACCESS_KEY_ID,
                  secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  region: process.env.S3_REGION,
                  bucket: process.env.S3_BUCKET,
                  endpoint: process.env.S3_ENDPOINT,
                  additional_client_config: {
                    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
                  },
                  cache_control: process.env.S3_CACHE_CONTROL,
                },
              }
            : {
                resolve: "@medusajs/medusa/file-local",
                id: "local",
                options: {
                  upload_dir: "static",
                  backend_url: `${process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"}/static`,
                },
              },
        ],
      },
    },
    ...(stripeConfigured
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
  featureFlags: {
    medusa_v2: true,
  },
  ...(isProd ? { plugins: [] } : {}),
});
