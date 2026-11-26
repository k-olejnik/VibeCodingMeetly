import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { get } from "node:http";
import type { Server } from "node:http";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { readSupabaseConfig } from "../src/config.ts";
import { createMeetlyServer } from "../src/server.ts";

const fixtureConfig = {
    MEETLY_SUPABASE_URL: "http://127.0.0.1:54321",
    MEETLY_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
};
const accountA = "00000000-0000-4000-8400-000000000003";
const accountB = "00000000-0000-4000-8400-000000000004";
let database: PGlite;

before(async () => {
    database = await PGlite.create();
    // These roles and auth.uid stand in for the local Supabase Auth schema.
    await database.exec(`
        create role authenticated;
        create role anon;
        create schema auth;
        create table auth.users (id uuid primary key);
        create function auth.uid() returns uuid language sql stable as
            'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
        grant usage on schema auth to authenticated, anon;
    `);
    const migration = new URL("../supabase/migrations/20261124000100_foundation.sql", import.meta.url);
    const seed = new URL("../supabase/seed.sql", import.meta.url);
    await database.exec(await readFile(migration, "utf8"));
    await database.exec(await readFile(seed, "utf8"));
    await database.query("insert into auth.users (id) values ($1), ($2)", [accountA, accountB]);
    await database.query("update public.accounts set auth_user_id = $1 where display_name = 'Programista A'", [accountA]);
    await database.query("update public.accounts set auth_user_id = $1 where display_name = 'Programista B'", [accountB]);
});

after(async () => {
    await database?.close();
});

async function asAccount<T = unknown>(id: string, sql: string, params: unknown[] = []) {
    return database.transaction(async (transaction) => {
        await transaction.exec("set local role authenticated");
        await transaction.query("select set_config('request.jwt.claim.sub', $1, true)", [id]);
        return transaction.query<T>(sql, params);
    });
}

test("fikcyjne konta tej samej roli widzą wyłącznie własne profile", async () => {
    const sql = "select display_name, role from public.accounts";
    assert.deepEqual((await asAccount(accountA, sql)).rows, [{ display_name: "Programista A", role: "programmer" }]);
    assert.deepEqual((await asAccount(accountB, sql)).rows, [{ display_name: "Programista B", role: "programmer" }]);
    assert.deepEqual((await asAccount(accountA, "select display_name from public.accounts where display_name = 'Programista B'")).rows, []);
    await assert.rejects(asAccount(accountA, "select email from public.accounts"), /permission denied/);
    await assert.rejects(asAccount(accountB, "select matrix_user_id from public.accounts"), /permission denied/);
    await assert.rejects(asAccount(accountA, "update public.accounts set role = 'pm'"), /permission denied/);
    await assert.rejects(asAccount(accountA, "select summary from public.meeting_results"), /permission denied/);
    await assert.rejects(asAccount(accountB, "select description from public.tasks"), /permission denied/);
    await assert.rejects(asAccount(accountB, "select storage_id from meetly_private.transcript_references"), /permission denied/);
});

test("dane startowe obejmują pięć fikcyjnych profili, spotkania i zadania", async () => {
    assert.deepEqual((await database.query("select count(*)::int as total from public.accounts")).rows, [{ total: 5 }]);
    assert.deepEqual((await database.query("select count(*)::int as total from public.meeting_results")).rows, [{ total: 2 }]);
    assert.deepEqual((await database.query("select count(*)::int as total from public.tasks")).rows, [{ total: 2 }]);
});

test("Git ignoruje konfigurację lokalną, a przykład zawiera wyłącznie nazwy", async () => {
    const ignored = spawnSync("git", ["check-ignore", "-q", "--", ".env"]);
    assert.equal(ignored.status, 0);
    const template = spawnSync("git", ["check-ignore", "-q", "--", ".env.example"]);
    assert.equal(template.status, 1);
    const example = await readFile(new URL("../.env.example", import.meta.url), "utf8");
    assert.match(example, /^(?:[A-Z_][A-Z_0-9]*=\n)+$/);
});

test("konfiguracja ogranicza adresy i odrzuca klucze uprzywilejowane", () => {
    assert.deepEqual(readSupabaseConfig(fixtureConfig), {
        url: "http://127.0.0.1:54321",
        publishableKey: "sb_publishable_fixture",
    });
    assert.equal(readSupabaseConfig({ ...fixtureConfig, MEETLY_SUPABASE_URL: "https://example.test" }), undefined);
    assert.equal(readSupabaseConfig({ ...fixtureConfig, MEETLY_SUPABASE_PUBLISHABLE_KEY: "sb_secret_fixture" }), undefined);
    const privilege = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
    assert.equal(readSupabaseConfig({ ...fixtureConfig, MEETLY_SUPABASE_PUBLISHABLE_KEY: `e30.${privilege}.fake` }), undefined);
});

async function requestPage(server: Server, path: string) {
    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    assert(address && typeof address === "object");
    try {
        return await new Promise<{ status?: number; body: string; cache?: string }>((resolve, reject) => {
            get({ hostname: "127.0.0.1", port: address.port, path }, (response) => {
                let body = "";
                response.setEncoding("utf8");
                response.on("data", (chunk) => { body += chunk; });
                response.once("end", () => resolve({
                    status: response.statusCode,
                    body,
                    cache: response.headers["cache-control"],
                }));
                response.once("error", reject);
            }).once("error", reject);
        });
    } finally {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
}

test("ekran demonstracyjny działa bez wywołania zewnętrznej usługi", async (context) => {
    context.mock.method(globalThis, "fetch", () => { throw new Error("Połączenie zewnętrzne w teście"); });
    const result = await requestPage(createMeetlyServer(fixtureConfig), "/");
    assert.equal(result.status, 200);
    assert.match(result.body, /Wersja demonstracyjna/);
    assert.doesNotMatch(result.body, /Programista|sb_publishable|example\.test/);
    assert.equal(result.cache, "no-store");
});

test("brak konfiguracji zwraca ogólny komunikat bez wartości konfiguracyjnej", async () => {
    const result = await requestPage(createMeetlyServer({ MEETLY_SUPABASE_PUBLISHABLE_KEY: "ZNACZNIK_SEKRETU" }), "/");
    assert.equal(result.status, 503);
    assert.match(result.body, /Dokończ konfigurację/);
    assert.doesNotMatch(result.body, /ZNACZNIK_SEKRETU|MEETLY_SUPABASE|example\.test/);
});

test("import prototypu zachowuje szkice, przypisania i zatwierdzone wyniki", async () => {
    const file = new URL("../supabase/demo/prototype-data.sql", import.meta.url);
    const sql = await readFile(file, "utf8");
    await database.exec(sql);
    await database.exec(sql);

    const counts = await database.query(`
        select
            (select count(*)::int from public.meetings where status = 'approved') as approved,
            (select count(*)::int from public.meeting_results) as results,
            (select count(*)::int from public.tasks) as tasks,
            (select count(*)::int from public.task_changes where status = 'closed') as closures,
            (select count(*)::int from meetly_private.prototype_drafts) as drafts,
            (select sum(jsonb_array_length(proposed_tasks))::int from meetly_private.prototype_drafts) as proposals,
            (select count(*)::int from public.accounts where role is null and auth_user_id is null) as placeholders
    `);
    assert.deepEqual(counts.rows, [{
        approved: 7, results: 7, tasks: 13, closures: 1, drafts: 3, proposals: 15, placeholders: 5,
    }]);

    const assignments = await database.query(`
        select account.display_name as assignee, count(*)::int as tasks
        from public.tasks as task
        join public.accounts as account on account.id = task.assignee_id
        join public.meetings as meeting on meeting.id = task.meeting_id
        where meeting.title = 'Nowa baza klientów — struktura tabel i migracja'
        group by account.display_name
        order by account.display_name
    `);
    assert.deepEqual(assignments.rows, [
        { assignee: "Analityk A", tasks: 1 },
        { assignee: "Programista A", tasks: 1 },
        { assignee: "Programista B", tasks: 2 },
    ]);
    await assert.rejects(asAccount(accountA, "select summary from meetly_private.prototype_drafts"), /permission denied/);

    const overview = new URL("../supabase/demo/overview.sql", import.meta.url);
    await database.exec(await readFile(overview, "utf8"));
    await database.exec("update public.meetings set started_at = now() - interval '1 day', ended_at = now()");
    const pmId = "00000000-0000-4000-8400-000000000001";
    await database.query("insert into auth.users (id) values ($1)", [pmId]);
    await database.query("update public.accounts set auth_user_id = $1 where role = 'pm'", [pmId]);

    const ownTasks = await asAccount<{ assignee: string }>(accountA, `
        select item ->> 'assignee' as assignee from jsonb_array_elements(
            public.meetly_demo_overview('zadania') -> 'tasks'
        ) as item
    `);
    assert(ownTasks.rows.length > 0);
    assert(ownTasks.rows.every(row => row.assignee === "Programista A"));

    const pmMeetings = await asAccount(pmId, `
        select item ->> 'title' as title from jsonb_array_elements(
            public.meetly_demo_overview('spotkania') -> 'meetings'
        ) as item order by title
    `);
    assert.deepEqual(pmMeetings.rows, [
        { title: "Nowa baza klientów — wymagania i wygląd ekranów" },
        { title: "Założenia pilotażu dostaw" },
    ]);

    const pmDrafts = await asAccount(pmId, `
        select item ->> 'title' as title from jsonb_array_elements(
            public.meetly_demo_overview('szkice') -> 'drafts'
        ) as item order by title
    `);
    assert.deepEqual(pmDrafts.rows, [
        { title: "Nowa baza klientów — plan odbioru" },
        { title: "Przegląd gotowości pilotażu dostaw" },
    ]);
    await assert.rejects(database.transaction(async (transaction) => {
        await transaction.exec("set local role anon");
        await transaction.query("select public.meetly_demo_overview('spotkania')");
    }), /permission denied/);
});

test("demonstrator ogranicza szkic i zapisuje wynik oraz historię najwyżej raz", async () => {
    for (const script of ["prototype-data", "interactive"]) {
        await database.exec(await readFile(new URL(`../supabase/demo/${script}.sql`, import.meta.url), "utf8"));
    }
    const pmId = "00000000-0000-4000-8400-000000000001";
    await database.query("insert into auth.users (id) values ($1) on conflict do nothing", [pmId]);
    await database.query("update public.accounts set auth_user_id = $1 where role = 'pm'", [pmId]);
    await assert.rejects(database.transaction(async (transaction) => {
        await transaction.exec("set local role anon");
        await transaction.query("select public.meetly_demo_action('state')");
    }), /permission denied/);

    type DemoItem = {
        id: string; title: string; generationFailed?: boolean; status?: string; questions?: string[];
        started?: string; text?: string; due?: string; canEditTasks?: boolean;
    };
    type DemoState = {
        profile: { id: string };
        recordings: DemoItem[];
        drafts: DemoItem[];
        meetings: DemoItem[];
        tasks: DemoItem[];
        closures: DemoItem[];
        reimports: DemoItem[];
    };
    async function action<T = { ok?: boolean; error?: string }>(account: string, name: string, payload = {}) {
        const { rows } = await asAccount<{ result: T }>(account,
            "select public.meetly_demo_action($1, $2::jsonb) as result", [name, JSON.stringify(payload)]);
        return rows[0].result;
    }
    const state = (account: string) => action<DemoState>(account, "state");
    const a = (await state(accountA)).profile.id;
    const b = (await state(accountB)).profile.id;
    const pm = (await state(pmId)).profile.id;
    const title = "Fikcyjny test pełnego przebiegu";

    assert.deepEqual(await action(pmId, "start", { title, people: [a] }), { ok: true });
    assert.deepEqual(await action(pmId, "start", { title }), { error: "active" });
    const recording = (await state(pmId)).recordings.find(item => item.title === title);
    assert(recording);
    const { id } = recording;
    assert.deepEqual(await action(pmId, "stop", { id, simulateFailure: true }), { ok: true });
    assert.equal((await state(accountA)).drafts.find(item => item.id === id)?.generationFailed, true);
    assert.equal((await state(accountB)).drafts.some(item => item.id === id), false);
    assert.deepEqual(await action(accountB, "retry", { id }), { error: "forbidden" });
    assert.deepEqual(await action(accountA, "publish", { id, title, summary: "Próba" }), { error: "invalid" });
    assert.deepEqual(await action(accountA, "retry", { id }), { ok: true });
    assert.equal((await state(accountA)).drafts.find(item => item.id === id)?.generationFailed, false);
    assert.deepEqual(await action(pmId, "transcript_preview", { id }), { error: "forbidden" });
    assert.deepEqual(await action(pmId, "add_meeting_task", { id, text: "Za wcześnie", person: a }), { error: "forbidden" });

    const result = { id, title, summary: "Poprawione podsumowanie", access: [pm, a],
        tasks: [{ text: "Test z przypisaniem", person: b }, { text: "Test bez przypisania" }] };
    assert.deepEqual(await action(accountA, "publish", result), { ok: true });
    assert.deepEqual(await action(pmId, "publish", result), { error: "already" });
    assert.equal((await state(accountA)).drafts.some(item => item.id === id), false);
    const assigned = await state(accountB);
    assert.deepEqual(assigned.meetings.find(item => item.id === id)?.questions, ["Test bez przypisania"]);
    assert.equal(assigned.meetings.find(item => item.id === id)?.canEditTasks, false);
    const pmMeeting = (await state(pmId)).meetings.find(item => item.id === id);
    assert.equal(pmMeeting?.canEditTasks, true);
    assert(pmMeeting?.started);
    const preview = await action<{ text: string }>(accountB, "transcript_preview", { id });
    assert.match(preview.text, /Poprawione podsumowanie/);
    const task = assigned.tasks.find(item => item.title === title);
    assert(task);
    assert.deepEqual(await action(accountB, "task_state", { id: task.id, state: "closed" }), { error: "forbidden" });
    for (const next of ["closed", "closed", "open"]) {
        assert.deepEqual(await action(pmId, "task_state", { id: task.id, state: next }), { ok: true });
    }
    assert.equal((await state(pmId)).closures.filter(item => item.id === task.id).length, 1);
    assert.equal((await state(accountB)).tasks.find(item => item.id === task.id)?.status, "open");

    const newTask = { id, person: a, text: "Otwarte zadanie po zatwierdzeniu", due: "2026-11-30" };
    assert.deepEqual(await action(accountA, "add_meeting_task", newTask), { error: "forbidden" });
    assert.deepEqual(await action(pmId, "add_meeting_task", { ...newTask, due: "2026-02-30" }), { error: "invalid" });
    assert.deepEqual(await action(pmId, "add_meeting_task", newTask), { ok: true });
    const added = (await state(accountA)).tasks.find(item => item.text === newTask.text);
    assert.equal(added?.status, "open");
    assert.equal(added?.due, newTask.due);
    assert.deepEqual(await action(accountB, "edit_meeting_task", { ...newTask, task: task.id }), { error: "forbidden" });
    assert.deepEqual(await action(pmId, "edit_meeting_task", { ...newTask, task: task.id, text: "Zmieniona treść", due: "" }), { ok: true });
    assert.equal((await state(accountA)).tasks.find(item => item.id === task.id)?.text, "Zmieniona treść");
    assert.equal((await state(pmId)).closures.filter(item => item.id === task.id).length, 1);
    assert.equal((await state(accountB)).meetings.some(item => item.id === id), false);
    assert.deepEqual(await action(accountB, "transcript_preview", { id }), { error: "forbidden" });

    assert.deepEqual(await action(accountB, "delete_meeting", { id }), { error: "forbidden" });
    assert.deepEqual(await action(pmId, "set_access", { id, access: [a] }), { ok: true });
    assert.deepEqual(await action(pmId, "add_meeting_task", newTask), { error: "forbidden" });
    assert.deepEqual(await action(pmId, "edit_meeting_task", { ...newTask, task: task.id }), { error: "forbidden" });
    assert.deepEqual(await action(accountA, "delete_meeting", { id }), { ok: true });
    const deleted = await state(pmId);
    assert.equal(deleted.closures.some(item => item.id === task.id), false);
    const reimport = (await state(accountA)).reimports.find(item => item.title === title);
    assert(reimport);
    assert.deepEqual(await action(accountB, "reimport", { id: reimport.id }), { error: "forbidden" });
    assert.deepEqual(await action(accountA, "reimport", { id: reimport.id }), { ok: true });
    const restored = (await state(accountA)).drafts.find(item => item.title === title);
    assert(restored);
    assert.deepEqual(await action(accountA, "discard", { id: restored.id }), { ok: true });
    assert.equal((await state(pmId)).drafts.some(item => item.id === restored.id), false);
});
