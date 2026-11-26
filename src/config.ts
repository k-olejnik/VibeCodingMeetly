export interface SupabaseConfig {
    url: string;
    publishableKey: string;
}

export function readSupabaseConfig(env: NodeJS.ProcessEnv): SupabaseConfig | undefined {
    const value = env.MEETLY_SUPABASE_URL?.trim();
    const key = env.MEETLY_SUPABASE_PUBLISHABLE_KEY?.trim();

    if (!value || !key || !isPublishableKey(key)) {
        return undefined;
    }

    try {
        const url = new URL(value);
        const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
        const hosted = url.protocol === "https:" && /^[a-z0-9-]+\.supabase\.co$/.test(url.hostname);
        const localHttp = local && (url.protocol === "http:" || url.protocol === "https:");

        if (!(hosted || localHttp) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
            return undefined;
        }

        return { url: url.origin, publishableKey: key };
    } catch {
        return undefined;
    }
}

function isPublishableKey(key: string): boolean {
    if (/^sb_publishable_[\w-]+$/.test(key)) {
        return true;
    }

    const parts = key.split(".");
    if (parts.length !== 3 || parts.some((part) => !/^[\w-]+$/.test(part))) {
        return false;
    }

    try {
        return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))?.role === "anon";
    } catch {
        return false;
    }
}
