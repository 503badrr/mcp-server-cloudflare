# Switch unified MCP release

The first Switch release selects only `apps/workers-observability` from this
monorepo. Other applications remain source dependencies or future candidates;
the unified release does not deploy them.

## Why this application

- It exposes read-only Workers log and metrics tools needed for release support.
- It already uses the Cloudflare Workers OAuth provider.
- Its MCP endpoints are scoped to `/mcp` and `/sse`.
- It has focused tests and a dedicated Wrangler configuration.

## Release gate

The repository quality workflow is deliberately non-deploying. Before a later
deployment, the release operator must:

1. Replace the upstream Cloudflare account, routes, KV IDs, Vectorize index, and
   Analytics Engine dataset with resources owned by the Switch account.
2. Configure `CLOUDFLARE_CLIENT_ID`, `CLOUDFLARE_CLIENT_SECRET`, and
   `MCP_COOKIE_ENCRYPTION_KEY` as Wrangler secrets, never as plain `vars`.
3. Configure the OAuth callback URL for the final Switch hostname.
4. Confirm consent, CSRF/state binding, redirect URI validation, and token expiry
   using a staging identity.
5. Run the MCP Inspector against staging and verify that no write-capable tools
   are exposed beyond the intended Cloudflare scopes.

Do not run the existing staging or production deployment commands for this fork:
their checked-in identifiers and hostnames belong to the upstream project.

## Local quality commands

```bash
pnpm install --frozen-lockfile
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
`apps/graphql` Wrangler migration (`UserDetails` is deleted without an
earlier class declaration). The release uses the passing 40-task
`check:turbo` gate and the two focused observability type checks instead of
changing that unrelated application.
