const commonHeaders = {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
};

function reply(body, type = "text/html", status = 200, headers = {}) {
    return new Response(body, {
        status,
        headers: { ...commonHeaders, "Content-Type": type + "; charset=utf-8", ...headers },
    });
}

function login(env) {
    // This key identifies the public project. Database operations still require Supabase Auth.
    const url = env.MEETLY_SUPABASE_URL?.replace(/\/$/, "");
    const key = env.MEETLY_SUPABASE_PUBLISHABLE_KEY;
    const configured = /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url ?? "") &&
        /^sb_publishable_[\w-]+$/.test(key ?? "");
    const content = configured ? `
        <section class="card"><h1>Zaloguj się</h1><p>Użyj fikcyjnego konta otrzymanego od prowadzącej spotkanie.</p>
        <p id="login-error" class="form-error" role="alert" hidden></p>
        <form id="meetly-login" class="login-form" action="/logowanie" method="post">
          <label class="form-field">Adres e-mail <input type="email" id="login-email" autocomplete="username" required></label>
          <label class="form-field">Hasło <input type="password" id="login-password" autocomplete="current-password" required></label>
          <button class="button primary">Zaloguj się</button>
        </form></section>` : '<section class="card"><h1>Logowanie chwilowo niedostępne</h1></section>';
    const page = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meetly Demo</title><link rel="stylesheet" href="/app.css"></head>
    <body class="dashboard-page"><header class="site-header"><div class="header-content"><div class="brand"><span class="brand-mark" aria-hidden="true">m</span>meetly</div><span class="demo-tag">Dane demonstracyjne</span></div></header>
    <main id="app" class="workspace"${configured ? ` data-service="${url}" data-public-key="${key}"` : ""}>${content}</main>${configured ? '<script src="/app.js" defer></script>' : ""}</body></html>`;
    return reply(page, "text/html", configured ? 200 : 503, {
        "Content-Security-Policy": `default-src 'none'; script-src 'self'; style-src 'self'; connect-src ${configured ? url : "'none'"}; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
    });
}

export default {
    fetch(request, env) {
        const { pathname } = new URL(request.url);
        if (request.method === "GET") {
            if (pathname === "/" || pathname === "/logowanie") return login(env);
            if (pathname === "/app.css") return reply(STYLE, "text/css");
            if (pathname === "/app.js") return reply(CLIENT, "text/javascript");
            if (pathname === "/przeglad") return reply(null, "text/plain", 303, { Location: "/logowanie" });
        }
        if (pathname === "/api/state" || pathname === "/api/action") {
            return reply('{"error":"expired"}', "application/json", 401);
        }
        return reply("Nie znaleziono strony.", "text/plain", 404);
    },
};
