---
description: Audit the current diff for WCAG, keyboard, semantics, and reduced-motion issues.
argument-hint: "[scope]"
allowed-tools: Read, Grep, Glob, Bash
---

Audit accessibility for `$ARGUMENTS` or the current diff.

Checklist:
1. Run `git diff --check` and inspect `git diff`.
2. Check semantic landmarks, heading order, labels, alt text, and focus states.
3. Verify keyboard access for interactive controls.
4. Check color contrast and visible focus indicators.
5. Confirm `prefers-reduced-motion` behavior for GSAP, Framer Motion, Lenis, and R3F.
6. Flag any custom buttons/links without native semantics.

Report file:line findings ordered by severity. Do not modify files unless explicitly asked.
