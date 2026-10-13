---
name: fgate-5
description: Evidence-gated workflow for non-trivial engineering work. Splits a task into acceptance gates, each with an executable CHECK command and EXPECT pattern; a gate closes only when the command actually ran and passed (red before green, tamper-evident log). Prevents drift (one active gate, a SCOPE per gate, regression re-runs) and ends in a proven delivery (--ship). Use this whenever the user asks to plan, build, implement, fix a bug, refactor, review, debug, or "finish / complete / ship / deliver" multi-step work, or says gates, GATES.md, FocusGate, red-green, scope creep, "no stubs", "prove it works", or "don't stop until it's done", even without naming FocusGate. Also use it to audit whether a checklist or test gate proves anything.
license: MIT
metadata:
  version: "v5.0-PROD"
  runtime: "Python 3.9+ standard library only"
  files: "csv, py, txt and md only"
---

# FocusGate v5.0-PROD: Evidence Gate and Delivery Loop

"Done" is something a command proves, not something you assert. A **gate** is a checkbox plus `CHECK:` (a shell command) and `EXPECT:` (a regex that must appear in its output). `--check` runs the command and only then writes `[x]`: the only way a gate closes, swarm waves included.

Run everything as `python3 focus-gate.py <flag>`.

## The loop

1. **Route**: `-p "<task>"` prints the pipeline and the facets that apply (deterministic, zero tokens). `--hydrate-facet <id>` loads one.
2. **Write gates** in `.focusgate/GATES.md` (`--init` scaffolds it): one per observable behavior, the CHECK written for the *finished* behavior so it fails today. Add `SCOPE: <globs>` (the files this gate may touch) and `AFTER: <gate ids>`.
3. **Lint**: `--lint`. Fix every `[ERROR]`, read every `[WARN]`.
4. **Baseline before touching code**: `--baseline`. Every gate should print `RED`. `ALREADY_GREEN` cannot prove your change; `ERROR` (exit 126/127) means a tool is missing, not that the feature is.
5. **Focus**: `--focus` prints the one active gate (first open gate whose `AFTER` gates are settled) and the single next command. Work on that gate only. Run `--drift-mark` first if there is no git.
6. **Implement**, then `--drift`: files changed outside the active gate's `SCOPE` (exit 1). Revert them, give them a gate of their own, or widen `SCOPE` and say why.
7. **Settle**: `--check <id> --strict` re-runs the CHECK and writes `[x]` only if it passes and this exact CHECK/EXPECT was seen red. Back to step 5.
8. **Ship**: `--regress` re-runs settled gates; one that fails is a `REGRESSION`. `--ship` refuses unless every gate is settled *with proof in the log*, every CHECK still passes and the chain verifies; it then writes `.focusgate/DELIVERY.md` and anchors the log. Commit both.

`--evidence` shows the log and verifies its hash chain; `--evidence --anchor` saves the head hash in a `.txt` so a truncated or rewritten history is caught.

## Rules, and why

- **Red before green.** A check that never failed proves nothing. Each red is bound to a fingerprint of the exact CHECK+EXPECT, so editing a CHECK after seeing it fail voids it. Fix the code, not the check.
- **Honest CHECKs.** The linter reads shell structure, and one level into a script the CHECK runs. It rejects commands that cannot fail (`true`, `echo ok`), mask failure (`|| true`, `set +e`), or use an EXPECT that matches anything (`.*`). It warns on `git status` probes and `pytest | tail` (use `bash -o pipefail -c`).
- **A tick is not proof.** `--ship` reports `UNPROVEN` for a `[x]` the log cannot back: ticked by hand, or the CHECK edited after settling.
- **Overrides leave a trail.** `--force` bypasses an integrity error and `--waive-red "<reason>"` the red requirement (fair when a bug was already fixed). Both are logged and listed in `DELIVERY.md`; tell the user.

## Good and bad

```
- [ ] login-timeout: expired session returns 401
  CHECK: python3 -m pytest -q tests/test_auth.py::test_expired_session
  EXPECT: 1 passed
  SCOPE: src/auth/**, tests/test_auth.py
```
This fails until the behavior exists; `pytest -q | tail -1` with `EXPECT: passed` would also match "1 failed, 4 passed". More: `references/gates.md`.

## Output format

`▶ NEXT ACTION: <command or file:line>`, then `State: [Pipeline: <n>] [Active Gate: <id>] FocusGate v5.0-PROD`, then `■ ACTIVE FOCUS: <one sentence>`, at most 3 numbered items, and a closing `Next:` step under 2 minutes. `--focus` prints this envelope.

## Safety and files

CHECK lines run in the shell with your permissions: read a `GATES.md` you did not write first. `--trust --dry-run` lists its CHECKs, `--trust` approves them, and with `FOCUSGATE_TRUST=required` only approved CHECKs run. A guard refuses destructive or remote-exec checks (`rm -rf /`, `git push --force`, `curl ... | sh`) even with `--force`; it is a seatbelt, not a sandbox.

## Read only when needed

Hard gates (flaky tests, UI, no runner): `references/gates.md`. Any other flag (`--audit-all`, `--verify-wave`, swarm): `references/cli.md`. Layering and adding a command: `references/architecture.md`. Fixed and still open: `AUDIT.md`.

Facets (`facets/*/*.md`) are short directive sets per kind of work.
