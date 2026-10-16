# 📝 Pull Request

> [!IMPORTANT]
> **TARGET BRANCH POLICY**: All contributions MUST target the `contribution` branch.
> Direct pull requests to `main` are automatically closed by repository automation. If you opened this against `main`, please edit the PR and switch the base branch to `contribution`.

## 📌 Summary
Briefly describe the changes made in this Pull Request.

---

## 🔗 Related Issue(s)
Closes #

---

## 🧪 Verification & Testing
Describe how your changes were verified:
- [ ] This PR targets the `contribution` branch (not `main`).
- [ ] Rebased onto latest `contribution` branch (`git pull --rebase origin contribution`).
- [ ] Checked for clean git diff with zero unresolved merge conflict markers.
- [ ] Checked TypeScript compilation (`npx tsc --noEmit` or `npm run typecheck`).
- [ ] Added or updated unit / integration tests where appropriate.
- [ ] Verified manually against local Testnet stack (if touching contracts/ingestion).

---

## 📸 Screenshots / Visual Proof (if applicable)
Attach UI screenshots or logs demonstrating functional correctness.
