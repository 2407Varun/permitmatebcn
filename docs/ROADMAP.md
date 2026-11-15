# Learn while building PermitMate

Build one complete journey: client signs in, uploads a document, lawyer reviews it, AI drafts a follow-up, lawyer approves it, and WhatsApp delivers it.

Start with one practice and fictional documents. Keep each milestone small enough to explain and demonstrate before moving on.

| Milestone                   | Build                                                           | Learn                                            | Acceptance check                                                                   |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1. Understand the prototype | Edit a scripted reply and add a small UI change                 | HTML, CSS, functions, events, state, Git         | Explain the changed code and see the result in the browser                         |
| 2. Accounts and saved cases | Supabase Auth, practice membership, case database               | SQL, authentication, authorisation, API requests | Same case appears on computer and phone; another client cannot access it           |
| 3. Real uploads             | Private Storage, document metadata, review history              | File handling, storage policies, error recovery  | Upload a fictional PDF on phone; assigned lawyer can open it; other clients cannot |
| 4. AI drafting              | Authenticated server function calling OpenAI Responses API      | Server secrets, prompts, errors, usage controls  | Draft mentions only outstanding items; approval is required                        |
| 5. Document extraction      | Structured suggested fields with source evidence                | Schema validation and evaluating AI errors       | Clear, blurry, incomplete, and unrelated files handled without invented facts      |
| 6. WhatsApp testing         | Cloud API sending, inbound webhook, delivery events             | Webhook signatures, retries, message identifiers | Test phone receives a reply and incoming message appears under the right case      |
| 7. Pilot readiness          | Recovery, deletion, operational monitoring, professional review | Operating a service and measuring outcomes       | Pilot practice accepts the workflow and data-handling arrangements                 |

## Planned architecture

- Keep the current browser interface initially.
- Supabase: authentication, Postgres database, private document storage, server functions.
- OpenAI Responses API: lawyer-reviewed drafts, then document extraction.
- Official WhatsApp Cloud API: approved messages, incoming replies, delivery tracking.

Enforce permissions at the backend and storage layers, not only in the interface. Store API secrets only on the server. Start WhatsApp with developer testing; implement its messaging-window and approved-template rules before real sending. Keep uploads in the authenticated portal first.

Before using real client information, test cross-client and cross-practice isolation, recovery and deletion, review document handling, and agree provider processing and retention with the practice. Choosing an EU database region alone does not settle data handling across all services.

## Next session

1. Run the prototype locally and complete the `sampleDraft` exercise in the README.
2. Create a development Supabase project named `permitmate-dev`.
3. Design practice memberships, cases, and document records together before connecting the dashboard.
4. Add login and permissions before real uploads.

## Official references

- [Supabase database security](https://supabase.com/docs/guides/database/secure-data)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase server secrets](https://supabase.com/docs/guides/functions/secrets)
- [OpenAI quickstart](https://developers.openai.com/api/docs/quickstart)
- [OpenAI file inputs](https://developers.openai.com/api/docs/guides/file-inputs)
- [WhatsApp Cloud API overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/)
