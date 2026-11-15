const seed = [
  {
    id: "PM-1042",
    name: "Aisha Khan",
    initials: "AK",
    type: "Residence renewal",
    language: "English",
    status: "Documents needed",
    due: "20 Nov 2026",
    docs: [
      ["Passport copy", "Reviewed"],
      ["Current residence card", "Reviewed"],
      ["Address document", "Needs correction"],
      ["Supporting document", "Missing"],
    ],
  },
  {
    id: "PM-1043",
    name: "Lucas Ferreira",
    initials: "LF",
    type: "Family residence",
    language: "Español",
    status: "Ready for review",
    due: "24 Nov 2026",
    docs: [
      ["Passport copy", "Received"],
      ["Supporting document", "Reviewed"],
      ["Client intake", "Reviewed"],
    ],
  },
  {
    id: "PM-1044",
    name: "Priya Sharma",
    initials: "PS",
    type: "Residence renewal",
    language: "Hindi",
    status: "In preparation",
    due: "27 Nov 2026",
    docs: [
      ["Passport copy", "Reviewed"],
      ["Current residence card", "Received"],
      ["Supporting document", "Missing"],
    ],
  },
  {
    id: "PM-1045",
    name: "Omar Haddad",
    initials: "OH",
    type: "Initial consultation",
    language: "English",
    status: "Documents needed",
    due: "30 Nov 2026",
    docs: [
      ["Client intake", "Received"],
      ["Passport copy", "Missing"],
    ],
  },
];
let saved;
try {
  saved = JSON.parse(localStorage.getItem("permitmate-demo-v1"));
} catch {}
let state = saved || {
    cases: structuredClone(seed),
    messages: {},
    activity: [],
  },
  view = "overview",
  selected = state.cases[0].id,
  query = "",
  filter = "All cases",
  tour = false;
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  current = () => state.cases.find((c) => c.id === selected) || state.cases[0];
function save() {
  try {
    localStorage.setItem("permitmate-demo-v1", JSON.stringify(state));
  } catch {
    toast("Browser storage unavailable. Changes last for this visit.");
  }
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").style.display = "block";
  clearTimeout(window.tt);
  window.tt = setTimeout(() => ($("#toast").style.display = "none"), 4200);
}
function log(t) {
  state.activity.unshift(t);
  save();
}
function badge(c) {
  return `<span class="badge ${c.status === "Documents needed" ? "amber" : c.status === "In preparation" ? "blue" : ""}">${esc(c.status)}</span>`;
}
function person(c) {
  return `<div class="person"><span class="initial">${esc(c.initials)}</span><div><strong>${esc(c.name)}</strong><small>${esc(c.id)} · ${esc(c.language)}</small></div></div>`;
}
function heading(k, t, p, button = "") {
  return `<div class="heading"><div><div class="eyebrow">${k}</div><h1>${t}</h1><p class="muted">${p}</p></div>${button}</div>`;
}
const newButton =
  '<button class="primary" data-action="new">+ New case</button>';
function table(cases) {
  return `<div class="tablewrap"><table><thead><tr><th>CLIENT</th><th>CASE TYPE</th><th>STATUS</th><th>DOCUMENTS</th><th>TEAM TARGET*</th></tr></thead><tbody>${cases
    .map((c) => {
      let n = c.docs.filter((d) => d[1] === "Reviewed").length;
      return `<tr data-case="${c.id}" tabindex="0" role="button" aria-label="Open case for ${esc(c.name)}"><td>${person(c)}</td><td>${esc(c.type)}</td><td>${badge(c)}</td><td>${n}/${c.docs.length} reviewed<div class="progress"><i style="width:${(n / c.docs.length) * 100}%"></i></div></td><td>${esc(c.due)}</td></tr>`;
    })
    .join(
      "",
    )}</tbody></table>${!cases.length ? '<div class="empty">No matching cases.</div>' : ""}</div>`;
}
function activity() {
  return `<div class="card activity"><h3>Practice activity</h3>${[
    ...state.activity,
    "Aisha shared an address document",
    "Lucas completed his intake",
    "Priya’s case was assigned to Elena",
  ]
    .slice(0, 3)
    .map(
      (t, i) =>
        `<div class="activityitem">${esc(t)}<small>${i === 0 && state.activity.length ? "Just now · demo" : "Example activity"}</small></div>`,
    )
    .join("")}</div>`;
}
function overview() {
  let needed = state.cases.filter((c) =>
      c.docs.some((d) => d[1] === "Missing" || d[1] === "Needs correction"),
    ).length,
    review = state.cases.reduce(
      (n, c) => n + c.docs.filter((d) => d[1] === "Received").length,
      0,
    );
  return (
    heading(
      "YOUR PRACTICE, IN SYNC",
      "A clearer day. A moving caseload.",
      "Everything your team needs to keep clients moving forward.",
      newButton,
    ) +
    `<div class="stats"><div class="stat"><label>Active cases</label><strong>${state.cases.length.toString().padStart(2, "0")}</strong><small>Across your demonstration practice</small></div><div class="stat warn"><label>Clients with outstanding items</label><strong>${String(needed).padStart(2, "0")}</strong><small>Ready for a helpful follow-up</small></div><div class="stat"><label>Documents to review</label><strong>${String(review).padStart(2, "0")}</strong><small>Your expertise, where it matters</small></div><div class="stat"><label>Next team target*</label><strong style="font-size:24px">20 Nov</strong><small>*Illustrative internal target</small></div></div><div class="layout"><section><div class="card"><div class="cardhead"><div><h3>Your active cases</h3><p class="muted">A shared view of every next step.</p></div><button class="textbtn" data-view="cases">View all cases ↗</button></div>${table(state.cases.slice(0, 4))}</div><div class="banner"><div><h3>A familiar channel. A more organised practice.</h3><p class="muted">See how a client request becomes a reviewed WhatsApp reply.</p></div><button class="secondary" data-view="inbox">Open inbox →</button></div>${tour ? '<div class="tour"><strong>Your 3-minute demo</strong><br>1. Open Aisha’s case and review the document checklist.<br>2. Generate a sample follow-up and approve it in the inbox.<br>3. Open Client experience and simulate a document submission.<br>4. Return to the case and review the new document.</div>' : ""}</section><section class="rightcol"><div class="card insight"><div class="symbol">✧</div><div class="eyebrow">YOUR NEXT BEST STEP</div><h2>Aisha’s file needs<br>a little attention.</h2><p>An address document needs a clearer copy. Prepare a friendly follow-up for your review.</p><span class="badge">Sample AI suggestion</span><button class="secondary" data-action="open-aisha">Review case <span style="float:right">↗</span></button></div>${activity()}</section></div>`
  );
}
function casesView() {
  let c = state.cases.filter(
    (c) =>
      (c.name + " " + c.id).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All cases" || c.status === filter),
  );
  return (
    heading(
      "CASE MANAGEMENT",
      "Every case. One clear next step.",
      "Search clients, review files, and keep preparation on track.",
      newButton,
    ) +
    `<div class="tools"><input id="search" placeholder="Search client or case number" aria-label="Search cases" value="${esc(query)}"><select id="filter" aria-label="Filter by status">${["All cases", "Documents needed", "Ready for review", "In preparation"].map((f) => `<option ${f === filter ? "selected" : ""}>${f}</option>`).join("")}</select></div><div class="card">${table(c)}</div><p class="muted">*Team targets are illustrative internal dates, not official immigration deadlines.</p>`
  );
}
function detail() {
  let c = current();
  return (
    `<button class="back" data-view="cases">← All cases</button>` +
    heading(
      esc(c.id),
      esc(c.name),
      esc(c.type) + " · " + esc(c.language) + " · Assigned to Elena López",
      badge(c),
    ) +
    `<div class="detailgrid"><section class="card padding"><h2>Document checklist</h2><p class="muted">Illustrative items configured by the practice. The lawyer validates the requirements for each case.</p>${c.docs.map((d, i) => `<div class="checkrow"><span class="checkicon">${d[1] === "Reviewed" ? "✓" : d[1] === "Missing" ? "○" : "▧"}</span><div><strong>${esc(d[0])}</strong><small>${esc(d[1])}${d[1] === "Needs correction" ? " · Sample image is unreadable" : ""}</small></div>${d[1] === "Received" ? `<button data-review="${i}">Mark reviewed</button>` : d[1] === "Missing" || d[1] === "Needs correction" ? `<button data-request="${i}">Request copy</button>` : '<span class="badge">Reviewed</span>'}</div>`).join("")}<p class="muted">Demo metadata only. No actual identity documents are stored.</p></section><section><div class="card padding"><div class="eyebrow">✧ LAWYER’S COPILOT</div><h2 style="margin-top:14px">Prepare a client follow-up</h2><p class="muted">Create an editable sample message based on this checklist.</p><div class="draft"><strong>Case snapshot</strong><br>${c.docs.filter((d) => d[1] === "Reviewed").length} of ${c.docs.length} items reviewed.<br>Next action: ${c.docs.some((d) => d[1] === "Missing" || d[1] === "Needs correction") ? "collect outstanding documents" : "lawyer reviews case preparation"}.</div><div class="review">Lawyer approval required before a client receives advice.</div><button class="primary" data-action="draft">✧ Generate sample follow-up</button><p class="muted">Scripted demonstration · no live AI model</p></div><div class="card padding" style="margin-top:20px"><h3>Case controls</h3><p class="muted">Internal team target: ${esc(c.due)}<br>No government submission is performed.</p><label class="muted" for="case-status">Preparation status</label><select id="case-status" style="display:block;margin-top:8px;width:100%">${["Documents needed", "Ready for review", "In preparation"].map((s) => `<option ${s === c.status ? "selected" : ""}>${s}</option>`).join("")}</select></div></section></div>`
  );
}
function sampleDraft(c) {
  let items = c.docs
    .filter((d) => d[1] === "Missing" || d[1] === "Needs correction")
    .map((d) => d[0].toLowerCase());
  return c.language === "Español"
    ? `Hola ${c.name.split(" ")[0]}, estamos preparando tu expediente. ${items.length ? "Por favor, envíanos una copia legible de: " + items.join(", ") + "." : "Tu documentación está en revisión."} Puedes utilizar tu portal de cliente. Si tienes alguna pregunta, nuestro equipo te ayudará. — BCN Immigration Studio`
    : `Hi ${c.name.split(" ")[0]}, we’re preparing your case. ${items.length ? "Please share a clear copy of: " + items.join(", ") + "." : "Your documents are with our team for review."} You can use your client portal. If you have questions, our team is here to help. — BCN Immigration Studio`;
}
let draft = "";
function inbox() {
  let c = current(),
    msgs = state.messages[c.id] || [];
  return (
    heading(
      "CLIENT COMMUNICATION",
      "The conversation stays with the case.",
      "A simulated WhatsApp workspace, with your team in control.",
    ) +
    `<div class="card chatlayout"><div class="contacts">${state.cases.map((x) => `<button class="contact ${x.id === c.id ? "active" : ""}" data-contact="${x.id}">${person(x)}</button>`).join("")}</div><div><div class="chathead">${person(c)}<span class="badge">WhatsApp simulation</span></div><div class="messages"><div class="bubble">${c.language === "Español" ? "Hola, ¿me podéis indicar qué falta para preparar mi expediente?" : "Hello, could you let me know what is still needed for my case?"}<small>Client · sample message</small></div><div class="bubble out">${c.language === "Español" ? "Hola, voy a revisar tu expediente y te confirmaré los próximos pasos." : "Hello! I’ll review your file and confirm your next steps."}<small>Elena · sample reply</small></div>${msgs.map((m) => `<div class="bubble out">${esc(m)}<small>Approved by lawyer · simulated delivery</small></div>`).join("")}</div><div class="compose"><label class="muted" for="reply">Reply draft · editable before approval</label><textarea id="reply" placeholder="Write a reply or generate a sample follow-up">${esc(draft)}</textarea><div class="actions"><button class="secondary" data-action="draft-inbox">✧ Sample AI draft</button><button class="primary" data-action="send">Approve & simulate send →</button></div><p class="muted">No phone number is connected. No external message will be sent.${!["English", "Español"].includes(c.language) ? " Sample draft is in English; translation is not connected." : ""}</p></div></div></div>`
  );
}
function clientView() {
  let c = current();
  return (
    heading(
      "THE CLIENT EXPERIENCE",
      "Simple on a phone. Connected to your practice.",
      "A responsive client portal alongside the lawyer’s desktop workspace.",
    ) +
    `<div class="phonewrap"><div class="phone"><div class="phonebar"><strong>9:41</strong><span>● ● ▰</span></div><div class="phonebody"><div class="eyebrow">PERMITMATE · CLIENT PORTAL</div><h2>Hello, ${esc(c.name.split(" ")[0])}.</h2><p class="muted">Your next step is right here.</p><div class="draft"><strong>${esc(c.type)}</strong><br>${esc(c.id)} · BCN Immigration Studio<br>${badge(c)}</div><h3>Your documents</h3>${c.docs.map((d) => `<div class="checkrow"><span class="checkicon">${d[1] === "Reviewed" ? "✓" : "○"}</span><div>${esc(d[0])}<small>${esc(d[1])}</small></div></div>`).join("")}<button class="primary" data-action="upload">Simulate document submission ↑</button><p class="muted" style="font-size:10px">Fictional client preview. No files are uploaded.</p></div></div><div class="phonecopy"><div class="eyebrow">ONE CASE, TWO VIEWS</div><h1>Clear next steps.<br>Fewer back-and-forths.</h1><p class="muted">Previewing <strong>${esc(c.name)}</strong>. Select a different case from the case list to change this view.</p><ul><li>A checklist clients can understand on their phone.</li><li>A submission goes straight to the lawyer’s review queue.</li><li>The lawyer remains responsible for advice and case decisions.</li></ul><button class="secondary" data-action="back-case">Open lawyer’s case view →</button></div></div>`
  );
}
function render() {
  let labels = {
    overview: "Overview",
    cases: "Cases",
    detail: "Case workspace",
    inbox: "WhatsApp inbox",
    client: "Client experience",
  };
  $("#breadcrumb").textContent = labels[view];
  document
    .querySelectorAll("nav button")
    .forEach((b) =>
      b.classList.toggle(
        "active",
        b.dataset.view === (view === "detail" ? "cases" : view),
      ),
    );
  $("#casecount").textContent = state.cases.length;
  $("#main").innerHTML = {
    overview,
    cases: casesView,
    detail,
    inbox,
    client: clientView,
  }[view]();
}
function go(v) {
  view = v;
  render();
  window.scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  let b = e.target.closest("button,[data-case]");
  if (!b) return;
  if (b.dataset.view) {
    go(b.dataset.view);
    return;
  }
  if (b.dataset.case) {
    selected = b.dataset.case;
    go("detail");
    return;
  }
  if (b.dataset.contact) {
    selected = b.dataset.contact;
    draft = "";
    render();
    return;
  }
  if (b.dataset.review !== undefined) {
    let d = current().docs[Number(b.dataset.review)];
    d[1] = "Reviewed";
    log(`${current().name}: ${d[0]} reviewed`);
    render();
    toast("Document marked reviewed in the demo.");
    return;
  }
  if (b.dataset.request !== undefined) {
    draft = sampleDraft(current());
    go("inbox");
    toast("Sample request prepared for your review.");
    return;
  }
  switch (b.dataset.action) {
    case "new":
      $("#modal").showModal();
      break;
    case "open-aisha":
      selected = state.cases[0].id;
      go("detail");
      break;
    case "draft":
    case "draft-inbox":
      draft = sampleDraft(current());
      go("inbox");
      break;
    case "send": {
      let m = $("#reply").value.trim();
      if (!m) {
        toast("Write or generate a reply first.");
        break;
      }
      (state.messages[current().id] ??= []).push(m);
      log(`Reply approved for ${current().name} · demo`);
      draft = "";
      render();
      toast("Approved and added to the simulated conversation.");
      break;
    }
    case "upload": {
      let c = current(),
        d = c.docs.find((x) => ["Missing", "Needs correction"].includes(x[1]));
      if (!d) {
        toast("There are no outstanding document requests.");
        break;
      }
      d[1] = "Received";
      log(`${c.name} submitted ${d[0].toLowerCase()} · demo`);
      render();
      toast("Sample document received. The lawyer can now review it.");
      break;
    }
    case "back-case":
      go("detail");
      break;
  }
  if (b.classList.contains("close")) $("#modal").close();
});
document.addEventListener("keydown", (e) => {
  if (e.target.dataset.case && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    selected = e.target.dataset.case;
    go("detail");
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    query = e.target.value;
    let pos = e.target.selectionStart;
    render();
    $("#search").focus();
    $("#search").setSelectionRange(pos, pos);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "filter") {
    filter = e.target.value;
    render();
  }
  if (e.target.id === "case-status") {
    current().status = e.target.value;
    log(`${current().name}: status updated`);
    render();
    toast("Case status updated.");
  }
});
$("#newcase").addEventListener("submit", (e) => {
  e.preventDefault();
  let f = new FormData(e.target),
    name = f.get("name").trim();
  if (!name) return;
  let id = "PM-" + (1042 + state.cases.length);
  state.cases.push({
    id,
    name,
    initials: name
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase(),
    type: f.get("type"),
    language: f.get("language"),
    status: "Documents needed",
    due: "To be set",
    docs: [
      ["Client intake", "Missing"],
      ["Passport copy", "Missing"],
    ],
  });
  selected = id;
  log(`New demo case created for ${name}`);
  $("#modal").close();
  e.target.reset();
  go("detail");
  toast("Demo case created. No client invitation sent.");
});
$("#reset").onclick = () => {
  state = { cases: structuredClone(seed), messages: {}, activity: [] };
  selected = state.cases[0].id;
  query = "";
  filter = "All cases";
  draft = "";
  save();
  go("overview");
  toast("Demo restored to its starting state.");
};
const help = document.createElement("button");
help.textContent = "▷ Demo walkthrough";
help.className = "textbtn";
help.style.marginTop = "14px";
help.onclick = () => {
  tour = !tour;
  go("overview");
};
$(".sidebottom").append(help);
render();
