import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";

test("hostowane demo przechodzi do Przeglądu po zalogowaniu przez Supabase", async () => {
    const loginPage = "Formularz logowania";
    const app = {
        innerHTML: loginPage,
        dataset: { service: "https://demo.example.test", publicKey: "sb_publishable_fixture" },
        addEventListener() {},
    };
    const token = "fikcyjny.token.w.testach";
    const routes = [];
    const context = createContext({
        document: { querySelector: (selector) => selector === "#app" ? app : null },
        history: { replaceState: (_state, _title, route) => routes.push(route) },
        addEventListener() {},
        setTimeout: () => 0,
        clearTimeout() {},
        URL,
        fetch: async (url, request) => {
            if (url.pathname === "/auth/v1/token") {
                return Response.json({ access_token: token, expires_in: 3600 });
            }
            assert.equal(request.headers.Authorization, `Bearer ${token}`);
            if (url.pathname === "/auth/v1/logout") return new Response(null, { status: 204 });
            assert.equal(url.pathname, "/rest/v1/rpc/meetly_demo_action");
            return Response.json({
                profile: { id: "fixture", name: "PM A", role: "pm" },
                people: [], meetings: [], tasks: [], drafts: [],
            });
        },
    });
    context.window = context;
    const script = await readFile(new URL("../deploy/meetly-demo/client.js", import.meta.url), "utf8");
    runInContext(script, context);
    const inputs = {
        button: { disabled: false },
        "#login-email": { value: "pm.a@example.test" },
        "#login-password": { value: "wartość-testowa" },
    };

    await context.signIn({ querySelector: (selector) => inputs[selector] });
    assert.deepEqual(routes, ["/przeglad"]);
    assert.match(app.innerHTML, /<h1>Przegląd<\/h1>/);
    assert.match(app.innerHTML, /PM A/);
    assert.match(app.innerHTML, /Raport tygodniowy/);

    context.signOut();
    assert.deepEqual(routes, ["/przeglad", "/logowanie"]);
    assert.equal(app.innerHTML, loginPage);
});

test("zatwierdzenie szkicu wymaga wyboru wykonawcy lub przeniesienia sprawy", async () => {
    const listeners = {};
    const app = {
        dataset: {},
        addEventListener: (name, handler) => { listeners[name] = handler; },
    };
    const context = createContext({
        document: { querySelector: () => app },
        window: { addEventListener() {} },
        FormData: class {
            get() { return ""; }
            getAll(key) {
                if (key === "person") return [person.value];
                if (key === "task") return ["Przykładowe zadanie"];
                return [];
            }
        },
    });
    const script = await readFile(new URL("../deploy/meetly-demo/client.js", import.meta.url), "utf8");
    runInContext(script, context);
    const requests = [];
    context.mutate = (...args) => requests.push(args);

    const message = { hidden: true };
    const editor = { querySelector: () => message };
    const person = {
        value: "",
        invalid: false,
        focused: false,
        closest: (selector) => selector === ".demo-task-editor" ? editor : person,
        setAttribute() { this.invalid = true; },
        removeAttribute() { this.invalid = false; },
        focus() { this.focused = true; },
    };
    const form = { dataset: { form: "publish", id: "fixture" }, querySelectorAll: () => [person] };
    const submit = () => listeners.submit({ target: form, preventDefault() {} });

    submit();
    assert.equal(requests.length, 0);
    assert.equal(message.hidden, false);
    assert.equal(person.invalid, true);
    assert.equal(person.focused, true);

    person.value = "clarify";
    listeners.change({ target: person });
    assert.equal(message.hidden, true);
    assert.equal(person.invalid, false);
    submit();
    assert.equal(requests[0][0], "publish");
    assert.equal(requests[0][1].tasks[0].person, "");

    person.value = "fictional-account";
    submit();
    assert.equal(requests[1][1].tasks[0].person, "fictional-account");
});

test("Przegląd pokazuje pięć ostatnich spotkań z godziną i potwierdza zamknięcie przy zadaniach", async () => {
    const notices = Object.fromEntries(["#notice", "#open-tasks-notice"].map(id => [id, {
        hidden: true, textContent: "", classList: { toggle() {} },
    }]));
    const app = { innerHTML: "", addEventListener() {} };
    const meetings = [3, 1, 5, 2, 6, 4].map(index => ({
        id: String(index), title: `Spotkanie ${index}`,
        started: `2026-11-26T0${index}:30:00Z`, ended: "2026-11-26T12:00:00Z",
    }));
    const fixture = { profile: { name: "PM A", role: "pm" }, meetings, tasks: [], drafts: [] };
    const context = createContext({
        fixture,
        document: { querySelector: selector => selector === "#app" ? app : notices[selector] },
        window: { addEventListener() {} },
    });
    const script = await readFile(new URL("../deploy/meetly-demo/client.js", import.meta.url), "utf8");
    runInContext(script, context);
    context.api = async operation => operation === "state" ? fixture : { ok: true };

    await context.mutate("task_state", { id: "fixture", state: "closed" }, null, "Zamknięto zadanie.");
    assert.deepEqual([...app.innerHTML.matchAll(/<strong>(Spotkanie \d)<\/strong>/g)].map(match => match[1]),
        ["Spotkanie 6", "Spotkanie 5", "Spotkanie 4", "Spotkanie 3", "Spotkanie 2"]);
    assert.match(app.innerHTML, /2026-11-26T06:30:00Z">26 lis 2026, 07:30/);
    assert.equal(notices["#open-tasks-notice"].textContent, "Zamknięto zadanie.");
    assert.equal(notices["#notice"].hidden, true);
});

test("Najnowsze zadania pokazują pięć spotkań i wyróżniają otwarte zadania po terminie", async () => {
    const listeners = {};
    const app = { innerHTML: "", addEventListener: (name, handler) => { listeners[name] = handler; } };
    const tasks = [
        { id: "a", text: "Zaległe ze starszego spotkania", status: "open", due: "2026-11-24" },
        { id: "b", text: "Zadanie ręczne", status: "open" },
        { id: "c", text: "Zaległe z najnowszego spotkania", status: "open", due: "2026-11-25" },
        { id: "d", text: "Zadanie zamknięte", status: "closed", due: "2026-11-25" },
        { id: "e", text: "Zadanie na dziś", status: "open", due: "2026-11-26" },
        { id: "f", text: "Zadanie na jutro", status: "open", due: "2026-11-27" },
        { id: "g", text: "Przyszłe ze starszego spotkania", status: "open", due: "2026-11-30" },
    ];
    const meetings = Array.from({ length: 6 }, (_, index) => ({
        id: `meeting-${index}`, title: `Spotkanie ${index}`, started: `2026-11-2${index}T09:00:00Z`,
        summary: `Skrót ${index}`, decisions: [], questions: [], tasks: [],
    }));
    meetings[0].tasks = [tasks[0], tasks[6]];
    meetings[4].tasks = [tasks[5]];
    meetings[5].tasks = [tasks[2], tasks[3], tasks[4]];
    const fixture = {
        profile: { name: "PM A", role: "pm" }, drafts: [], tasks, meetings,
    };
    class FixedDate extends Date {
        constructor(...args) { super(...(args.length ? args : ["2026-11-25T23:10:00Z"])); }
    }
    const context = createContext({ fixture, Date: FixedDate, document: { querySelector: () => app }, window: { addEventListener() {} } });
    const script = await readFile(new URL("../deploy/meetly-demo/client.js", import.meta.url), "utf8");
    runInContext(script, context);
    const markup = runInContext("data = fixture; overview()", context);
    const [latest, overdue] = markup.split("<h2>Najnowsze zadania</h2>")[1].split('<section class="overview-overdue"');
    const meetingLinks = [...latest.matchAll(/data-action="detail" data-id="meeting-(\d)">Spotkanie \d<\/button>/g)];
    assert.deepEqual(meetingLinks.map(match => match[1]), ["5", "4", "3", "2", "1"]);
    assert.match(latest, /<time datetime="2026-11-25T09:00:00Z">25 lis 2026<\/time>/);
    assert.match(latest, /<strong>Zadanie na dziś<\/strong>/);
    assert.match(latest, /<strong>Zadanie ręczne<\/strong>/);
    assert.match(overdue, /Zaległe z najnowszego spotkania/);
    assert.match(overdue, /Zaległe ze starszego spotkania/);
    assert.doesNotMatch(overdue, /Zadanie na dziś|Zadanie na jutro|Zadanie ręczne/);
    assert.doesNotMatch(markup, /Zadanie zamknięte|Przyszłe ze starszego spotkania|data-action="task-detail"/);

    context.api = async () => fixture;
    const control = { dataset: {action:"detail", id:"meeting-5"} };
    listeners.click({ target: { closest: () => control } });
    await new Promise(resolve => setImmediate(resolve));
    assert.match(app.innerHTML, /<h1>Wynik spotkania<\/h1>/);
    assert.match(app.innerHTML, /Skrót 5/);
});
