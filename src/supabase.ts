import type { SupabaseConfig } from "./config.ts";

export const roleLabels = {
    pm: "PM",
    programmer: "Programista",
    analyst: "Analityk",
    director: "Dyrektor",
} as const;

export interface Account {
    displayName: string;
    role: keyof typeof roleLabels;
}

export interface SupabaseSession {
    accessToken: string;
    expiresAt: number;
}

export type DemoSection = "spotkania" | "zadania" | "szkice";

export interface DemoTask {
    description: string;
    assignee: string | null;
    status?: "open" | "closed";
    dueDate?: string | null;
    meetingTitle?: string | null;
}

export interface DemoMeeting {
    title: string;
    endedAt: string;
    summary: string;
    decisions: string[];
    questions: string[];
    tasks: DemoTask[];
}

export interface DemoOverview {
    meetings: DemoMeeting[];
    tasks: DemoTask[];
    drafts: DemoMeeting[];
}

type LoginResult = SupabaseSession | "invalid" | "unavailable";
type AccountResult = Account | "expired" | "unassigned" | "unavailable";

export function createSupabaseAuth(config: SupabaseConfig, transport: typeof fetch) {
    function request(path: string, options: RequestInit = {}, token?: string) {
        return transport(new URL(path, config.url), {
            ...options,
            headers: {
                apikey: config.publishableKey,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
            redirect: "error",
            signal: AbortSignal.timeout(5000),
        });
    }

    async function signIn(email: string, password: string): Promise<LoginResult> {
        try {
            const response = await request("/auth/v1/token?grant_type=password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if ([400, 401, 403, 422].includes(response.status)) {
                return "invalid";
            }
            if (!response.ok) {
                return "unavailable";
            }

            const body = await response.json();
            if (typeof body?.access_token !== "string" || !body.access_token ||
                !Number.isSafeInteger(body.expires_in) || body.expires_in <= 0) {
                return "unavailable";
            }

            return {
                accessToken: body.access_token,
                expiresAt: Date.now() + Math.min(body.expires_in, 3600) * 1000,
            };
        } catch {
            return "unavailable";
        }
    }

    async function getAccount(accessToken: string): Promise<AccountResult> {
        try {
            const user = await request("/auth/v1/user", {}, accessToken);
            if (user.status === 401 || user.status === 403) {
                return "expired";
            }
            if (!user.ok) {
                return "unavailable";
            }

            const response = await request("/rest/v1/accounts?select=display_name,role", {}, accessToken);
            if (response.status === 401) {
                return "expired";
            }
            if (!response.ok) {
                return "unavailable";
            }

            const profiles = await response.json();
            if (!Array.isArray(profiles) || profiles.length > 1) {
                return "unavailable";
            }
            const profile = profiles[0];
            if (!profile || profile.role === null) {
                return "unassigned";
            }
            if (typeof profile.display_name !== "string" || !profile.display_name.trim() ||
                typeof profile.role !== "string" || !Object.hasOwn(roleLabels, profile.role)) {
                return "unavailable";
            }

            return { displayName: profile.display_name, role: profile.role as Account["role"] };
        } catch {
            return "unavailable";
        }
    }

    async function signOut(accessToken: string): Promise<void> {
        try {
            await request("/auth/v1/logout?scope=local", { method: "POST" }, accessToken);
        } catch {
            // The app session is already revoked, even if Supabase is unavailable.
        }
    }

    async function getDemoOverview(accessToken: string, section: DemoSection): Promise<DemoOverview | undefined> {
        try {
            const response = await request("/rest/v1/rpc/meetly_demo_overview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ section }),
            }, accessToken);
            if (!response.ok) {
                return undefined;
            }
            const data = await response.json();
            if (Array.isArray(data?.meetings) && Array.isArray(data.tasks) && Array.isArray(data.drafts)) {
                return data as DemoOverview;
            }
        } catch {
            // Keep the profile available if the demo data cannot be fetched.
        }
        return undefined;
    }

    async function getDashboard(accessToken: string): Promise<DemoOverview | undefined> {
        const [meetings, tasks, drafts] = await Promise.all([
            getDemoOverview(accessToken, "spotkania"),
            getDemoOverview(accessToken, "zadania"),
            getDemoOverview(accessToken, "szkice"),
        ]);
        if (meetings && tasks && drafts) {
            return { meetings: meetings.meetings, tasks: tasks.tasks, drafts: drafts.drafts };
        }
        return undefined;
    }

    return { signIn, getAccount, signOut, getDemoOverview, getDashboard };
}
