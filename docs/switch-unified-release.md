# Switch unified MCP release

The first Switch release selects only `apps/workers-observability` from this
monorepo. Other applications remain source dependencies or future candidates;
the unified release does not deploy them.

## Why this application

- It exposes read-only Workers log and metrics tools needed for release support.
- It already uses the Cloudflare Workers OAuth provider.
- Its MCP endpoints are scoped to `/mcp` and `/sse`.
- It has focused tests and a dedicated Wrangler configuration.

## Enforced deployment gate

The repository quality workflow is deliberately non-deploying. The checked-in
Wrangler file is detached from every account, contains explicit
`REPLACE_WITH_SWITCH_*` resource placeholders, has no staging or production
environment, and disables both `workers.dev` and preview URLs. CI rejects any
reintroduction of the upstream account, routes, KV namespaces, or Sentry DSN.

The required OAuth values are declared through `secrets.required` so Wrangler
can reject a deployment that does not have all three encrypted secrets. They
must never be stored in plain `vars`.

## Owner provisioning checklist

Before adding a deploy workflow or running `wrangler deploy`, the release owner
must complete every item below in the Switch Cloudflare account:

1. Create dedicated staging and production KV namespaces for `OAUTH_KV`.
2. Create staging and production Vectorize indexes compatible with the selected
   embedding model, and create separate Analytics Engine datasets for
   `MCP_METRICS`.
3. Choose Switch-owned Worker names, the Switch account ID, and final staging
   and production hostnames. Do not reuse any `*.mcp.cloudflare.com` hostname.
4. Create the Cloudflare OAuth applications and register each final
   `<MCP_HOSTNAME>/oauth/callback` redirect URI.
5. Set `CLOUDFLARE_CLIENT_ID`, `CLOUDFLARE_CLIENT_SECRET`, and
   `MCP_COOKIE_ENCRYPTION_KEY` as encrypted Wrangler secrets in both
   environments. Generate the cookie key from at least 32 random bytes and do
   not place secret values in GitHub, documentation, logs, or chat.
6. Replace the resource placeholders and add explicit staging/production
   environments in a reviewed PR. Update the CI allowlist in the same PR so it
   validates only the new Switch-owned identifiers.
7. Confirm consent, PKCE, CSRF/state binding, redirect URI validation, refresh
   behavior, and token expiry using a staging identity.
8. Run MCP Inspector against staging and verify that no write-capable tools are
   exposed beyond the intended Cloudflare scopes.

Until all items are evidenced, the `-unprovisioned` Worker name and the CI guard
must remain in place.

## Local quality commands

```bash
pnpm install --frozen-lockfile
node .github/scripts/validate-switch-cloudflare-config.mjs apps/workers-observability/wrangler.jsonc
pnpm check:deps
pnpm check:turbo
pnpm check:format
pnpm test:ci
pnpm --filter @repo/mcp-observability types
pnpm --filter workers-observability check:types
```

The `@repo/mcp-observability` package uses `tsc --noEmit`; it is a library and
does not have a standalone Wrangler configuration from which to generate
bindings.

The root `pnpm types` generator remains blocked by the unselected
`apps/graphql` Wrangler migration (`UserDetails` is deleted without an earlier
class declaration). The release uses the passing 40-task `check:turbo` gate and
the two focused observability type checks instead of changing that unrelated
application.
