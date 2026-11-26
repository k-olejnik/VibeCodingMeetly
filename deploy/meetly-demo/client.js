const app = document.querySelector("#app");
const loginPage = app.innerHTML;
const roleName = { pm:"PM", director:"Dyrektor", programmer:"Programista", analyst:"Analityk" };
const labels = { przeglad:"Przegląd", spotkania:"Spotkania", zadania:"Zadania", raport:"Raport tygodniowy", import:"Import z Element" };
const errors = { forbidden:"To konto nie ma uprawnienia do tej operacji.", invalid:"Sprawdź wprowadzone dane.", already:"Szkic został już zatwierdzony albo zamknięty.", active:"Najpierw zakończ trwające nagranie demonstracyjne.", unavailable:"Nie udało się wykonać operacji. Spróbuj ponownie." };
const dateFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone:"Europe/Warsaw",year:"numeric",month:"2-digit",day:"2-digit" });
const displayFormatter = new Intl.DateTimeFormat("pl-PL", {timeZone:"Europe/Warsaw",dateStyle:"medium"});
const meetingTimeFormatter = new Intl.DateTimeFormat("pl-PL", {timeZone:"Europe/Warsaw",dateStyle:"medium",timeStyle:"short"});
const day = value => dateFormatter.format(value ? new Date(value) : new Date());
const displayDate = value => value ? displayFormatter.format(new Date(value)) : "";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const empty = text => `<p class="dashboard-empty">${text}</p>`;
const checked = value => value ? " checked" : "";
let data;
let view = "przeglad";
let selection;
let taskEditor;
let reportDate = day();
let filters = {};
let activeRequest = false;
let accessToken;
let sessionTimer;

const button = (action, label, id = "", variant = "secondary") =>
    `<button type="button" class="button ${variant}" data-action="${action}" data-id="${escape(id)}">${label}</button>`;
const panel = (title, body) => `<section class="dashboard-panel"><div class="panel-heading"><h2>${title}</h2></div>${body}</section>`;
const nameFor = id => data.people.find(person => person.id === id)?.name ?? "";
const clarifyTask = "clarify";
const options = id => '<option value="">Wybierz osobę</option>' + data.people.map(person =>
    `<option value="${escape(person.id)}"${person.id === id ? " selected" : ""}>${escape(person.name)}</option>`).join("");
const checkboxes = (name, values, people = data.people, fixed = "") => people.map(person =>
    `<label class="demo-check"><input type="checkbox" name="${name}" value="${escape(person.id)}"${checked(values.includes(person.id) || fixed === person.id)}${fixed === person.id ? " disabled" : ""}> ${escape(person.name)}</label>`).join("");
const privileged = () => ["pm","director"].includes(data.profile.role);

function provider(path, payload, token) {
    return fetch(new URL(path, app.dataset.service), {
        method: "POST", mode: "cors", credentials: "omit", cache: "no-store", redirect: "error",
        headers: { apikey: app.dataset.publicKey, "Content-Type": "application/json",
            ...(token ? {Authorization:`Bearer ${token}`} : {}) },
        body: JSON.stringify(payload),
    });
}

async function api(operation, payload = {}) {
    const token = accessToken;
    if (!token) throw new Error("expired");
    const response = await provider("/rest/v1/rpc/meetly_demo_action", {operation,payload}, token);
    if (token !== accessToken) throw new Error("expired");
    if (response.status === 401) {
        showLogin("Sesja wygasła. Zaloguj się ponownie.");
        throw new Error("expired");
    }
    const result = await response.json();
    if (token !== accessToken) throw new Error("expired");
    if (!response.ok || result.error) throw new Error(result.error ?? "unavailable");
    return result;
}

function loginError(message) {
    const element = document.querySelector("#login-error");
    if (element) {
        element.textContent = message;
        element.hidden = !message;
    }
}

function showLogin(message = "", replaceUrl = true) {
    clearTimeout(sessionTimer);
    accessToken = undefined;
    data = undefined;
    view = "przeglad";
    selection = undefined;
    taskEditor = undefined;
    filters = {};
    reportDate = day();
    if (replaceUrl) window.history.replaceState(null, "", "/logowanie");
    app.innerHTML = loginPage;
    loginError(message);
}

async function signIn(form) {
    const submit = form.querySelector("button");
    if (submit.disabled) return;
    const email = form.querySelector("#login-email").value.trim().toLowerCase();
    const passwordField = form.querySelector("#login-password");
    const password = passwordField.value;
    passwordField.value = "";
    const invalid = "Nie udało się zalogować. Sprawdź dane konta demonstracyjnego.";
    const unavailable = "Nie udało się połączyć z usługą logowania. Spróbuj ponownie.";
    if (!email.endsWith("@example.test") || email.length > 254 || !password) { loginError(invalid); return; }
    submit.disabled = true;
    loginError("");
    try {
        const response = await provider("/auth/v1/token?grant_type=password", {email,password});
        if (!response.ok) {
            loginError([400,401,403,422].includes(response.status) ? invalid : unavailable);
            return;
        }
        const session = await response.json();
        if (!/^[\w.-]{20,3000}$/.test(session.access_token ?? "") ||
            !Number.isSafeInteger(session.expires_in) || session.expires_in <= 0) throw new Error("unavailable");
        accessToken = session.access_token;
        data = await api("state");
        if (!data.profile || !roleName[data.profile.role]) { showLogin(invalid); return; }
        sessionTimer = setTimeout(() => showLogin("Sesja wygasła. Zaloguj się ponownie."), Math.min(3600,session.expires_in)*1000);
        window.history.replaceState(null, "", "/przeglad");
        render();
    } catch (error) {
        if (error.message !== "expired") showLogin(error.message === "forbidden" ? invalid : unavailable);
    } finally {
        submit.disabled = false;
    }
}

function signOut() {
    const token = accessToken;
    showLogin();
    if (token) void provider("/auth/v1/logout?scope=local", {}, token).catch(() => {});
}

function notice(text, error = false, selector = "#notice") {
    const node = document.querySelector(selector);
    if (!node) return;
    node.hidden = !text;
    node.textContent = text;
    node.classList.toggle("form-error", error);
}

async function mutate(operation, payload, next, message) {
    if (activeRequest) return;
    activeRequest = true;
    try {
        await api(operation,payload);
        data = await api("state");
        if (view === "detail" && !data.meetings.some(item => item.id === selection)) next = "spotkania";
        if (next) { view = next; selection = undefined; }
        taskEditor = undefined;
        render();
        const selector = view === "przeglad" && operation === "task_state" && payload.state === "closed" ? "#open-tasks-notice"
            : view === "detail" && operation === "set_access" ? "#access-notice" : "#notice";
        notice(message, false, selector);
    } catch (error) {
        if (error.message === "already") {
            try {
                data = await api("state");
                view = "import";
                selection = undefined;
                render();
            } catch { /* Keep the original error if refresh fails. */ }
        }
        if (error.message !== "expired") notice(errors[error.message] ?? errors.unavailable, true);
    } finally {
        activeRequest = false;
    }
}

async function showView(next, id) {
    if (activeRequest) return;
    activeRequest = true;
    try {
        data = await api("state");
        view = next;
        selection = id;
        taskEditor = undefined;
        render();
    } catch (error) {
        if (error.message !== "expired") notice(errors.unavailable, true);
    } finally {
        activeRequest = false;
    }
}

function render() {
    if (view === "raport" && !privileged()) view = "przeglad";
    const tabs = Object.entries(labels).filter(([key]) => key !== "raport" || privileged());
    const activeTab = view === "draft" ? "import" : view === "detail" ? "spotkania" : view;
    const h1 = view === "draft" ? "Szkic spotkania" : view === "detail" ? "Wynik spotkania" : labels[view];
    const panels = { przeglad:overview, spotkania:meetingHistory, zadania:() => panel("Zadania ze spotkań",taskList(data.tasks)), raport:report, import:queue, draft:draftEditor, detail:meetingDetail };
    app.innerHTML = `<div class="overview-heading"><h1>${h1}</h1><div class="dashboard-account"><dl class="account-details"><div><dt>Konto demonstracyjne</dt><dd>${escape(data.profile.name)}</dd></div><div><dt>Rola</dt><dd>${roleName[data.profile.role]}</dd></div></dl>
    <form id="meetly-logout" method="post" action="/logowanie"><button class="button secondary">Wyloguj się</button></form></div></div>
    <nav class="overview-nav" aria-label="Nawigacja Meetly">${tabs.map(([key,label])=>`<button type="button" data-action="view" data-id="${key}"${key===activeTab?' aria-current="page"':""}>${label}</button>`).join("")}</nav>
    <p id="notice" class="demo-notice" role="status" hidden></p>${panels[view]()}`;
}

function meetingRows(items, {draft = false, showTime = false} = {}) {
    return items.length ? items.map(item => {
        const time = showTime ? item.started ?? item.ended : item.ended;
        const when = showTime && time ? meetingTimeFormatter.format(new Date(time)) : displayDate(time);
        return `<div class="meeting-row"><span class="meeting-icon" aria-hidden="true">◷</span>
        <span class="meeting-copy"><strong>${escape(item.title)}</strong><time datetime="${escape(time)}">${when}</time></span>
        <span class="status-pill${draft ? "" : " done"}">${item.generationFailed ? "Błąd symulacji AI" : draft ? "Do zatwierdzenia" : "Zatwierdzone"}</span>
        ${button(draft?"draft":"detail",draft?"Sprawdź szkic":"Szczegóły",item.id,draft?"primary":"secondary")}</div>`;
    }).join("")
        : empty(draft ? "Brak spotkań do zatwierdzenia." : "Brak dostępnych spotkań.");
}

function taskList(items, {canEdit = false, showContext = true} = {}) {
    if (!items.length) return empty("Brak zadań.");
    return `<ul class="demo-tasks">${items.map(task => {
        const status = task.closedAt ? `Zamknięto ${displayDate(task.closedAt)}` : task.status === "closed" ? "Zamknięte" : "Otwarte";
        const details = [task.person, showContext && status, showContext && task.title, task.due && `Termin ${displayDate(task.due)}`];
        const description = `<strong>${escape(task.text)}</strong><span class="task-meta">${details.filter(Boolean).map(escape).join(" · ")}</span>`;
        return `<li class="interactive-task"><div>${description}</div>
        <div class="task-actions">${data.profile.role==="pm" ? button(task.status==="closed"?"open":"close",task.status==="closed"?"Otwórz ponownie":"Zamknij",task.id) : ""}
        ${canEdit ? button("edit-meeting-task","Edytuj",task.id) : ""}
        ${task.canDelete ? button("delete-task","Usuń",task.id) : ""}</div></li>`;
    }).join("")}</ul>`;
}

function overviewTaskGroup(meeting, tasks) {
    const start = meeting.started ?? meeting.ended;
    const title = meeting.id ? button("detail",escape(meeting.title),meeting.id,"overview-meeting-link") : escape(meeting.title);
    return `<section class="overview-task-group"><div class="overview-task-group-heading"><h3>${title}</h3>
        ${start ? `<time datetime="${escape(start)}">${displayDate(start)}</time>` : ""}</div>
        ${tasks.length ? taskList(tasks,{showContext:false}) : '<p class="overview-no-tasks">Brak otwartych zadań.</p>'}</section>`;
}

function overviewTasks(items, meetings, recent) {
    const meetingByTask = new Map(meetings.flatMap(meeting => (meeting.tasks ?? []).map(task => [task.id, meeting.id])));
    const groups = new Map();
    for (const task of items) {
        const meetingId = meetingByTask.get(task.id) ?? null;
        if (!groups.has(meetingId)) groups.set(meetingId, []);
        groups.get(meetingId).push(task);
    }
    const manual = {id:null,title:"Zadania ręczne"};
    const latest = recent.map(meeting => overviewTaskGroup(meeting,groups.get(meeting.id) ?? [])).join("") +
        (groups.has(null) ? overviewTaskGroup(manual,groups.get(null)) : "");
    const today = day();
    const overdue = [...meetings,manual].map(meeting => {
        const tasks = (groups.get(meeting.id) ?? []).filter(task => task.due && task.due < today);
        return tasks.length ? overviewTaskGroup(meeting,tasks) : "";
    }).join("");
    return (latest || empty("Brak otwartych zadań.")) + (overdue ?
        `<section class="overview-overdue" aria-labelledby="overdue-heading"><h3 id="overdue-heading">Po terminie</h3>${overdue}</section>` : "");
}

function overview() {
    const open = data.tasks.filter(task=>task.status==="open");
    const meetings = data.meetings.toSorted((a,b) => Date.parse(b.started ?? b.ended) - Date.parse(a.started ?? a.ended));
    const recent = meetings.slice(0,5);
    const values = [["Spotkania",data.meetings.length],["Otwarte zadania",open.length],["Szkice do zatwierdzenia",data.drafts.length]];
    return `<div class="dashboard-top">${button("view","Import z Element","import","primary")}</div><section class="stats-grid">${values.map(([label,num])=>`<article class="stat-card"><p>${label}</p><strong>${num}</strong></article>`).join("")}</section>
        ${panel("Ostatnie spotkania",meetingRows(recent,{showTime:true}))}
        ${panel("Najnowsze zadania",'<p id="open-tasks-notice" class="inline-notice" role="status" hidden></p>' + overviewTasks(open,meetings,recent))}`;
}

function ageLimit(count, unit) {
    const date = new Date(day()+"T12:00:00Z");
    if (unit === "months") {
        const original = date.getUTCDate();
        date.setUTCDate(1);
        date.setUTCMonth(date.getUTCMonth()-count);
        const last = new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
        date.setUTCDate(Math.min(original,last));
    } else date.setUTCDate(date.getUTCDate()-count*(unit==="weeks"?7:1));
    return day(date);
}

function meetingHistory() {
    const query = (filters.q ?? "").toLocaleLowerCase("pl");
    const ago = filters.age ? ageLimit(Number(filters.age),filters.unit) : "";
    const result = data.meetings.filter(item => {
        const date = day(item.ended);
        return (!query || `${item.title} ${item.summary}`.toLocaleLowerCase("pl").includes(query)) &&
            (!filters.from || date>=filters.from) && (!filters.to || date<=filters.to) && (!ago || date<ago);
    });
    return panel("Historia spotkań",`<form class="form-grid meeting-filters" data-form="filter">
        <label class="filter-query">Słowa w tytule lub skrócie<input type="search" name="q" value="${escape(filters.q)}"></label>
        <label class="filter-date">Od<input type="date" name="from" value="${escape(filters.from)}"></label>
        <label class="filter-date">Do<input type="date" name="to" value="${escape(filters.to)}"></label>
        <label class="filter-age">Starsze niż<input type="number" name="age" min="1" max="1000" value="${escape(filters.age)}"></label>
        <label class="filter-unit">Jednostka<select name="unit">${[["days","Dni"],["weeks","Tygodnie"],["months","Miesiące"]].map(([value,label])=>`<option value="${value}"${filters.unit===value?" selected":""}>${label}</option>`).join("")}</select></label>
        <div class="task-actions"><button class="button primary">Szukaj</button>${button("clear","Wyczyść filtry")}</div></form>${meetingRows(result)}`);
}

function queue() {
    return panel("Spotkania do zatwierdzenia",`<p class="demo-subtitle">Symulacja Element i AI na fikcyjnych danych.</p>
        ${meetingRows(data.drafts,{draft:true})}`) +
        panel("Symulacja nagrywania",`<p class="demo-subtitle">Start zapisuje wybrane fikcyjne konta. Zatrzymanie przygotuje przykładowy szkic.</p>
        ${data.recordings.map(recording=>`<div class="meeting-row"><strong class="meeting-copy">${escape(recording.title)}</strong><div class="task-actions">${button("stop","Bot stop",recording.id,"primary")}${button("end","Zakończ rozmowę",recording.id)}${button("simulate-error","Przetestuj błąd AI",recording.id)}</div></div>`).join("")}
        ${data.recordings.length ? "" : `<form data-form="start" class="demo-form"><label>Tytuł spotkania<input name="title" maxlength="120" required></label>
        <fieldset><legend>Połączeni uczestnicy</legend>${checkboxes("people",[],data.people.filter(person=>person.login),data.profile.id)}</fieldset>
        <button class="button primary">Bot start</button></form>`}`) +
        (data.reimports.length ? panel("Ponowny import",data.reimports.map(item=>`<div class="meeting-row"><strong class="meeting-copy">${escape(item.title)}</strong>${button("reimport","Importuj ponownie",item.id)}</div>`).join("")) : "");
}

function editorTask(task = {}) {
    return `<div class="demo-task-editor"><label>Treść zadania<textarea name="task" maxlength="500" rows="2" required>${escape(task.text)}</textarea></label>
        <label>Osoba odpowiedzialna<select name="person" aria-required="true">${options(task.personId)}<option value="${clarifyTask}">Przenieś do tematów do wyjaśnienia</option></select></label>
        <p class="form-error" role="alert" hidden>Wybierz osobę albo przenieś tę sprawę do tematów do wyjaśnienia.</p>
        <label>Termin opcjonalny<input name="due" type="date" value="${escape(task.due)}"></label>
        ${button("remove-proposal","Usuń propozycję")}</div>`;
}

function draftEditor() {
    const draft = data.drafts.find(item=>item.id===selection);
    if (!draft) return panel("Szkic",empty("Szkic jest już niedostępny.") + button("view","Wróć do kolejki","import"));
    const discard = draft.canDiscard ? button("discard","Porzuć szkic",draft.id,"danger") : "";
    if (draft.generationFailed) return panel(escape(draft.title),`<p class="form-error">Nie udało się przygotować podsumowania. Spróbuj ponownie.</p>
        <p>To symulacja błędu AI na fikcyjnych danych.</p><div class="task-actions">${button("retry","Spróbuj ponownie",draft.id,"primary")}${button("view","Wróć do kolejki","import")}${discard}</div>`);
    return panel("Do zatwierdzenia",`<form class="demo-form" data-form="publish" data-id="${escape(draft.id)}">
        <label>Tytuł spotkania<input name="title" maxlength="120" required value="${escape(draft.title)}"></label>
        <div class="result-grid">
            <section class="result-panel"><h3>Podsumowanie</h3>
                <label class="summary-section">Skrót<textarea name="summary" rows="7" maxlength="10000" required>${escape(draft.summary)}</textarea></label>
                <label class="summary-section">Decyzje<textarea name="decisions" rows="4">${escape(draft.decisions)}</textarea></label>
                <label class="summary-section">Tematy do wyjaśnienia<textarea name="questions" rows="4">${escape(draft.questions)}</textarea></label>
            </section><section class="result-panel"><div class="panel-heading"><h3>Zadania</h3>${button("add-proposal","Dodaj zadanie")}</div>
                <p class="demo-subtitle">Zadania zapiszą się po kliknięciu „Zatwierdź wynik”. Przy każdej pozycji wybierz osobę albo przeniesienie do tematów do wyjaśnienia.</p>
                <div id="proposals">${draft.tasks.map(editorTask).join("")}</div>
            </section>
        </div>
        <fieldset><legend>Kto zobaczy spotkanie</legend>${checkboxes("access",draft.participants)}</fieldset>
        <div class="task-actions"><button class="button primary">Zatwierdź wynik</button>${button("view","Wróć do kolejki","import")}${discard}</div>
    </form>`);
}

function meetingTaskForm(meetingId, task) {
    return `<form class="demo-form meeting-task-form" data-form="meeting-task" data-id="${escape(meetingId)}" data-task="${escape(task?.id)}">
        <h4>${task ? "Edytuj zadanie" : "Nowe zadanie"}</h4>
        <label>Treść zadania<textarea name="text" maxlength="500" rows="2" required>${escape(task?.text)}</textarea></label>
        <label>Osoba odpowiedzialna<select name="person" required>${options(task?.personId)}</select></label>
        <label>Termin opcjonalny<input name="due" type="date" value="${escape(task?.due)}"></label>
        <div class="task-actions"><button class="button primary">${task ? "Zapisz zmiany" : "Dodaj otwarte zadanie"}</button>${button("cancel-task-editor","Anuluj")}</div>
    </form>`;
}

async function showTranscript(id) {
    const dialog = document.querySelector("#transcript-dialog");
    if (!dialog || dialog.open) return;
    const content = dialog.querySelector("#transcript-excerpt");
    content.textContent = "Wczytywanie…";
    dialog.showModal();
    try {
        const result = await api("transcript_preview", {id});
        content.textContent = result.text;
    } catch (error) {
        if (error.message !== "expired") content.textContent = errors[error.message] ?? errors.unavailable;
    }
}

function meetingDetail() {
    const meeting = data.meetings.find(item=>item.id===selection);
    if (!meeting) return panel("Wynik spotkania",empty("Wynik jest już niedostępny.") + button("view","Wróć do Spotkań","spotkania"));
    const content = (label,items) => items.length ? `<div class="summary-section"><h4>${label}</h4>${items.map(item=>`<p class="preserve-lines">${escape(item)}</p>`).join("")}</div>` : "";
    const editingTask = meeting.tasks.find(task => task.id === taskEditor);
    const openEditor = meeting.canEditTasks && (taskEditor === "" || editingTask);
    const back = button("view","Wróć do spotkań","spotkania");
    return panel(escape(meeting.title),`<p>${displayDate(meeting.ended)}</p>
        <div class="result-grid"><section class="result-panel"><h3>Podsumowanie</h3>${content("Skrót",[meeting.summary])}${content("Decyzje",meeting.decisions)}${content("Tematy do wyjaśnienia",meeting.questions)}</section>
        <section class="result-panel"><div class="panel-heading"><h3>Zadania</h3>${meeting.canEditTasks ? button("add-meeting-task","Dodaj zadanie") : ""}</div>
        ${openEditor ? meetingTaskForm(meeting.id,editingTask) : ""}${taskList(meeting.tasks,{canEdit:meeting.canEditTasks})}</section></div>
        ${button("preview-transcript","Podgląd transkrypcji",meeting.id)}
        <dialog id="transcript-dialog" class="transcript-dialog" aria-labelledby="transcript-heading">
          <div class="panel-heading"><h3 id="transcript-heading">Podgląd transkrypcji</h3><form method="dialog"><button class="button secondary">Zamknij</button></form></div>
          <p>Przykład demonstracyjny utworzony z zatwierdzonego skrótu spotkania.</p>
          <p id="transcript-excerpt" class="preserve-lines" aria-live="polite"></p>
        </dialog>
        ${meeting.canManage ? `<form class="demo-form" data-form="access" data-id="${escape(meeting.id)}"><fieldset><legend>Dostęp do spotkania</legend>
        ${checkboxes("access",meeting.access)}</fieldset>
        <div class="task-actions meeting-access-actions"><button class="button primary">Zapisz listę dostępu</button>${back}${button("delete-meeting","Usuń spotkanie",meeting.id,"danger")}</div>
        <p id="access-notice" class="inline-notice" role="status" hidden></p></form>` : `<div class="task-actions meeting-access-actions">${back}</div>`}`);
}

function report() {
    const start = new Date(reportDate+"T12:00:00Z");
    start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate()+6);
    const closed = data.closures.filter(task=>day(task.closedAt)>=day(start) && day(task.closedAt)<=day(end));
    const open = data.tasks.filter(task=>task.status==="open");
    const people = [...new Set(open.map(task=>task.personId))];
    return panel("Raport tygodniowy",`<form data-form="report" class="form-grid"><label>Data z wybranego tygodnia<input name="week" type="date" value="${escape(reportDate)}" required></label><button class="button secondary">Pokaż tydzień</button></form>
        <p class="demo-subtitle">${displayDate(start)} – ${displayDate(end)}</p>
        <h3>Zamknięte w tym tygodniu</h3>${closed.length ? taskList(closed) : empty("W tym tygodniu nie zamknięto zadań.")}
        <h3>Otwarte zadania według osób</h3>${people.length ? people.map(person=>`<h4>${escape(nameFor(person))}</h4>${taskList(open.filter(task=>task.personId===person))}`).join("") : empty("Brak otwartych zadań.")}
        ${data.profile.role==="pm" ? `<form data-form="add-task" class="demo-form"><h3>Dodaj wykonane zadanie</h3>
        <label>Treść<input name="text" maxlength="500" required></label><label>Osoba odpowiedzialna<select name="person" required>${options("")}</select></label><button class="button primary">Dodaj zadanie</button></form>` : ""}`);
}

app.addEventListener("click",event=>{
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const {action,id} = control.dataset;
    if (action==="view") { void showView(id); return; }
    if (action==="draft" || action==="detail") { void showView(action,id); return; }
    if (action==="clear") { filters={}; render(); return; }
    if (action==="preview-transcript") { void showTranscript(id); return; }
    if (action==="add-meeting-task" || action==="edit-meeting-task" || action==="cancel-task-editor") {
        taskEditor = action === "cancel-task-editor" ? undefined : id;
        render();
        document.querySelector(".meeting-task-form textarea")?.focus();
        return;
    }
    if (action==="add-proposal") {
        const proposals = document.querySelector("#proposals");
        proposals.insertAdjacentHTML("beforeend",editorTask());
        proposals.lastElementChild.querySelector("textarea").focus();
        return;
    }
    if (action==="remove-proposal") { control.closest(".demo-task-editor").remove(); return; }
    const actions = {
        close:["task_state",{id,state:"closed"},null,"Zamknięto zadanie."],
        open:["task_state",{id,state:"open"},null,"Ponownie otwarto zadanie."],
        stop:["stop",{id},"import","Przygotowano szkic demonstracyjny."],
        end:["stop",{id},"import","Rozmowa zakończona. Przygotowano szkic demonstracyjny."],
        "simulate-error":["stop",{id,simulateFailure:true},"import","Rozmowa zakończona. Zasymulowano błąd AI."],
        retry:["retry",{id},null,"Przygotowano szkic demonstracyjny."],
        discard:["discard",{id},"import","Porzucono szkic.","Czy porzucić szkic?"],
        "delete-task":["delete_task",{id},null,"Usunięto zadanie.","Czy na pewno chcesz usunąć zadanie?"],
        "delete-meeting":["delete_meeting",{id},"spotkania","Usunięto spotkanie.","Czy na pewno chcesz usunąć spotkanie?"],
        reimport:["reimport",{id},"import","Przygotowano nowy szkic demonstracyjny."],
    };
    const config = actions[action];
    if (config && (!config[4] || confirm(config[4]))) void mutate(...config.slice(0,4));
});

app.addEventListener("change",event=>{
    const person = event.target.closest(".demo-task-editor select[name=person]");
    if (person?.value) {
        person.removeAttribute("aria-invalid");
        person.closest(".demo-task-editor").querySelector(".form-error").hidden = true;
    }
});

app.addEventListener("submit",event=>{
    const form = event.target;
    if (form.id === "meetly-login" || form.id === "meetly-logout") {
        event.preventDefault();
        if (form.id === "meetly-login") void signIn(form);
        else signOut();
        return;
    }
    if (!form.dataset.form) return;
    event.preventDefault();
    const fields = new FormData(form);
    const get = key => String(fields.get(key) ?? "");
    const id = form.dataset.id;
    switch(form.dataset.form) {
        case "filter":
            if (get("from") && get("to") && get("from")>get("to")) {notice("Data „Od” musi poprzedzać datę „Do” lub być jej równa.",true);return;}
            filters=Object.fromEntries(fields); render(); break;
        case "report": reportDate=get("week"); render(); break;
        case "start": void mutate("start",{title:get("title"),people:[data.profile.id,...fields.getAll("people")]},"import","Rozpoczęto symulację nagrywania."); break;
        case "access": void mutate("set_access",{id,access:fields.getAll("access")},null,"Zapisano listę dostępu."); break;
        case "add-task": void mutate("add_task",{text:get("text"),person:get("person")},null,"Dodano wykonane zadanie."); break;
        case "meeting-task": {
            const task = form.dataset.task;
            const payload = {id,task,text:get("text"),person:get("person"),due:get("due")};
            void mutate(task ? "edit_meeting_task" : "add_meeting_task",payload,null,task ? "Zapisano zmiany zadania." : "Dodano otwarte zadanie.");
            break;
        }
        case "publish": {
            for (const person of form.querySelectorAll(".demo-task-editor select[name=person]")) {
                if (person.value) continue;
                person.setAttribute("aria-invalid", "true");
                person.closest(".demo-task-editor").querySelector(".form-error").hidden = false;
                person.focus();
                return;
            }
            const values = fields.getAll("task");
            const people = fields.getAll("person");
            const dates = fields.getAll("due");
            const lines = key => get(key).split("\n").map(line=>line.trim()).filter(Boolean);
            void mutate("publish",{id,title:get("title"),summary:get("summary"),decisions:lines("decisions"),questions:lines("questions"),
                tasks:values.map((text,index)=>({text,person:people[index] === clarifyTask ? "" : people[index],due:dates[index]})),access:fields.getAll("access")},"spotkania","Zatwierdzono wynik spotkania.");
            break;
        }
    }
});

window.addEventListener("pagehide", () => { if (accessToken) showLogin("", false); });
