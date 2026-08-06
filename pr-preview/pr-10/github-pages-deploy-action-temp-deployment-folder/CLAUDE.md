# Agent instructions

This file is read automatically by the AI agent that works on this repository. It is not
documentation for humans — it is the agent's brief. Anything written here shapes how the agent
implements a task, so keep it short and unambiguous. For an explanation of the project itself,
see [`README.md`](README.md).

## Where the work comes from

Tasks originate as Jira tickets. Moving a ticket into the `AI assigned` column creates a GitHub
issue here containing the ticket's description and an `@claude` mention, which triggers the
agent. The issue body is the specification — implement what it asks for, nothing more.

## What this codebase is

A single static page (`index.html`) with inline CSS and JavaScript. It exists to give the
pipeline something real to change; it is not a product. Treat it as a sandbox.

## Rules

- Keep every change minimal and inline in `index.html`. Never add a build step, a package
  manager, or external dependencies.
- Verify the HTML is well formed — matching tags, valid inline JS — before opening the PR.
- Do only what the ticket asks. Unrequested "improvements" make review harder and get rejected.
- Push your branch and open the PR yourself:
  `gh pr create --fill --body "Fixes #<issue-number>\n\n<summary>"`. Do not leave a link for a
  human to click.
- **Never merge.** Every PR waits for human review against its deployed preview. Do not run
  `gh pr merge` or ask for the merge to happen automatically.

Merging to `main` publishes to production, so leave no test content or debug output behind.
