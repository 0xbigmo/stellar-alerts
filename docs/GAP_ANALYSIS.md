# Gap Analysis: Vision vs. Verified Reality

## 1. Executive Comparison

| Long-Term Product Goal | Planned Vision | Verified Reality | Gap Status |
| :--- | :--- | :--- | :--- |
| **A. Non-Custodial Wallet Monitoring** | Users register public keys (`G...`) with zero secret exposure. Real-time updates without wallet signing. | Read-only model respected on registration, but **cross-user wallet deletion** is unauthenticated against owner ID (`removeWallet`). Ingestion worker syntax broken. | **Critical Defect (P0/P1)** |
| **B. Web Dashboard** | Unified dashboard showing wallets, incoming payments, and delivery stats. | Next.js 16 dashboard is fully functional with 335 passing tests, polling fallback, and WebSocket live event relay. | **Minor Polish (P2)** |
| **C. External Notification Channels** | Telegram, WhatsApp, Discord, Slack, and Webhook notifications with delivery retry and DLQ. | BullMQ queue and dispatchers are largely implemented; however, Slack and Discord webhook health status checks are unverified, and Telegram mini-app synchronization is only partially wired. | **Partial (P1/P2)** |
| **D. Developer & API Capabilities** | REST API with API keys, usage quotas, rate limits, and webhook event subscriptions. | REST endpoints require personal user JWTs; there are no programmatic developer API keys, no organization/team scoping, and rate limits are IP-only. | **Missing Architecture (P2/P3)** |

---

## 2. Detailed Gap Prioritization

### P0 — Critical (Immediate Core Failures)
1. **Watcher Worker Syntax Corruption**: `apps/api/src/workers/watcher.worker.ts` fails compilation with 13 syntax errors caused by malformed merge conflict resolutions in commit `a62772f`. Real-time transaction ingestion is dead in the water.
2. **Operations Runbooks Test Failure**: `apps/api/src/__tests__/operations-runbooks.test.ts` has unclosed braces preventing test suite execution.

### P1 — High (Core Security & Integration Deficiencies)
1. **IDOR on Wallet Deletion**: `WalletsService.removeWallet(id)` deletes by primary key without scoping by `userId`, allowing any authenticated user to delete another user's monitored wallet.
2. **Missing `asHorizonOperationRecords` Import in `stellar.ts`**: Causes runtime `ReferenceError`s during payment catch-up paging.
3. **CLI Profile Command Inconsistency**: `packages/cli` test suite fails 35 assertions because CLI subcommands (`update`, `remove`) drifted from PR #450 specs.
4. **CLI `stream.ts` Syntax Corruption**: Syntax errors in `packages/cli/src/commands/stream.ts` prevent CLI payment streaming.

### P2 — Medium (Reliability, Tooling & Frontend Maintainability)
1. **Frontend Linter Error in `sse-client.ts`**: Variable `connect` accessed before declaration, causing ESLint failure in web workspace.
2. **Discord / Slack Dynamic Webhook Status Checks**: Missing automated validation for dead webhook endpoints before enqueueing.
3. **Hardcoded NextAuth Fallback Secret**: Warning thrown in CI build logs when `NEXTAUTH_SECRET` is unset.

### P3 — Future (Platform Expansion)
1. **Dedicated Developer API Keys**: Multi-tenant API key management with token bucket quotas.
2. **Soroban SAC Token Incentives**: On-chain reward mechanisms (planned in Phase 5 of roadmap).
