# Long-Term Development Roadmap: Stellar Alerts

## 1. Roadmap Architecture & Phasing Principles

Our technical strategy prioritizes **system stabilization, non-custodial data security, and verifiable core operations** before expanding to external integrations and developer API offerings.

---

## 2. Milestone Overview

| Milestone | Objective | Key Deliverables | Risk Level |
| :--- | :--- | :--- | :--- |
| **Milestone 1 (Immediate)** | **Core Stabilization & Security Hardening** | Fix watcher compilation syntax, patch cross-tenant wallet deletion IDOR, fix broken runbook tests, resolve CLI stream syntax, align CLI profile subcommands. | High (Critical Fixes) |
| **Milestone 2** | **Horizon SSE Ingestion & Ingestion Health** | Fix `asHorizonOperationRecords` import in `stellar.ts`, restore 100% passing API unit tests, verify cursor gap detection and bounded backfill recovery. | Medium |
| **Milestone 3** | **Multi-Channel Notification Reliability** | Validate dynamic webhook health checks, harden Discord/Slack dispatchers, refine Telegram sync/mini-app verification. | Medium |
| **Milestone 4** | **Developer Platform & Programmatic API Keys** | Introduce scoped API keys, per-key rate limits and token buckets, OpenAPI documentation sync, and webhook subscription SDK. | Low |
| **Milestone 5** | **Ecosystem Scale & Soroban SAC Automation** | SAC token analytics worker optimization, automated Playwright E2E browser test suite, and Soroban SAC reward contract integration. | Low |

---

## 3. Specification of Milestone 1: Core Stabilization & Security Hardening

### 3.1 Objective
Restore the project to a cleanly compiling, secure baseline where all workspace packages pass typechecking and critical authorization boundaries are enforced.

### 3.2 Scope of Changes
1. **Fix Ingestion Worker Syntax**:
   - Repair `apps/api/src/workers/watcher.worker.ts` around lines 102–115, restoring proper `try/catch` encapsulation around SAC token metadata discovery.
2. **Enforce Tenant Scoping on Wallet Deletion (Security P0)**:
   - Update `WalletsService.removeWallet(userId, id)` in `apps/api/src/modules/wallets/wallets.service.ts` to include `where: { id, userId }`.
   - Update `WalletsController.deleteWallet` in `apps/api/src/modules/wallets/wallets.controller.ts` to forward `request.user.id`.
3. **Fix Operations Runbook Test**:
   - Correct the unclosed brace in `apps/api/src/__tests__/operations-runbooks.test.ts`.
4. **Fix CLI Stream Syntax & Profile Commands**:
   - Correct call syntax in `packages/cli/src/commands/stream.ts`.
   - Align `packages/cli/src/commands/profile.ts` with test suite and `docs/CLI_PROFILES.md`.
5. **Fix Web Workspace ESLint Violation**:
   - Adjust `connect` declaration order in `apps/web/src/lib/sse-client.ts`.

### 3.3 Acceptance Criteria
- `npm run typecheck --workspace=api` exits with code 0.
- `npm run typecheck --workspace=web` exits with code 0.
- `npm run typecheck --workspace=packages/shared` exits with code 0.
- Calling `DELETE /wallets/:id` with a token belonging to User B for a wallet owned by User A returns `404 Not Found` and leaves the wallet intact.
- `npm test --workspace=packages/cli` passes without errors.
- `npm run lint --workspace=web` passes with 0 errors.

### 3.4 Explicit Exclusions
- No database migrations or schema adjustments.
- No new external notification providers or API endpoints.
- No changes to frontend UI design or CSS styling.
