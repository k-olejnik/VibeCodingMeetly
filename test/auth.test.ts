import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createMeetlyServer } from "../src/server.ts";

const supabaseUrl = "https://meetly-demo.supabase.co";
const publishableKey = "sb_publishable_fixture";
const fixturePassword = "fikcyjne-haslo-testowe";
const profiles = {
    "pm.a@example.test": { display_name: "PM A", role: "pm", label: "PM" },
    "dyrektor.a@example.test": { display_name: "Dyrektor A", role: "director", label: "Dyrektor" },
    "programista.a@example.test": { display_name: "Programista A", role: "programmer", label: "Programista" },
    "programista.b@example.test": { display_name: "Programista B", role: "programmer", label: "Programista" },
    "analityk.a@example.test": { display_name: "Analityk A", role: "analyst", label: "Analityk" },
    "bez.roli@example.test": { display_name: "Konto testowe", role: null, label: "" },
};

function fakeSupabase() {
    const sessions = new Map<string, keyof typeof profiles>();
    let sessionCount = 0;
    let unavailable = false;
    let requests = 0;
    let unexpectedRequest: string | undefined;

    const transport: typeof fetch = async (input, options) => {
        requests++;
        const url = new URL(input.toString());
        const headers = new Headers(options?.headers);
        if (url.origin !== supabaseUrl || headers.get("apikey") !== publishableKey) {
            unexpectedRequest = url.origin;
            throw new Error("Unexpected provider request");
        }
        if (unavailable) {
            return new Response("ZNACZNIK_BLEDU_DOSTAWCY", { status: 500 });
        }
        if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "password" && options?.method === "POST") {
            const body = JSON.parse(String(options.body));
            assert.deepEqual(Object.keys(body).sort(), ["email", "password"]);
            if (!Object.hasOwn(profiles, body.email) || body.password !== fixturePassword) {
                return Response.json({ message: "SZCZEGOL_UWIERZYTELNIANIA" }, { status: 400 });
            }
            const token = `fikcyjny-token-${++sessionCount}`;
            sessions.set(token, body.email);
            return Response.json({ access_token: token, expires_in: 3600 });
        }

        const token = headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
        const email = sessions.get(token);
        if (!email) {
            return new Response(null, { status: 401 });
        }
        if (url.pathname === "/auth/v1/user" && !url.search) {
            return Response.json({ id: "ZNACZNIK_IDENTYFIKATORA", email });
        }
        if (url.pathname === "/rest/v1/accounts" && url.search === "?select=display_name,role") {
            const { display_name, role } = profiles[email];
            return Response.json([{ display_name, role }]);
        }
        if (url.pathname === "/rest/v1/rpc/meetly_demo_overview" && options?.method === "POST") {
            const { section } = JSON.parse(String(options.body));
            assert(["spotkania", "zadania", "szkice"].includes(section));
            return Response.json({ meetings: [], tasks: [], drafts: section === "szkice" ? [{
                title: "<Fikcyjny szkic>", endedAt: "2026-11-24", summary: "Podsumowanie",
                decisions: [], questions: [], tasks: [],
            }] : [] });
        }
        if (url.pathname === "/auth/v1/logout" && url.searchParams.get("scope") === "local" && options?.method === "POST") {
            sessions.delete(token);
            return new Response(null, { status: 204 });
        }
        unexpectedRequest = url.pathname;
        throw new Error("Unexpected provider endpoint");
    };

    return {
        transport,
        expireSessions: () => sessions.clear(),
        makeUnavailable: () => { unavailable = true; },
        requestCount: () => requests,
        assertExpectedRequests: () => assert.equal(unexpectedRequest, undefined),
    };
}

async function startApp(context: TestContext) {
    const provider = fakeSupabase();
    const server = createMeetlyServer({
        MEETLY_SUPABASE_URL: supabaseUrl,
        MEETLY_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    }, provider.transport);
    const listening = once(server, "listening");
    server.listen(0, "127.0.0.1");
    await listening;
    const address = server.address();
    assert(address && typeof address === "object");
    const origin = `http://127.0.0.1:${address.port}`;

    context.after(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        provider.assertExpectedRequests();
    });

    function request(path: string, options: RequestInit = {}) {
        return fetch(`${origin}${path}`, { redirect: "manual", ...options });
    }

    function login(email: string, password = fixturePassword, requestOrigin = origin) {
        return request("/logowanie", {
            method: "POST",
            headers: { Origin: requestOrigin },
            body: new URLSearchParams({ email, password, role: "pm" }),
        });
    }

    return { provider, origin, request, login };
}

function extractCookie(response: Response): string {
    const value = response.headers.get("Set-Cookie");
    assert(value);
    assert.match(value, /^meetly_session=[\w-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=\d+$/);
    return value.split(";", 1)[0];
}

test("cztery role docierają do Przeglądu i nie mogą podszyć się pod PM", async (context) => {
    const app = await startApp(context);
    for (const [email, profile] of Object.entries(profiles).filter(([, profile]) => profile.role !== null)) {
        const login = await app.login(email);
        assert.equal(login.status, 303);
        assert.equal(login.headers.get("Location"), "/przeglad");
        const cookie = extractCookie(login);
        const overview = await app.request("/przeglad?rola=pm", { headers: { Cookie: cookie } });
        assert.equal(overview.status, 200);
        assert.equal(overview.headers.get("Cache-Control"), "no-store");
        const body = await overview.text();
        assert.match(body, new RegExp(`<dd>${profile.display_name}</dd>`));
        assert.match(body, new RegExp(`<dd>${profile.label}</dd>`));
        assert.doesNotMatch(body, /@example\.test|ZNACZNIK_IDENTYFIKATORA|fikcyjny-token|sb_publishable/);
        if (profile.role !== "pm") {
            assert.doesNotMatch(body, /<dd>PM<\/dd>/);
        }
        if (profile.display_name === "Programista A") {
            assert.doesNotMatch(body, /Programista B/);
            const data = await app.request("/api/konta", { headers: { Cookie: cookie } });
            assert.equal(data.status, 404);
        }
    }
});

test("Przegląd przekierowuje bez sesji, po wylogowaniu i po wygaśnięciu", async (context) => {
    const app = await startApp(context);
    const anonymous = await app.request("/przeglad");
    assert.equal(anonymous.status, 303);
    assert.equal(anonymous.headers.get("Location"), "/logowanie");
    assert.equal(await anonymous.text(), "");
    assert.equal(app.provider.requestCount(), 0);

    const cookie = extractCookie(await app.login("programista.a@example.test"));
    const crossSite = await app.request("/wyloguj", {
        method: "POST", headers: { Cookie: cookie, Origin: "https://outside.example.test" },
    });
    assert.equal(crossSite.status, 403);
    assert.equal((await app.request("/przeglad", { headers: { Cookie: cookie } })).status, 200);
    const logout = await app.request("/wyloguj", {
        method: "POST", headers: { Cookie: cookie, Origin: app.origin },
    });
    assert.equal(logout.status, 303);
    assert.match(logout.headers.get("Set-Cookie") ?? "", /Max-Age=0/);
    assert.equal((await app.request("/przeglad", { headers: { Cookie: cookie } })).headers.get("Location"), "/logowanie");

    const expiredCookie = extractCookie(await app.login("programista.b@example.test"));
    app.provider.expireSessions();
    const expired = await app.request("/przeglad", { headers: { Cookie: expiredCookie } });
    assert.equal(expired.status, 303);
    assert.equal(expired.headers.get("Location"), "/logowanie");
    assert.match(expired.headers.get("Set-Cookie") ?? "", /Max-Age=0/);
});

test("błędy logowania i brak roli nie ujawniają kont ani danych dostawcy", async (context) => {
    const app = await startApp(context);
    const rejected = await app.login("pm.a@example.test", fixturePassword, "https://outside.example.test");
    assert.equal(rejected.status, 403);
    assert.equal(app.provider.requestCount(), 0);
    const known = await app.login("pm.a@example.test", "niepoprawne");
    const unknown = await app.login("inne@example.test", "niepoprawne");
    assert.equal(known.status, 401);
    assert.equal(unknown.status, 401);
    const knownBody = await known.text();
    assert.equal(knownBody, await unknown.text());
    assert.doesNotMatch(knownBody, /@example\.test|SZCZEGOL_UWIERZYTELNIANIA/);

    const unassigned = await app.login("bez.roli@example.test");
    assert.equal(unassigned.status, 403);
    assert.equal(unassigned.headers.get("Set-Cookie"), null);
    assert.match(await unassigned.text(), /nie ma przypisanej roli/);
    app.provider.makeUnavailable();
    const unavailable = await app.login("pm.a@example.test");
    assert.equal(unavailable.status, 503);
    assert.doesNotMatch(await unavailable.text(), /ZNACZNIK_BLEDU_DOSTAWCY|@example\.test/);
});

test("formularz zachowuje pochodzenie żądania z Meetly i odrzuca Origin null", async (context) => {
    const app = await startApp(context);
    const form = await app.request("/logowanie");
    assert.equal(form.headers.get("Referrer-Policy"), "same-origin");
    assert.match(await form.text(), /method="post" action="\/logowanie"/);

    const unknownOrigin = await app.login("pm.a@example.test", fixturePassword, "null");
    assert.equal(unknownOrigin.status, 403);
    assert.equal(app.provider.requestCount(), 0);
});

test("Przegląd otwiera osobne widoki danych i bezpiecznie wyświetla treść szkicu", async (context) => {
    const app = await startApp(context);
    const cookie = extractCookie(await app.login("pm.a@example.test"));
    const meetings = await app.request("/przeglad", { headers: { Cookie: cookie } });
    const overview = await meetings.text();
    assert.match(overview, /Ostatnie spotkania/);
    assert.match(overview, /Import z Element/);
    assert.doesNotMatch(overview, /Fikcyjny szkic/);
    const drafts = await app.request("/przeglad?widok=szkice", { headers: { Cookie: cookie } });
    const queue = await drafts.text();
    assert.match(queue, /&lt;Fikcyjny szkic&gt;/);
    assert.match(queue, /Spotkania do zatwierdzenia/);
    assert.match(queue, /Sprawdź szkic/);
    assert.match(queue, /meeting-content result-grid/);
});
