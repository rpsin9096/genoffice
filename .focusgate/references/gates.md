# Writing gates that count

A gate is evidence only if its CHECK could fail for the right reason. Use this catalogue when the easy form does not fit.

## Contents
1. Bug fix  2. Flaky test  3. No test runner  4. UI / visual  5. Refactor  6. Pure addition  7. Anti-patterns  8. SCOPE and AFTER

## 1. Bug fix
Write the CHECK for the *fixed* behavior, run `--baseline`, see RED, then fix. Do not write `EXPECT: FAIL`; the old reproduction convention is gone because the evidence log now records the red for you.
```
- [ ] bug-142: empty cart total is 0, not NaN
  CHECK: python3 -c "from cart import total; assert total([]) == 0"
```

## 2. Flaky test
One green run proves little. Make the CHECK repeat: `for i in 1 2 3 4 5 6 7 8 9 10; do pytest -q tests/test_x.py || exit 1; done`. The `|| exit 1` is honest (it propagates failure); `|| true` is not.

## 3. No test runner
Check an observable artifact or output: `test -s dist/report.csv && echo OK` with `EXPECT: OK`; `grep -c "^def login" auth.py` with `EXPECT: ^1$`; `curl -sf localhost:8000/health` with `EXPECT: "status": *"ok"`. Existence checks are weaker than behavior checks; prefer behavior.

## 4. UI / visual
Assert on structure, not on "it looks right": `node scripts/check-dom.js` that exits 1 if the required element/ARIA role is missing, plus `--audit-contrast <fg> <bg>` for WCAG ratios. Visual judgment stays a manual gate (no CHECK), which `--check` allows and the evidence log records as `manual`.

## 5. Refactor
The behavior must not change, so the gate is the existing suite, and it will be `ALREADY_GREEN` at baseline. That is expected: use `--waive-red "behavior-preserving refactor"` and add a gate that fails today for the *structural* goal (e.g. `test ! -e utils.py`, or a grep that finds zero imports of the old module).

## 6. Pure addition
A new file/feature: the red is "does not exist yet". `python3 -c "import newmod; assert newmod.f(2) == 4"` fails with ImportError today. ImportError is a real red; exit 127 (command not found) is not, and baseline reports it as ERROR.

## 7. Anti-patterns the linter catches
| Pattern | Code | Why |
|---|---|---|
| `true`, `echo ok`, `exit 0` | SELF_SATISFYING | cannot fail |
| `cmd \|\| true`, `cmd; true`, `set +e`, `cmd &` | MASKED_EXIT | turns failure into exit 0 |
| `EXPECT: .*`, `^`, `x*` | VACUOUS_EXPECT | matches any output |
| `EXPECT: (` | INVALID_EXPECT | not a regex; would crash settlement |
| `CHECK: <command ...>`, `TODO` | UNFILLED_TEMPLATE | placeholder left in |
| `rm -rf /`, `git push --force`, `mkfs`, `shutdown` | DESTRUCTIVE_CHECK | a CHECK observes, never damages; refused before running, even with `--force` |
| `curl ... \| sh` (fetch piped into an interpreter) | REMOTE_CODE_EXEC | runs code from the network; same refusal |
| `bash verify.sh` where the script only echoes, or ends in `; true` / `\|\| true` without `set -e` | SELF_SATISFYING / MASKED_EXIT | the analyzer reads the script (one level) with the same rules |
| `python3 verify.py` that only prints | SCRIPT_CANNOT_FAIL | no assert, no raise, no call except print: it can only pass |
| `git status`, bare `ls`, `date` | TAUTOLOGY_CHECK (warn) | passes in any repo |
| `pytest \| tail` | PIPE_MASKS_EXIT (warn) | pipe discards runner status |
| `python -c "print('ok')"` | LITERAL_OUTPUT (warn) | output is a literal |

Limits: the analyzer reads shell structure heuristically, and one level into a local script. It cannot follow a script that calls another script, or know that a real test asserts nothing. Red-before-green covers part of that gap (a script that can never fail never shows RED), but review the CHECK of any custom script.

The guard is a conservative denylist: a CHECK that merely mentions `reboot` or `shutdown` in a pattern (`grep shutdown log.txt`) is refused too. Rewrite the check so the word is not in the command line (for example, search a file with a pattern kept in a script) rather than looking for an override; there is none by design.

## 8. SCOPE and AFTER
`SCOPE:` lists the paths a gate may touch; `--drift` reports every other changed file. Write it as narrowly as the behavior allows: `SCOPE: src/auth/**, tests/test_auth.py`. `**` crosses directories, `*` and `?` stay inside one, a trailing `/` means the whole directory. Shared files (a lockfile, a changelog) belong in a gate of their own, or in the SCOPE of the gate that really changes them. A gate with no SCOPE is *not judged*: `--drift` says so rather than calling it clean.

`AFTER: g1, g2` keeps a gate off the active slot until those gates are settled. A name that matches no gate keeps it blocked (a typo must not release the gate), and `--focus` prints the unknown name.

Without git, run `--drift-mark` before starting a gate: it stores file hashes so `--drift` can see later changes, including deletions. With git and no mark, `--drift` lists every uncommitted change, including dirt that predates your work; mark first if the tree was not clean.
