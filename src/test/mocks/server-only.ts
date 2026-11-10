// No-op mock for 'server-only' in Vitest tests.
// The real package throws at import to prevent server modules from being
// bundled into client code. In tests there is no client/server boundary,
// so we simply export nothing.
export {};
