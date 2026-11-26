import { roleLabels } from "./supabase.ts";
import type { Account, DemoMeeting, DemoOverview, DemoSection, DemoTask } from "./supabase.ts";

export function page(title: string, content: string, dashboard = false): string {
    return `<!doctype html>
<html lang="pl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} · Meetly</title>
    <link rel="stylesheet" href="/app.css">
</head>
<body${dashboard ? ' class="dashboard-page"' : ""}>
    <header class="site-header">
        <div class="header-content">
            <div class="brand"><span class="brand-mark" aria-hidden="true">m</span>meetly</div>
            ${dashboard ? '<span class="demo-tag">Dane demonstracyjne</span>' : ""}
        </div>
    </header>
    <main class="workspace">
        ${content}
    </main>
</body>
</html>`;
}

export function configurationPage(): string {
    return page("Konfiguracja", `<section class="card" aria-labelledby="setup-title">
        <h1 id="setup-title">Dokończ konfigurację</h1>
        <p>Meetly nie może uruchomić przetwarzania. Sprawdź instrukcję „Jak uruchomić lokalnie” w pliku README.</p>
    </section>`);
}

export function loginPage(message?: string): string {
    const feedback = message ? `<p class="form-error" role="alert">${escapeHtml(message)}</p>` : "";
    return page("Logowanie", `<section class="card" aria-labelledby="login-title">
        <h1 id="login-title">Zaloguj się</h1>
        <p>Wersja demonstracyjna do pracy na fikcyjnych danych.</p>
        ${feedback}
        <form class="login-form" method="post" action="/logowanie">
            <div class="form-field">
                <label for="email">Adres e-mail</label>
                <input id="email" name="email" type="email" autocomplete="username" maxlength="254" required>
            </div>
            <div class="form-field">
                <label for="password">Hasło</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required>
            </div>
            <button class="button primary" type="submit">Zaloguj się</button>
        </form>
    </section>`);
}

const overviewSections = {
    przeglad: "Przegląd",
    spotkania: "Spotkania",
    zadania: "Zadania",
    szkice: "Import z Element",
} as const;

type WorkspaceSection = DemoSection | "przeglad";

export function overviewPage(account: Account, section: WorkspaceSection, data: DemoOverview | undefined): string {
    const links = Object.entries(overviewSections).map(([key, label]) =>
        `<a href="/przeglad?widok=${key}"${key === section ? ' aria-current="page"' : ""}>${label}</a>`,
    ).join("");
    const content = data ? overviewContent(section, data) : `<p class="form-error" role="alert">
        Nie udało się wczytać danych demonstracyjnych. <a href="/przeglad?widok=${section}">Spróbuj ponownie</a>.
    </p>`;

    return page(overviewSections[section], `<div class="dashboard">
        <div class="overview-heading">
            <div>
                <h1>${section === "przeglad" ? "Dzień dobry" : overviewSections[section]}</h1>
            </div>
            <div class="dashboard-account">
                <dl class="account-details">
                    <div><dt>Konto demonstracyjne</dt><dd>${escapeHtml(account.displayName)}</dd></div>
                    <div><dt>Rola</dt><dd>${roleLabels[account.role]}</dd></div>
                </dl>
                <form method="post" action="/wyloguj">
                    <button class="button secondary" type="submit">Wyloguj się</button>
                </form>
            </div>
        </div>
        <nav class="overview-nav" aria-label="Nawigacja Meetly">${links}</nav>
        ${content}
    </div>`, true);
}

function overviewContent(section: WorkspaceSection, data: DemoOverview): string {
    switch (section) {
        case "przeglad":
            return dashboardOverview(data);
        case "zadania":
            return panel("Zadania ze spotkań", data.tasks.length ? taskList(data.tasks) : empty("Nie masz jeszcze zadań ze spotkań."));
        case "szkice":
            return panel("Spotkania do zatwierdzenia", meetingRows(data.drafts, true));
        case "spotkania":
            return panel("Historia spotkań", meetingRows(data.meetings));
    }
}

function dashboardOverview(data: DemoOverview): string {
    const openTasks = data.tasks.filter(task => task.status === "open");
    const stats = [
        ["Dostępne spotkania", data.meetings.length],
        ["Zadania otwarte", openTasks.length],
        ["Szkice do zatwierdzenia", data.drafts.length],
    ] as const;
    return `<div class="dashboard-top">
        <a class="button primary" href="/przeglad?widok=szkice">Import z Element</a>
    </div>
    <section class="stats-grid" aria-label="Podsumowanie">
        ${stats.map(([label, value]) => `<article class="stat-card"><p>${label}</p><strong>${value}</strong></article>`).join("")}
    </section>
    ${panel("Ostatnie spotkania", meetingRows(data.meetings.slice(0, 3)), ['spotkania', 'Zobacz historię'])}
    ${panel("Otwarte zadania", openTasks.length ? taskList(openTasks.slice(0, 4)) : empty("Nie masz otwartych zadań."), ['zadania', 'Zobacz zadania'])}`;
}

function panel(title: string, content: string, more?: [DemoSection, string]): string {
    return `<section class="dashboard-panel">
        <div class="panel-heading">
            <h2>${title}</h2>
            ${more ? `<a class="text-button" href="/przeglad?widok=${more[0]}">${more[1]} →</a>` : ""}
        </div>
        ${content}
    </section>`;
}

function empty(message: string): string {
    return `<p class="dashboard-empty">${message}</p>`;
}

function meetingRows(meetings: DemoMeeting[], draft = false): string {
    if (!meetings.length) {
        return empty(draft ? "Brak spotkań do zatwierdzenia." : "Nie masz dostępnych spotkań.");
    }
    return meetings.map(meeting => `<details class="meeting-entry">
        <summary class="meeting-row">
            <span class="meeting-icon" aria-hidden="true">◷</span>
            <span class="meeting-copy">
                <strong>${escapeHtml(meeting.title)}</strong>
                <span>${displayDate(meeting.endedAt)}</span>
            </span>
            <span class="status-pill${draft ? "" : " done"}">${draft ? "Do zatwierdzenia" : "Zatwierdzone"}</span>
            <span class="button ${draft ? "primary" : "secondary"} meeting-action">
                <span class="on-close">${draft ? "Sprawdź szkic" : "Szczegóły"}</span>
                <span class="on-open">Zwiń</span>
            </span>
        </summary>
        <div class="meeting-content result-grid">
            <section class="result-panel">
                <h3>Podsumowanie</h3>
                <div class="summary-section"><h4>Skrót</h4><p class="preserve-lines">${escapeHtml(meeting.summary)}</p></div>
                ${textSection("Decyzje", meeting.decisions)}
                ${textSection("Tematy do wyjaśnienia", meeting.questions)}
            </section>
            <section class="result-panel">
                <h3>Zadania</h3>
                ${meeting.tasks.length ? taskList(meeting.tasks) : empty("Brak dostępnych zadań w tym spotkaniu.")}
            </section>
        </div>
    </details>`).join("");
}

function textSection(title: string, items: string[]): string {
    return items.length ? `<div class="summary-section"><h4>${title}</h4><ul class="preserve-lines">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : "";
}

function taskList(tasks: DemoTask[]): string {
    return `<ul class="demo-tasks">${tasks.map(task => {
        const status = task.status ? (task.status === "closed" ? "Zamknięte" : "Otwarte") : undefined;
        const fields = [task.assignee ?? "Do przypisania", status, task.dueDate && `Termin ${displayDate(task.dueDate)}`, task.meetingTitle];
        return `<li><strong>${escapeHtml(task.description)}</strong><p>${fields.filter(Boolean).map(value => escapeHtml(String(value))).join(" · ")}</p></li>`;
    }).join("")}</ul>`;
}

const dateFormatter = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" });

function displayDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

function escapeHtml(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
