# agentic-prs

Jira tickets in, reviewed pull requests out — with an AI agent doing the implementation and
**zero API billing**.

Move a ticket into the `AI assigned` column on a Jira board and, without anyone touching a
keyboard, an agent reads the ticket, writes the code, opens a pull request, and deploys a live
preview of that PR to its own URL. A human reviews and merges; production updates itself.

**Live site:** https://gonz96.github.io/agentic-prs/

This repository is the working end of that pipeline: the GitHub Actions workflows, plus a small
static page that serves as the codebase the agent operates on.

## Who does what

Two people are involved, and neither of them leaves the tool they already work in. The Product
Owner never opens GitHub; the developer never opens Jira. Everything between the two is
automated.

```mermaid
flowchart TD
    subgraph PO["👔 Product Owner — stays in Jira"]
        A["Writes the ticket:<br/>summary, description,<br/>acceptance criteria"]
        B["Drags the card into<br/><b>AI assigned</b>"]
    end

    subgraph AUTO["🤖 Automated — nobody does anything"]
        C["A GitHub issue appears<br/>carrying the ticket's content"]
        D["The agent writes the code<br/>and opens a pull request"]
        E["A preview of that PR<br/>goes live on its own URL"]
    end

    subgraph DEV["👩‍💻 Developer — stays in GitHub"]
        F["Opens the issue and clicks<br/>the preview link posted there"]
        G["Tries the change running for real,<br/>then reads the diff"]
        H{"Is it right?"}
        I["Comments <code>@claude ...</code><br/>saying what to change"]
        J["Approves and merges"]
    end

    K["🚀 Live in production"]

    A --> B --> C --> D --> E --> F --> G --> H
    H -->|"not yet"| I
    I --> D
    H -->|"yes"| J --> K
```

The Product Owner's only job is writing a ticket clear enough to act on and moving it one
column. The developer's only job is judging the result — with the change already running at a
URL, so review isn't reading code and imagining the outcome. Nothing in between requires a
person, and the loop back to the agent is a plain comment rather than a handoff.

## How it works under the hood

```mermaid
flowchart TD
    A["🗂️ Jira ticket moved to<br/><b>AI assigned</b>"] --> B["⚙️ Jira Automation<br/>POST /repos/:owner/:repo/issues"]
    B --> C["📋 GitHub issue created<br/>body contains <code>@claude</code>"]
    C --> D["🤖 claude.yml<br/>anthropics/claude-code-action"]
    D --> E["🔀 Pull request opened<br/>agent does not merge"]
    E --> F["🌐 preview.yml<br/>deploys PR to its own URL"]
    F --> G["💬 Preview link posted<br/>back on the issue"]
    G --> H{"👤 Human reviews<br/>the live preview"}
    H -->|approve and merge| I["🚀 deploy.yml<br/>publishes to production"]
    H -->|"request changes: comment<br/><code>@claude ...</code> on the PR"| D
```

Requesting changes doesn't open anything new — the agent pushes another commit to the same
branch, the preview URL updates in place, and the review starts again.

Jira never talks to the AI directly. It only creates a GitHub issue — everything else is
GitHub-native, which keeps the moving parts observable and debuggable.

## Workflows

| File | Trigger | Responsibility |
|---|---|---|
| [`claude.yml`](.github/workflows/claude.yml) | `@claude` in an issue, comment, or review | Agent implements the change and opens a PR |
| [`preview.yml`](.github/workflows/preview.yml) | PR opened / updated / closed | Deploys the PR to `gh-pages/pr-preview/pr-<N>/`, posts the link on the originating issue, tears it down on close |
| [`deploy.yml`](.github/workflows/deploy.yml) | Push to `main` | Publishes to the root of `gh-pages` → production |

Production and previews share a single `gh-pages` branch: production at the root, previews in
subdirectories. `deploy.yml` uses `clean-exclude: pr-preview/` so a production deploy never
wipes the previews living alongside it.

## Design decisions

**Subscription OAuth instead of an API key.** The action authenticates with
`CLAUDE_CODE_OAUTH_TOKEN`, generated via `claude setup-token` from a Claude Pro subscription,
rather than `ANTHROPIC_API_KEY`. Agent runs draw down the same quota as interactive use instead
of billing per token. This ruled out the official *Claude Agent for Jira* Marketplace app,
which requires a metered API key.

**The bridge goes through a GitHub issue, not `repository_dispatch`.** Dispatch would trigger
the workflow directly and skip creating an issue, which is cleaner on paper. The issue is worth
the extra object: it's where the agent streams its progress checklist, where the preview link
gets posted, and where a human replies `@claude do X instead` to iterate — all without leaving
GitHub. It becomes the agent's session panel.

**The agent never merges its own work.** `allowedTools` grants `gh pr create` but withholds
`gh pr merge`, and the repository's [`CLAUDE.md`](CLAUDE.md) states the constraint explicitly.
Every change passes through human review and a working preview URL before it can reach
production.

**Previews wait for the CDN.** `pr-preview-action` finishes as soon as it pushes to
`gh-pages`, but GitHub Pages needs another 30–60s to actually serve it. Announcing the URL at
that moment produces a link that 404s. Setting `wait-for-pages-deployment: true` and posting a
`🚧 deploying…` comment that is later *edited* to `✅ deployed` — rather than posting twice —
makes the notification truthful at every point.

## Setup

1. Install the [Claude GitHub App](https://github.com/apps/claude) on the repository.
2. Run `claude setup-token` locally and store the result as the repository secret
   `CLAUDE_CODE_OAUTH_TOKEN`.
3. Enable GitHub Pages: *Deploy from a branch* → `gh-pages` / `(root)`.
4. Create a fine-grained GitHub PAT scoped to this repository with `Issues: read and write`.
5. In Jira, create an automation flow: trigger on transition to `AI assigned`, build the issue
   body in a variable, then `POST` it to `https://api.github.com/repos/<owner>/<repo>/issues`
   with an `Authorization: Bearer <PAT>` header.

## Scope

The static page here is deliberately trivial — the interesting artifact is the pipeline, not
the site. [`CLAUDE.md`](CLAUDE.md) constrains the agent to inline edits with no build step, so
tickets should be scoped accordingly.
