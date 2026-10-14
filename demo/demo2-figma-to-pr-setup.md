# Demo 2 — "Figma to PR in 8 minutes." Setup Guide

The finale demo. Goes from a real Figma design + Jira ticket to a framework-compliant
Playwright spec committed and pushed to GitHub with a PR raised — using a single prompt.

No custom agents. Claude Code + MCPs (Figma, Jira, Playwright, GitHub) do the work.

---

## Reusable assets (create once, never reset)

| Asset | URL |
|-------|-----|
| Figma design | https://www.figma.com/design/GUS55E4ZMWLfukl23Nw0u5 |
| Jira ticket | https://nichethyself.atlassian.net/browse/SCRUM-19 |

These stay permanently. Only the branch, spec file, and PR are reset between runs.

---

## Reset between runs

```bash
cd healthhub-playwright && ./demo/reset-demo2.sh
```

This will:
1. Close the open PR on GitHub
2. Delete `demo/figma-to-pr` branch (local + remote)
3. Recreate a clean `demo/figma-to-pr` branch

---

## Pre-session checklist

- [ ] Reset script run: `./demo/reset-demo2.sh`
- [ ] HealthHub backend running: `cd backend && npm run dev` (port 3001)
- [ ] HealthHub frontend running: `cd frontend && npm run dev` (port 5173)
- [ ] All MCPs connected — run `/mcp` in Claude Code and confirm:
  - `playwright` — connected
  - `github` — connected
  - `figma` — connected
  - `jira` — connected
- [ ] Browser tabs open:
  - Figma: https://www.figma.com/design/GUS55E4ZMWLfukl23Nw0u5
  - Jira: https://nichethyself.atlassian.net/browse/SCRUM-19
- [ ] Claude Code open in `healthhub-playwright/` directory on branch `demo/figma-to-pr`

---

## MCP quick verification (before demo)

Run this in Claude Code to confirm Playwright MCP is live:
```
Use Playwright MCP to navigate to http://localhost:5173/login,
log in as patient@healthhub.test / Test123!, go to Appointments,
and tell me the data-testid of the New Appointment button.
```
Expected: `appointments-new-btn`

---

## Demo flow

### Step 1 — Set the scene (30 seconds)

Show both browser tabs:
- Figma design — *"This is the Figma design. The feature is built. Form fields, validation states, success states — all here."*
- Jira SCRUM-19 — *"This is the Jira ticket. Eight acceptance criteria. A tester's job starts here."*

**Trainer line**: *"Normally: read the Figma, read the ticket, write manual test cases, automate them, make sure they follow the framework. Half a day minimum. Let's do it in 8 minutes."*

---

### Step 2 — One prompt (the whole pipeline)

Paste this into Claude Code:

```
I need to write Playwright tests for a new feature.

Jira ticket: SCRUM-19 - Book New Appointment
Figma design: https://www.figma.com/design/GUS55E4ZMWLfukl23Nw0u5

The app is running at http://localhost:5173. Use Playwright MCP to
explore the live appointments page and the New Appointment form.

Generate a framework-compliant spec file covering all acceptance
criteria from the Jira ticket. Follow the conventions in CLAUDE.md,
use the existing AppointmentsPage POM, and import from fixtures/index.js.

Once the tests pass, commit and raise a PR using GitHub MCP.
```

**What Claude does automatically:**
1. Reads the Figma design via Figma MCP
2. Reads SCRUM-19 via Jira MCP
3. Uses Playwright MCP to explore the live app and extract locators
4. Generates `tests/framework/tests/appointments/book-appointment.spec.js`
5. Runs the tests
6. Fixes any failures
7. Commits and pushes to `demo/figma-to-pr`
8. Raises the PR via GitHub MCP

**Trainer lines as each step completes:**
- *(Figma + Jira read)*: *"It just read the design and the ticket. Real inputs — not markdown files."*
- *(Playwright exploring app)*: *"It's reading the live app. Real locators, from the running application."*
- *(Spec file appears)*: *"Look at the import, the fixture chain, the page object. It knows our framework."*
- *(PR raised on screen)*: *"Figma to PR. In under 10 minutes. Every acceptance criterion covered."*

---

### Step 3 — Show the PR (30 seconds)

Open the PR on GitHub. Point to:
- The spec file with 8 tests
- The PR description mapping each test to an acceptance criterion
- 24 passing tests across Chromium, Firefox, WebKit

**Interview line**: *"I've seen AI go from Figma + Jira to a framework-compliant spec pushed to GitHub with a PR in under 10 minutes."*

---

## Fallback plan

| Dependency | Failure signal | Action |
|------------|---------------|--------|
| Figma MCP not connecting | Error on Figma step | Open the design URL in browser, describe the form fields manually in the prompt |
| Jira MCP not connecting | Error on Jira step | Paste the acceptance criteria from the browser tab directly into the prompt |
| Playwright MCP not connecting | `/mcp` shows disconnected | Kill port 3333 (`lsof -ti :3333 \| xargs kill -9`), run `/mcp` to reconnect |
| HealthHub app not loading | Connection refused | `cd frontend && npm run dev` and `cd backend && npm run dev`, wait 10s |
| GitHub MCP not connecting | PR step fails | Push is already done — open GitHub in browser and create PR manually (30s) |
| Tests failing after fix | >3 failures remain | Say: *"The fix loop is the point — it wrote it, ran it, fixed it."* Show the spec file and raise the PR with failures noted in the description |

---

## Rehearsal pass criteria

- [ ] Reset script completes cleanly
- [ ] All 4 MCPs connected before starting
- [ ] Generated spec imports from `../../fixtures/index.js` (not `@playwright/test`)
- [ ] Generated spec uses `AppointmentsPage` POM
- [ ] All 24 tests pass (8 tests × 3 browsers)
- [ ] PR raised via GitHub MCP with AC coverage table in description
- [ ] Full demo fits within 10 minutes
- [ ] Trainer has practised all 4 trainer lines
