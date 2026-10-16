# Baseline Verification: Stellar Alerts

## 1. Environment & Runtime Context
- **Node.js**: v22.15.0 (Repository `.nvmrc` specifies `20`)
- **npm**: 11.19.0
- **Docker**: Docker 28.1.1 installed; local daemon pipe not running during test execution (PostgreSQL & Redis services mocked or running via Vitest in-memory mocks).
- **Environment Files**:
  - `apps/api/.env` (Present)
  - `apps/web/.env.local` (Present)

---

## 2. Workspace Check Results Matrix

| Workspace / Target | Command | Result | Notes / Error Details |
| :--- | :--- | :--- | :--- |
| **Prisma Schema** | `npx prisma validate` | ✅ **PASS** | Valid schema across 852 lines, 27 models. |
| **Web Typecheck** | `npm run typecheck --workspace=web` | ✅ **PASS** | TypeScript compiles cleanly with zero diagnostics. |
| **Shared Typecheck**| `npm run typecheck --workspace=packages/shared` | ✅ **PASS** | Zero type errors. |
| **Shared Unit Tests**| `npm test --workspace=packages/shared` | ✅ **PASS** | 2 test files, 34 tests passed (StrKey checksums, runtime config). |
| **Web Unit Tests** | `npm test --workspace=web` | ✅ **PASS** | 38 test files, 335 tests passed in 94.72s. |
| **Web Lint** | `npm run lint --workspace=web` | ❌ **FAIL** (1 error, 29 warnings) | `apps/web/src/lib/sse-client.ts:79`: `connect` referenced before declaration in `react-hooks/immutability`. |
| **API Typecheck** | `npx tsc --noEmit -p apps/api/tsconfig.json` | ❌ **FAIL** | 13 syntax errors in `watcher.worker.ts` + missing `setReadTarget` / `env` in mocking layer. |
| **API Unit Tests** | `npm run test:unit --workspace=api` | ❌ **FAIL** | 125 passed, 41 failed (22 test failures, syntax errors in worker & runbooks). |
| **CLI Unit Tests** | `npm test --workspace=packages/cli` | ❌ **FAIL** | 8 passed, 3 failed (35 failing assertions due to profile subcommand drift and 12 syntax errors in `stream.ts`). |

---

## 3. Operational Limits & Verification Blockers
- **Toxiproxy / Chaos Engineering Suite**: Requires Docker daemon with active `host.docker.internal` network mapping to test live TCP degradation.
- **Horizon Network Live SSE**: Live network tests require outbound HTTPS connectivity to `horizon-testnet.stellar.org` and live test accounts.
