# Lesson 1: login and private document uploads

Goal: sign in on your computer and phone with the same test account, upload a fictional PDF, and download it from the other device. A second account must not be able to access the first account's files.

This lesson implements account-owned storage. It does not yet implement shared practices, clients, case records, lawyer review, password recovery, AI, WhatsApp, or production document screening. The fictional case demo remains separate.

## Step 1 — Create your development project

1. Go to https://supabase.com/dashboard and sign in or create an account.
2. Create a new project named `permitmate-dev`; choose an EU region.
3. Generate a strong database password and save it in your password manager. Do not paste it into chat or GitHub.
4. Wait until the project is ready.

An EU project region is a hosting choice, not a complete privacy or compliance setup.

## Step 2 — Create the private bucket and access rules

1. Open the project's SQL Editor and create a new query.
2. Paste the entire contents of `supabase/migrations/202611150001_private_learning_uploads.sql`.
3. Run it once. The transaction creates a new bucket and three policies. It deliberately fails if this bucket already exists; inspect the existing setup rather than deleting policies or rerunning parts blindly.
4. Open Storage and confirm `learning-documents` is **private**, limited to 5 MiB and PDF/JPEG/PNG.

Use a fresh development project. Existing broad Storage policies can grant extra access because permissive policies combine with OR. Do not add an “allow all authenticated users” policy to make an error disappear.

## Step 3 — Configure email sign-in

1. In Authentication, enable the Email provider if it is disabled. Keep email confirmation enabled.
2. In Authentication's URL Configuration, set the development Site URL to `http://localhost:4173/documents.html` and add that exact URL to the allowed redirect URLs.
3. For a hosted development build, add its exact HTTPS `documents.html` URL too. Do not point development confirmations at the old static demo, which does not contain this feature.

This lesson uses email/password sign-in. Provider email delivery and rate limits may affect testing. If confirmation mail is not received, check the project auth logs and email configuration; do not weaken access policies.

## Step 4 — Configure the app locally

Use Node 22.12+ (Node 24 LTS is suitable). In your local checkout, switch to `feature/login-private-uploads`, then run:

```sh
npm ci
cp .env.example .env.local
```

Open `.env.local` in your editor. From your project's Connect panel or API settings, copy the Project URL and the **publishable** key:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

The publishable key is designed to be visible in the browser. Storage policies protect files. Do not use a secret key, a legacy `service_role` key, or a database password. The app deliberately accepts the modern `sb_publishable_` key format only. `.env.local` is ignored by Git, but its VITE\_ values are bundled into browser code, so secrets never belong there.

```sh
npm run dev
```

Open http://localhost:4173/documents.html. If you edit `.env.local`, restart the server. The ordinary Python static server no longer supports the source app because dependencies and environment variables need Vite. Use `npm run build` for deployable `dist/` files.

## Step 5 — Use the feature

1. Create a test account with an email you control and a password of at least 12 characters.
2. Confirm the email, then sign in.
3. Upload a small fictional PDF, JPEG, or PNG.
4. Refresh the page: the account session and document list should remain available.
5. Download the file and verify its contents.
6. Delete it and refresh: it should no longer appear.
7. Sign out: the private document list should disappear.

For phone testing, use an HTTPS development deployment of this branch built with the same public environment variables and add its redirect URL. `localhost` on your phone is your phone, not your computer. The existing hosted demo is not automatically updated by this branch.

## Step 6 — Verify the security boundary with two accounts

Create a second test account B. Keep account A open in one browser and B in another/private profile.

- A uploads a sample. B must neither list nor download it.
- In B's browser, editing a request to use A's folder must not grant access. Verify upload, list, download and delete using A's object path. A delete API may return success for zero matched objects; also check in A's session that the file still exists.
- A logged-out request must not read the file. Do not use the Supabase dashboard as your test client: it has elevated access.
- Try an empty file, an unsupported file, and a file larger than 5 MiB. Try bypassing the browser checks too: the bucket must enforce type/size restrictions.

The included unit tests do not prove server access isolation. This two-account exercise against your actual project remains mandatory before considering the milestone verified.

## Direct-download isolation check inside the Codex browser

No developer console or copied authentication token is needed:

1. Sign in as A and refresh the document list. Use a fictional sample.
2. Under that document, select and copy the full **Storage path for access testing**.
3. Paste it into **Check access to an exact file path**, then click the check button. Confirm **FILE RETURNED** to A.
4. Keep the exact path copied, sign out, and sign in as B. Sequential sign-in works even when browser tabs share storage.
5. Verify B can download its own sample. Paste A's unchanged path into the check and run it.
6. Expect **FILE NOT RETURNED** to B. If the file is returned, isolation has failed. **INCONCLUSIVE** requires fixing the session or connection and retrying.
7. Sign back in as A and check the exact same path once more. It must still return the file, ruling out deletion or a mistyped path as the explanation.

The diagnostic calls authenticated Storage download with `cache: 'no-store'` and checks the login with Auth first. It reads a successful response into memory but does not display the document or create a local download. Rejections do not distinguish an inaccessible file from a missing one: that is why the A → B → A controls matter. This verifies the tested download path, not every permission or production security requirement.

## How the code works

1. **`documents.html`** declares the forms and containers. It loads `src/documents.js` as a JavaScript module.
2. **`src/documents.js`** connects to Supabase with `createClient`. `signUp` creates a test account; `signInWithPassword` requests a session. `onAuthStateChange` updates the screen when the session changes. Supabase's SDK manages session persistence and refresh; we do not store passwords ourselves.
3. **`src/document-service.js`** handles storage. `uploadDocument` checks the file and constructs a path like `USER_ID/RANDOM_ID--sample.pdf`. The random ID prevents one upload from overwriting another. The SDK sends the signed-in user's token with the request.
4. **The SQL policies** check the bucket, account folder and object owner on the server. `auth.uid()` is derived from the authenticated request. A forged browser variable or another person's folder name does not change it.
5. **`downloadDocument`** requests the file using the authenticated session. No public storage URL is created. The browser saves a local copy; signing out does not erase downloaded copies.
6. **`vite.config.js`** builds two pages: the original demo and this workspace. `package-lock.json` locks dependency versions so `npm ci` installs the same versions.

Filename and MIME checks are usability and upload constraints, not proof of a safe or genuine document. Production needs further file screening and access/recovery work before real records are used.

## Your learning exercise

Find `MAX_BYTES` in `src/document-service.js`. Explain why changing it alone would not change the server's upload limit. Then find `file_size_limit` in the SQL file: the server and browser both need an intentional, matching limit.

Run checks:

```sh
npm run check
npm test
npm run build
```

Next lesson: practice membership and case permissions, then assigning documents to a real case and granting access to its authorised lawyer.

References: [Email/password auth](https://supabase.com/docs/guides/auth/passwords), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Bucket limits](https://supabase.com/docs/guides/storage/buckets/fundamentals).
