# Switch MCP Agent Rules

These rules apply to AI-assisted work in this repository.

## Safety boundaries

- Never commit API keys, OAuth tokens, service-role keys, payment secrets, or production credentials.
- Use OAuth for interactive MCP access where supported and least-privilege tokens for automation.
- Treat Supabase MCP as development/testing only. Keep the shared workspace endpoint read-only.
- Do not perform production deployment until CI and security review are complete.
- Do not bypass existing Cloudflare deployment guards or repository checks.

## Engineering workflow

1. Plan the smallest behavior-compatible change.
2. For code behavior changes, add or update tests before implementation where practical.
3. Run dependency, type/lint, format, and test checks relevant to changed packages.
4. Review MCP capabilities and tool permissions for least privilege.
5. Use a pull request; avoid direct production changes from an unreviewed branch.
6. Record verification evidence before claiming a change is complete.

## Standard verification

```bash
pnpm check:deps
pnpm check:turbo
pnpm check:format
pnpm test:ci
```

Run package-specific type checks when the changed app or package provides them.
