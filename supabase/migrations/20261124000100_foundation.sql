create schema meetly_private;
revoke all on schema meetly_private from public, anon, authenticated;

create type public.account_role as enum ('pm', 'programmer', 'analyst', 'director');
create type public.meeting_status as enum ('processing', 'draft', 'approved', 'discarded');
create type public.task_source as enum ('meeting', 'manual');
create type public.task_status as enum ('open', 'closed');

create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique references auth.users (id) on delete set null,
    display_name text not null check (length(btrim(display_name)) > 0),
    email text not null unique,
    role public.account_role,
    matrix_user_id text unique
);

create table public.meetings (
    id uuid primary key default gen_random_uuid(),
    source_id uuid not null,
    import_id uuid not null unique,
    import_generation integer not null default 1 check (import_generation > 0),
    title text not null check (length(btrim(title)) between 1 and 120),
    initiator_id uuid references public.accounts (id),
    started_at timestamptz not null,
    ended_at timestamptz check (ended_at >= started_at),
    status public.meeting_status not null,
    unique (source_id, import_generation)
);

create table public.meeting_participants (
    meeting_id uuid not null references public.meetings (id) on delete cascade,
    matrix_user_id text not null,
    account_id uuid references public.accounts (id),
    primary key (meeting_id, matrix_user_id)
);

create table public.meeting_access (
    meeting_id uuid not null references public.meetings (id) on delete cascade,
    account_id uuid not null references public.accounts (id),
    retained_from_start boolean not null default false,
    explicitly_granted boolean not null default false,
    primary key (meeting_id, account_id),
    check (retained_from_start or explicitly_granted)
);

create table meetly_private.transcript_references (
    meeting_id uuid primary key references public.meetings (id) on delete cascade,
    storage_id uuid not null unique
);

create table public.meeting_results (
    meeting_id uuid primary key references public.meetings (id) on delete cascade,
    summary text not null check (length(btrim(summary)) > 0),
    decisions text[] not null default '{}',
    open_questions text[] not null default '{}'
);

create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    meeting_id uuid references public.meetings (id) on delete cascade,
    assignee_id uuid not null references public.accounts (id),
    description text not null check (
        length(description) <= 500 and length(btrim(description)) > 0
    ),
    due_date date,
    source public.task_source not null,
    status public.task_status not null,
    check ((source = 'meeting') = (meeting_id is not null))
);

create table public.task_changes (
    id uuid primary key default gen_random_uuid(),
    task_id uuid not null references public.tasks (id) on delete cascade,
    changed_by uuid not null references public.accounts (id),
    changed_at timestamptz not null default now(),
    status public.task_status not null
);

alter table public.accounts enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_participants enable row level security;
alter table public.meeting_access enable row level security;
alter table public.meeting_results enable row level security;
alter table public.tasks enable row level security;
alter table public.task_changes enable row level security;
alter table meetly_private.transcript_references enable row level security;

revoke all on public.accounts, public.meetings, public.meeting_participants, public.meeting_access,
    public.meeting_results, public.tasks, public.task_changes, meetly_private.transcript_references
    from public, anon, authenticated;

grant select (display_name, role) on public.accounts to authenticated;

create policy accounts_read_self on public.accounts
    for select to authenticated
    using (auth_user_id = (select auth.uid()));
