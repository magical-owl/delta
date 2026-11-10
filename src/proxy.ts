import { auth0 } from "@/lib/auth/auth0-client";

/**
 * Next.js 16 proxy — replaces middleware.ts.
 *
 * The Auth0 SDK middleware intercepts all /auth/* routes automatically
 * (login, callback, logout, profile, access-token).
 *
 * Protected paths (/dashboard/*) will be redirected to /auth/login when
 * no session cookie is present.
 */
export async function proxy(request: Request) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
