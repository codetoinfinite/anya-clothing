"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Server code can't see the request path without middleware (unsupported in Vercel services),
// so the client sends the user to login with the page they asked for.
export function RedirectToLogin() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    router.replace(`/login?from=${encodeURIComponent(pathname + window.location.search)}`);
  }, [router, pathname]);
  return null;
}
