# PermitMate BCN

PermitMate helps immigration practices organise cases, collect documents, and prepare client updates. This repository includes a fictional-data case demo and an account-owned private upload workspace for learning Supabase.

## Run locally

```sh
git clone https://github.com/2407Varun/permitmatebcn.git
cd permitmatebcn
npm ci
npm run dev
```

Use Node 22.12+ (Node 24 LTS is suitable). Open http://localhost:4173 for the demo, or http://localhost:4173/documents.html for login and uploads. Stop the server with Ctrl+C. On the feature branch, follow [Lesson 1](docs/LESSON-01.md) to configure Supabase and apply the private bucket policies before testing uploads.

Vite resolves npm dependencies and browser configuration; use its server instead of opening source files directly. Google Fonts is optional; the demo falls back to system fonts when offline. `npm run build` generates both pages in `dist/`.

## What works today

- Dashboard, case search and status filtering.
- Create fictional cases and update their preparation status.
- Review simulated document records and request replacements.
- Generate scripted follow-ups and approve simulated WhatsApp replies.
- Preview the client mobile interface and simulate document submission.
- Save demo changes in browser local storage; Reset demo restores the original records.

The fictional client preview and lawyer workspace share demo state in the same browser. They are not separate authenticated accounts and have no cross-device sync, live AI, WhatsApp integration, or government submission.

The separate `documents.html` workspace supports Supabase email/password accounts, real private file upload, listing, authenticated downloads, and deletion after project setup. Each account can access only its own files under the supplied policies. Practice sharing and real case integration are not implemented. Use fictional files until live isolation and production-readiness checks are complete.

## Find your way around

| File                      | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `index.html`              | Page shell, navigation, and new-case form                       |
| `style.css`               | Desktop and mobile presentation                                 |
| `app.js`                  | Demo data, screen rendering, and interactions                   |
| `documents.html` / `src/` | Login and real private upload workspace                         |
| `supabase/migrations/`    | Private bucket and account ownership policies                   |
| `docs/LESSON-01.md`       | Step-by-step Supabase setup, code explanations, and live checks |
| `docs/ROADMAP.md`         | Learning milestones and acceptance checks                       |

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
npm test
npm run build
git diff --check
git add <changed-files>
git commit -m "Describe the behaviour added"
git push -u origin feature/your-feature
```

Review changes before merging into `main`. Use issues to track the milestones in the roadmap. Do not commit credentials or real documents: `.gitignore` helps with common paths, but review staged changes too.

## Hosting

The current private demo is hosted separately through Sites. Pushing this GitHub repository does not automatically deploy that demo. This repository intentionally contains no Sites identity or hosting credentials. The upload workspace requires a Vite build with the two public Supabase settings, and matching Auth redirect URLs, before hosting. No secret or service-role keys belong in browser configuration.

## Verification

The initial demo passed JavaScript syntax and workflow logic checks using a DOM stub. Upload service unit tests check validation, pagination, authenticated API usage, and error propagation. They do not prove Supabase policy enforcement. Live signup, upload/download, two-account isolation, and full browser QA require a configured development project; follow Lesson 1 before treating this milestone as verified.
