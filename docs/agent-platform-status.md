# Switch Agent Platform Status

This document records the validation status of the VS Code/Codespaces agent platform configuration.

## Scope

- VS Code MCP workspace configuration
- Switch Plan, Dev, Audit, and Deploy custom agents
- Repository-wide agent safety rules

## Validation gates

The configuration is considered merge-ready only when the repository CI confirms:

1. dependency policy checks pass
2. type and lint checks pass
3. formatting checks pass
4. tests pass
5. worker builds pass
6. security scanning passes

Production deployment remains a separate decision and must not be inferred from configuration validation alone.
