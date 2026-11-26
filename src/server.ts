import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readSupabaseConfig } from "./config.ts";
import { createSupabaseAuth } from "./supabase.ts";
import type { SupabaseSession } from "./supabase.ts";
import { configurationPage, loginPage, overviewPage } from "./views.ts";

const stylesheet = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const cookieName = "meetly_session";
const invalidLogin = "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.";
const serviceUnavailable = "Usługa logowania jest chwilowo niedostępna. Spróbuj ponownie.";
const unassignedAccount = "Konto nie ma przypisanej roli w Meetly. Skontaktuj się z właścicielem projektu.";

export function createMeetlyServer(env: NodeJS.ProcessEnv, transport: typeof fetch = fetch) {
    const config = readSupabaseConfig(env);
    const auth = config && createSupabaseAuth(config, transport);
    const sessions = new Map<string, SupabaseSession>();

    async function handle(request: IncomingMessage, response: ServerResponse) {
        const host = request.headers.host ?? "";
        if (!/^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/.test(host)) {
            return send(response, 400, "text/plain", "Adres aplikacji jest nieprawidłowy.");
        }
        const [path, query] = request.url?.split("?", 2) ?? [];
        const read = request.method === "GET" || request.method === "HEAD";
        if (path === "/app.css" && read) {
            return send(response, 200, "text/css", stylesheet);
        }
        if (path !== "/" && path !== "/logowanie" && path !== "/przeglad" && path !== "/wyloguj") {
            return send(response, 404, "text/plain", "Nie znaleziono strony.");
        }
        if (!auth) {
            return send(response, 503, "text/html", configurationPage());
        }

        const sessionKey = getSessionKey(request);
        const session = sessionKey ? sessions.get(sessionKey) : undefined;
        const activeSession = session && session.expiresAt > Date.now() ? session : undefined;
        if (sessionKey && !activeSession) {
            sessions.delete(sessionKey);
            setSessionCookie(response, "", 0);
        }

        if (read && (path === "/" || path === "/logowanie")) {
            return activeSession
                ? redirect(response, "/przeglad")
                : send(response, 200, "text/html", loginPage());
        }
        if (read && path === "/przeglad") {
            if (!sessionKey || !activeSession) {
                return redirect(response, "/logowanie");
            }

            const account = await auth.getAccount(activeSession.accessToken);
            if (account === "unavailable") {
                return send(response, 503, "text/html", loginPage(serviceUnavailable));
            }
            if (account === "expired" || account === "unassigned") {
                sessions.delete(sessionKey);
                setSessionCookie(response, "", 0);
                return account === "expired"
                    ? redirect(response, "/logowanie")
                    : send(response, 403, "text/html", loginPage(unassignedAccount));
            }
            const requestedSection = new URLSearchParams(query).get("widok");
            const section = requestedSection === "spotkania" || requestedSection === "zadania" || requestedSection === "szkice"
                ? requestedSection : "przeglad";
            const token = activeSession.accessToken;
            const data = section === "przeglad"
                ? await auth.getDashboard(token)
                : await auth.getDemoOverview(token, section);
            if (sessions.get(sessionKey) !== activeSession || activeSession.expiresAt <= Date.now()) {
                return redirect(response, "/logowanie");
            }
            return send(response, 200, "text/html", overviewPage(account, section, data));
        }
        if (request.method === "POST" && (path === "/logowanie" || path === "/wyloguj")) {
            if (request.headers.origin !== `http://${host}`) {
                return send(response, 403, "text/plain", "Operacja jest niedostępna.");
            }
            if (path === "/wyloguj") {
                if (sessionKey) {
                    sessions.delete(sessionKey);
                }
                setSessionCookie(response, "", 0);
                if (activeSession) {
                    await auth.signOut(activeSession.accessToken);
                }
                return redirect(response, "/logowanie");
            }

            const credentials = await readCredentials(request);
            if (!credentials) {
                return send(response, 400, "text/html", loginPage(invalidLogin));
            }
            const nextSession = await auth.signIn(credentials.email, credentials.password);
            if (nextSession === "invalid") {
                return send(response, 401, "text/html", loginPage(invalidLogin));
            }
            if (nextSession === "unavailable") {
                return send(response, 503, "text/html", loginPage(serviceUnavailable));
            }
            const account = await auth.getAccount(nextSession.accessToken);
            if (typeof account === "string") {
                await auth.signOut(nextSession.accessToken);
                if (account === "unassigned") {
                    return send(response, 403, "text/html", loginPage(unassignedAccount));
                }
                return send(response, 503, "text/html", loginPage(serviceUnavailable));
            }

            for (const [key, candidate] of sessions) {
                if (candidate.expiresAt <= Date.now()) {
                    sessions.delete(key);
                }
            }
            if (sessionKey) {
                sessions.delete(sessionKey);
            }
            if (sessions.size >= 128) {
                const oldest = sessions.keys().next();
                if (!oldest.done) {
                    sessions.delete(oldest.value);
                }
            }
            const nextKey = randomBytes(32).toString("base64url");
            sessions.set(nextKey, nextSession);
            setSessionCookie(response, nextKey, Math.max(0, Math.floor((nextSession.expiresAt - Date.now()) / 1000)));
            return redirect(response, "/przeglad");
        }

        response.setHeader("Allow", path === "/logowanie" ? "GET, HEAD, POST" : path === "/wyloguj" ? "POST" : "GET, HEAD");
        return send(response, 405, "text/plain", "Operacja jest niedostępna.");
    }

    return createServer({ requestTimeout: 15_000 }, (request, response) => {
        void handle(request, response).catch(() => {
            if (!response.headersSent && !response.destroyed) {
                send(response, 503, "text/html", loginPage(serviceUnavailable));
            } else {
                response.destroy();
            }
        });
    });
}

function getSessionKey(request: IncomingMessage): string | undefined {
    for (const cookie of request.headers.cookie?.split(";") ?? []) {
        const [name, value] = cookie.trim().split("=", 2);
        if (name === cookieName && /^[\w-]{43}$/.test(value ?? "")) {
            return value;
        }
    }
    return undefined;
}

function setSessionCookie(response: ServerResponse, value: string, maxAge: number): void {
    // The desktop demonstration is bound to loopback HTTP. A TLS deployment must set Secure.
    response.setHeader("Set-Cookie", `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
}

async function readCredentials(request: IncomingMessage) {
    const mediaType = request.headers["content-type"]?.split(";", 1)[0];
    if (mediaType !== "application/x-www-form-urlencoded") {
        request.resume();
        return undefined;
    }

    let length = 0;
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
        length += chunk.length;
        if (length <= 4096) {
            chunks.push(chunk);
        }
    }
    if (length > 4096) {
        return undefined;
    }

    const fields = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
    const email = fields.get("email")?.trim();
    const password = fields.get("password");
    return email && email.length <= 254 && password ? { email, password } : undefined;
}

function redirect(response: ServerResponse, location: string): void {
    response.setHeader("Location", location);
    send(response, 303, "text/plain", "");
}

function send(response: ServerResponse, status: number, mediaType: string, body: string): void {
    response.writeHead(status, {
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        "Content-Type": `${mediaType}; charset=utf-8`,
        // A same-origin form POST must retain its Origin header for the CSRF check.
        "Referrer-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
    });
    response.end(body);
}

if (import.meta.main) {
    createMeetlyServer(process.env).listen(3000, "127.0.0.1", () => {
        console.log("Meetly: http://127.0.0.1:3000/");
    });
}
