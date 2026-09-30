import { defineMiddlewares, authenticate } from "@medusajs/framework/http";
import { logActivityMiddleware } from "./utils/activity";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      middlewares: [logActivityMiddleware],
    },
    {
      matcher: "/admin/blog*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/reviews*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/wishlist*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/newsletter*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/contact*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/cms*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/activity*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/store/wishlist*",
      middlewares: [authenticate("customer", ["session", "bearer"], { allowUnauthenticated: false })],
    },
  ],
});
