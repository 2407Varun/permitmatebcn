import { createClient } from "@supabase/supabase-js";
import {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument,
  displayName,
  probeDownload,
} from "./document-service.js";

const $ = (selector) => document.querySelector(selector);
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let client,
  user = null,
  busy = false,
  sessionVersion = 0,
  listVersion = 0;

function status(message, error = false) {
  $("#status").textContent = message;
  $("#status").dataset.error = String(error);
}

function setBusy(value) {
  busy = value;
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = value));
  $("#upload").textContent = value ? "Please wait…" : "Upload privately";
}

async function perform(action) {
  if (busy) return;
  setBusy(true);
  try {
    await action();
  } catch (error) {
    status(error.message || "Something went wrong. Please retry.", true);
  } finally {
    setBusy(false);
  }
}

function setUser(nextUser) {
  if (nextUser?.id === user?.id) return;
  user = nextUser;
  sessionVersion += 1;
  listVersion += 1;
  $("#documents").replaceChildren();
  $("#file").value = "";
  $("#password").value = "";
  $("#access-path").value = "";
  $("#access-result").textContent = "No check run yet.";
  $("#account-email").textContent = user?.email || "";
  $("#auth").hidden = Boolean(user);
  $("#workspace").hidden = !user;
  if (user) {
    status("Signed in. Your private workspace is ready.");
    // Run outside the auth callback: do not await SDK calls inside that callback.
    setTimeout(() => void refreshDocuments(), 0);
  } else {
    status("Signed out. Sign in to access your files.");
  }
}

async function refreshDocuments() {
  if (!user) return;
  const accountId = user.id,
    version = ++listVersion;
  $("#list-status").textContent = "Loading your documents…";
  $("#documents").replaceChildren();
  try {
    const files = await listDocuments(client, accountId);
    // Ignore responses belonging to an old account or an older refresh request.
    if (user?.id !== accountId || version !== listVersion) return;
    $("#list-status").textContent = files.length
      ? `${files.length} document(s)`
      : "No documents yet. Upload a fictional sample to begin.";
    for (const file of files) renderDocument(file, accountId);
  } catch (error) {
    if (user?.id !== accountId || version !== listVersion) return;
    $("#list-status").textContent =
      "Could not load documents. Check that the SQL setup has been applied, then refresh.";
    status(error.message, true);
  }
}

function renderDocument(file, accountId) {
  const path = `${accountId}/${file.name}`,
    name = displayName(file.name);
  const row = document.createElement("li"),
    title = document.createElement("strong"),
    detail = document.createElement("small"),
    actions = document.createElement("div");
  // User-provided names are text, never interpreted as HTML.
  title.textContent = name;
  const bytes = Number(file.metadata?.size || 0);
  detail.textContent = `${Math.ceil(bytes / 1024)} KiB · ${new Date(file.created_at).toLocaleDateString()} · Private`;
  actions.className = "actions";
  for (const [label, action] of [
    [
      "Download",
      async () => {
        const blob = await downloadDocument(client, path);
        if (user?.id !== accountId) return;
        const objectUrl = URL.createObjectURL(blob),
          link = document.createElement("a");
        link.href = objectUrl;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        status(
          "Download started. Downloaded files remain on this device after sign-out.",
        );
      },
    ],
    [
      "Delete",
      async () => {
        if (!window.confirm(`Delete ${name}? This removes the stored file.`))
          return;
        await deleteDocument(client, path);
        if (user?.id !== accountId) return;
        status("Document deleted.");
        await refreshDocuments();
      },
    ],
  ]) {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = busy;
    button.addEventListener("click", () => {
      if (user?.id !== accountId) return;
      void perform(action);
    });
    actions.append(button);
  }
  const pathLabel = document.createElement("label");
  pathLabel.textContent = "Storage path for access testing";
  const pathField = document.createElement("input");
  pathField.readOnly = true;
  pathField.value = path;
  pathField.setAttribute("aria-label", `Storage path for ${name}`);
  pathField.addEventListener("click", () => pathField.select());
  pathLabel.append(pathField);
  row.append(title, detail, actions, pathLabel);
  $("#documents").append(row);
}

async function authenticate(createAccount = false) {
  if (!$("#auth-form").reportValidity()) return;
  await perform(async () => {
    const credentials = {
      email: $("#email").value.trim(),
      password: $("#password").value,
    };
    status(createAccount ? "Creating your test account…" : "Signing in…");
    const { data, error } = createAccount
      ? await client.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: new URL("documents.html", window.location.href)
              .href,
          },
        })
      : await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    $("#password").value = "";
    if (data.session) setUser(data.session.user);
    else
      status(
        "Check your email for a confirmation link, then return and sign in. If you already have an account, use Sign in.",
      );
  });
}

function connect() {
  // Only modern publishable keys are accepted here to avoid accidentally bundling
  // a privileged service-role JWT. Publishable keys are intentionally public.
  let validUrl = false;
  try {
    validUrl =
      new URL(url).protocol === "https:" && !url.includes("YOUR_PROJECT");
  } catch {}
  if (
    !validUrl ||
    !key?.startsWith("sb_publishable_") ||
    key.includes("REPLACE_ME")
  ) {
    $("#setup").hidden = false;
    status(
      "Supabase configuration is missing. Follow the setup instructions above.",
    );
    return;
  }
  try {
    client = createClient(url, key);
    $("#auth").hidden = false;
    status("Sign in or create a test account to begin.");
    client.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user || null),
    );
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) status(error.message, true);
        else setUser(data.session?.user || null);
      })
      .catch((error) => status(error.message, true));
  } catch (error) {
    status(error.message, true);
  }
}

$("#auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  void authenticate();
});
$("#sign-up").addEventListener("click", () => void authenticate(true));
$("#sign-out").addEventListener(
  "click",
  () =>
    void perform(async () => {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setUser(null);
    }),
);
$("#upload-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!user) return;
  const accountId = user.id,
    version = sessionVersion,
    file = $("#file").files[0];
  void perform(async () => {
    status("Uploading privately… Keep this page open until it finishes.");
    await uploadDocument(client, accountId, file);
    if (version !== sessionVersion) return;
    $("#file").value = "";
    status(
      "Upload complete. The file is stored in your private account folder.",
    );
    await refreshDocuments();
  });
});
$("#refresh").addEventListener("click", () => void perform(refreshDocuments));
$("#access-check-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!user) return;
  const path = $("#access-path").value.trim(),
    version = sessionVersion;
  void perform(async () => {
    $("#access-result").textContent = "Checking with your current login…";
    try {
      // Validate this session with Auth before interpreting a Storage rejection.
      const { data, error } = await client.auth.getUser();
      if (error || data.user?.id !== user?.id)
        throw new Error("Session check failed. Sign in again and retry.");
      const email = data.user.email;
      const result = await probeDownload(client, path);
      if (version !== sessionVersion) return;
      $("#access-result").textContent =
        result.kind === "returned"
          ? `FILE RETURNED to ${email} (${result.bytes} bytes). Expected as A; isolation fails if this is B requesting A’s file.`
          : `FILE NOT RETURNED to ${email} (HTTP ${result.status}). Confirm A can access this exact path and B can download its own file before counting this as a pass.`;
    } catch (error) {
      if (version !== sessionVersion) return;
      $("#access-result").textContent = `INCONCLUSIVE: ${error.message}`;
    }
  });
});
connect();
