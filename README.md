# PermitMate BCN

PermitMate helps immigration practices organise cases, collect documents, and prepare client updates. This repository starts with an interactive, fictional-data prototype for Barcelona immigration lawyers.

## Run locally

```sh
git clone https://github.com/2407Varun/permitmatebcn.git
cd permitmatebcn
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://localhost:4173. Stop the server with Ctrl+C. Python 3 is needed for this command. If Node.js is installed, `npm run dev` runs the same server, and `npm run check` checks JavaScript syntax. There are no package dependencies to install.

For a quick preview, opening `index.html` directly also works; local storage behaviour can vary for file URLs. Google Fonts is optional; the page falls back to system fonts when offline.

## What works today

- Dashboard, case search and status filtering.
- Create fictional cases and update their preparation status.
- Review simulated document records and request replacements.
- Generate scripted follow-ups and approve simulated WhatsApp replies.
- Preview the client mobile interface and simulate document submission.
- Save demo changes in browser local storage; Reset demo restores the original records.

The client preview and lawyer workspace share state in the same browser. They are not separate authenticated accounts. There is no cross-device sync, real file upload, live AI, WhatsApp integration, or government submission. Do not enter real client information.

## Find your way around

| File              | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `index.html`      | Page shell, navigation, and new-case form     |
| `style.css`       | Desktop and mobile presentation               |
| `app.js`          | Demo data, screen rendering, and interactions |
| `docs/ROADMAP.md` | Learning milestones and acceptance checks     |

First learning exercise: find `sampleDraft` in `app.js`, change a sentence, refresh, and generate a follow-up to see the result.

## Three-minute demonstration

1. Open Aisha's case from Overview.
2. Review the checklist and generate a sample follow-up.
3. Edit and approve the reply in the simulated inbox.
4. Open Client experience and simulate a document submission.
5. Return to the case and mark the document reviewed.

## Development workflow

Create a branch for each feature, make a small change, verify it, and commit it:

```sh
git switch -c feature/your-feature
npm run check
git diff --check
git add <changed-files>
git commit -m "Describe the behaviour added"
git push -u origin feature/your-feature
```

Review changes before merging into `main`. Use issues to track the milestones in the roadmap. Do not commit credentials or real documents: `.gitignore` helps with common paths, but review staged changes too.

## Hosting

The current private demo is hosted separately through Sites. Pushing this GitHub repository does not automatically deploy that demo. This repository intentionally contains no Sites identity or hosting credentials. Decide on a GitHub-to-hosting workflow when the backend is introduced.

## Verification

The initial demo passed JavaScript syntax and workflow logic checks for navigation, drafting, simulated approval, document submission/review, search, escaping, and reset. Those logic checks used a DOM stub; full visual browser QA remains outstanding. Later backend milestones require real authentication and access-isolation tests.
