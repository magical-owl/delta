import { Auth0Client } from "@auth0/nextjs-auth0/server";

/**
 * Singleton Auth0 client instance.
 *
 * Configuration is loaded from environment variables at runtime:
 *   AUTH0_DOMAIN           — your Auth0 tenant domain (e.g. example.us.auth0.com)
 *   AUTH0_CLIENT_ID        — Auth0 application client ID
 *   AUTH0_CLIENT_SECRET    — Auth0 application client secret
 *   AUTH0_SECRET           — 32-byte hex secret for cookie encryption (openssl rand -hex 32)
 *   APP_BASE_URL           — optional; SDK infers from request host when omitted
 *
 * The middleware / proxy function automatically handles all routes under /auth/*:
 *   /auth/login      — initiates the OIDC authorization flow
 *   /auth/callback   — handles the OAuth callback
 *   /auth/logout     — logs the user out
 *   /auth/profile    — returns session user JSON
 */
export const auth0 = new Auth0Client();
