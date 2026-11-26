-- Isolated fictional-project setup. Apply after the prototype data.
begin;

create table if not exists meetly_private.demo_reimports (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    ended_at timestamptz not null,
    eligible uuid[] not null
);
alter table meetly_private.demo_reimports enable row level security;
revoke all on meetly_private.demo_reimports from public, anon, authenticated;

create or replace function meetly_private.demo_can_read(target uuid, person uuid)
returns boolean language sql stable set search_path = '' as $$
    select exists (
        select 1 from public.meetings m where m.id = target and m.status = 'approved'
          and (m.ended_at at time zone 'Europe/Warsaw' + interval '6 months')
              at time zone 'Europe/Warsaw' > now()
          and (
              exists (select 1 from public.meeting_access a where a.meeting_id = m.id and a.account_id = person
                      and (a.retained_from_start or a.explicitly_granted))
              or exists (select 1 from public.tasks t where t.meeting_id = m.id and t.assignee_id = person)
          )
    );
$$;
revoke all on function meetly_private.demo_can_read(uuid, uuid) from public, anon, authenticated;

create or replace function meetly_private.demo_add_draft(target uuid, person uuid)
returns void language sql set search_path = '' as $$
    insert into meetly_private.prototype_drafts(meeting_id, summary, decisions, questions, proposed_tasks)
    values (
        target,
        'Fikcyjny zespół omówił zakres próby. Kolejnym krokiem jest wykonanie testu i omówienie wyniku.',
        'Zespół przeprowadzi próbę na fikcyjnych danych.',
        'Które przypadki brzegowe wymagają dodatkowego sprawdzenia?',
        jsonb_build_array(
            jsonb_build_object('text','Przygotować przykładowy scenariusz testowy.','assigneeId',person),
            jsonb_build_object('text','Ustalić zakres kolejnego przeglądu.')
        )
    );
$$;
revoke all on function meetly_private.demo_add_draft(uuid, uuid) from public, anon, authenticated;

create or replace function public.meetly_demo_action(operation text, payload jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer set search_path = ''
as $function$
declare
    actor public.accounts%rowtype;
    meeting public.meetings%rowtype;
    task public.tasks%rowtype;
    removed meetly_private.demo_reimports%rowtype;
    target uuid;
    person uuid;
    members uuid[];
    title_text text;
    description_text text;
    due_on date;
    summary_text text;
    decision_list text[];
    question_list text[];
    item jsonb;
    next_status public.task_status;
    on_start boolean;
    privileged boolean;
    answer jsonb;
begin
    select * into actor from public.accounts
    where auth_user_id = (select auth.uid()) and role is not null and email like '%@example.test';
    if not found then return jsonb_build_object('error','forbidden'); end if;
    privileged := actor.role in ('pm','director');

    if operation = 'state' then
        delete from meetly_private.demo_reimports
        where ended_at + interval '30 days' <= now();
        delete from public.meetings
        where status = 'approved' and (ended_at at time zone 'Europe/Warsaw' + interval '6 months')
              at time zone 'Europe/Warsaw' <= now();

        with allowed_meetings as (
            select m.* from public.meetings m where meetly_private.demo_can_read(m.id, actor.id)
        ), visible_tasks as (
            select t.*, a.display_name, m.title
            from public.tasks t
            join public.accounts a on a.id = t.assignee_id
            left join allowed_meetings m on m.id = t.meeting_id
            where (m.id is not null or t.source = 'manual')
              and (privileged or t.assignee_id = actor.id)
        ), visible_drafts as (
            select m.*, d.summary, d.decisions, d.questions, d.proposed_tasks, d.meeting_id is null as failed
            from public.meetings m left join meetly_private.prototype_drafts d on d.meeting_id = m.id
            where m.status = 'draft' and exists (
                select 1 from public.meeting_participants p where p.meeting_id = m.id and p.account_id = actor.id
            )
        ), task_json as (
            select t.id, jsonb_build_object('id',t.id,'text',t.description,'person',t.display_name,
                'personId',t.assignee_id,'title',t.title,'status',t.status,'due',t.due_date,
                'canDelete',actor.role='pm' or t.assignee_id=actor.id) as data
            from visible_tasks t
        )
        select jsonb_build_object(
            'profile',jsonb_build_object('id',actor.id,'name',actor.display_name,'role',actor.role),
            'people',coalesce((select jsonb_agg(jsonb_build_object(
                'id',a.id,'name',a.display_name,'login',a.auth_user_id is not null
            ) order by a.display_name) from public.accounts a where a.email like '%@example.test'),'[]'),
            'meetings',coalesce((select jsonb_agg(jsonb_build_object(
                'id',m.id,'title',m.title,'started',m.started_at,'ended',m.ended_at,'summary',r.summary,
                'decisions',r.decisions,'questions',r.open_questions,
                'canManage',exists (select 1 from public.meeting_participants p where p.meeting_id=m.id and p.account_id=actor.id),
                'canEditTasks',actor.role='pm',
                'access',coalesce((select jsonb_agg(a.account_id) from public.meeting_access a where a.meeting_id=m.id),'[]'),
                'tasks',coalesce((select jsonb_agg(jsonb_build_object(
                    'id',t.id,'text',t.description,'person',a.display_name,'personId',t.assignee_id,
                    'status',t.status,'due',t.due_date,'canDelete',actor.role='pm' or t.assignee_id=actor.id
                ) order by t.description) from public.tasks t join public.accounts a on a.id=t.assignee_id
                    where t.meeting_id=m.id and (privileged or m.initiator_id=actor.id or t.assignee_id=actor.id)),'[]')
            ) order by m.ended_at desc,m.title) from allowed_meetings m join public.meeting_results r on r.meeting_id=m.id),'[]'),
            'tasks',coalesce((select jsonb_agg(t.data order by t.id) from task_json t),'[]'),
            'drafts',coalesce((select jsonb_agg(jsonb_build_object(
                'id',d.id,'title',d.title,'ended',d.ended_at,'summary',d.summary,'generationFailed',d.failed,
                'decisions',d.decisions,'questions',d.questions,'canDiscard',d.initiator_id=actor.id,
                'participants',coalesce((select jsonb_agg(p.account_id) from public.meeting_participants p where p.meeting_id=d.id),'[]'),
                'tasks',coalesce((select jsonb_agg(jsonb_build_object('text',q.data->>'text',
                    'personId',a.id,'due',q.data->>'due') order by q.position)
                    from jsonb_array_elements(d.proposed_tasks) with ordinality q(data,position)
                    left join public.accounts a on a.id::text=q.data->>'assigneeId' or a.email=
                    (case q.data->>'assignee'
                        when 'dev' then 'programista.a' when 'devB' then 'programista.b'
                        when 'analyst' then 'analityk.a' when 'pm' then 'pm.a'
                        when 'director' then 'dyrektor.a' else q.data->>'assignee'
                    end)||'@example.test'),'[]')
            ) order by d.ended_at desc,d.title) from visible_drafts d),'[]'),
            'recordings',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'title',m.title))
                from public.meetings m where m.status='processing' and m.initiator_id=actor.id),'[]'),
            'reimports',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'title',r.title))
                from meetly_private.demo_reimports r where actor.id=any(r.eligible)),'[]'),
            'closures',case when privileged then coalesce((select jsonb_agg(t.data ||
                jsonb_build_object('closedAt',c.changed_at) order by c.changed_at desc)
                from public.task_changes c join task_json t on t.id=c.task_id where c.status='closed'),'[]')
                else '[]'::jsonb end
        ) into answer;
        return answer;
    end if;

    if operation='transcript_preview' then
        select jsonb_build_object('text',
            '00:00 · Prowadzący: Przejdźmy do podsumowania.' || chr(10) || chr(10) ||
            '00:15 · Uczestnik: ' || r.summary
        ) into answer
        from public.meeting_results r
        where r.meeting_id::text=payload->>'id' and meetly_private.demo_can_read(r.meeting_id,actor.id);
        return coalesce(answer,jsonb_build_object('error','forbidden'));
    end if;

    if operation in ('start','reimport') then
        if operation='start' then
            title_text := btrim(coalesce(payload->>'title',''));
            if length(title_text) not between 1 and 120 then return jsonb_build_object('error','invalid'); end if;
            perform 1 from public.accounts where id=actor.id for update;
            if exists (select 1 from public.meetings m where m.initiator_id=actor.id and m.status='processing')
                then return jsonb_build_object('error','active'); end if;
            select array_agg(a.id) into members from public.accounts a
            where (a.id=actor.id or a.id::text in (select jsonb_array_elements_text(coalesce(payload->'people','[]'))))
              and a.email like '%@example.test' and a.auth_user_id is not null and a.role is not null;
        else
            select * into removed from meetly_private.demo_reimports r where r.id::text=payload->>'id' for update;
            if not found or not actor.id=any(removed.eligible) or removed.ended_at+interval '30 days'<=now()
                then return jsonb_build_object('error','forbidden'); end if;
            members := removed.eligible;
            title_text := removed.title;
        end if;
        insert into public.meetings(source_id,import_id,title,initiator_id,started_at,ended_at,status)
        values (gen_random_uuid(),gen_random_uuid(),title_text,actor.id,coalesce(removed.ended_at,now()),
            removed.ended_at,
            case when operation='reimport' then 'draft' else 'processing' end::public.meeting_status)
        returning id into target;
        insert into public.meeting_participants(meeting_id,matrix_user_id,account_id)
        select target,coalesce(a.matrix_user_id,'@demo-'||a.id::text||':example.test'),a.id
        from public.accounts a where a.id=any(members);
        if operation='reimport' then
            perform meetly_private.demo_add_draft(target,actor.id);
            delete from meetly_private.demo_reimports where id=removed.id;
        end if;
        return jsonb_build_object('ok',true);
    end if;

    if operation='add_task' then
        if actor.role<>'pm' then return jsonb_build_object('error','forbidden'); end if;
        description_text := btrim(coalesce(payload->>'text',''));
        select id into person from public.accounts where id::text=payload->>'person' and email like '%@example.test';
        if person is null or length(description_text) not between 1 and 500
            then return jsonb_build_object('error','invalid'); end if;
        insert into public.tasks(assignee_id,description,source,status)
        values(person,description_text,'manual','closed') returning id into target;
        insert into public.task_changes(task_id,changed_by,status) values(target,actor.id,'closed');
        return jsonb_build_object('ok',true);
    end if;

    if operation in ('add_meeting_task','edit_meeting_task') then
        if actor.role<>'pm' then return jsonb_build_object('error','forbidden'); end if;
        select * into meeting from public.meetings m where m.id::text=payload->>'id' for update;
        if not found or not meetly_private.demo_can_read(meeting.id,actor.id)
            then return jsonb_build_object('error','forbidden'); end if;
        description_text := btrim(coalesce(payload->>'text',''));
        select id into person from public.accounts where id::text=payload->>'person' and email like '%@example.test';
        if person is null or length(description_text) not between 1 and 500
            then return jsonb_build_object('error','invalid'); end if;
        if nullif(payload->>'due','') is not null then
            if payload->>'due' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
                then return jsonb_build_object('error','invalid'); end if;
            begin
                due_on := (payload->>'due')::date;
            exception when invalid_datetime_format or datetime_field_overflow then
                return jsonb_build_object('error','invalid');
            end;
        end if;
        if operation='add_meeting_task' then
            insert into public.tasks(meeting_id,assignee_id,description,due_date,source,status)
            values(meeting.id,person,description_text,due_on,'meeting','open');
        else
            update public.tasks set assignee_id=person,description=description_text,due_date=due_on
            where meeting_id=meeting.id and id::text=payload->>'task';
            if not found then return jsonb_build_object('error','forbidden'); end if;
        end if;
        return jsonb_build_object('ok',true);
    end if;

    if operation in ('task_state','delete_task') then
        select * into task from public.tasks t where t.id::text=payload->>'id' for update;
        if not found or (task.meeting_id is not null and not meetly_private.demo_can_read(task.meeting_id,actor.id))
            then return jsonb_build_object('error','forbidden'); end if;
        if operation='delete_task' and (actor.role='pm' or task.assignee_id=actor.id) then
            delete from public.tasks where id=task.id;
            return jsonb_build_object('ok',true);
        end if;
        if operation='task_state' and actor.role='pm' and payload->>'state' in ('open','closed') then
            next_status := (payload->>'state')::public.task_status;
            if task.status<>next_status then
                update public.tasks set status=next_status where id=task.id;
                insert into public.task_changes(task_id,changed_by,status) values(task.id,actor.id,next_status);
            end if;
            return jsonb_build_object('ok',true);
        end if;
        return jsonb_build_object('error','forbidden');
    end if;

    select * into meeting from public.meetings m where m.id::text=payload->>'id' for update;
    if not found then return jsonb_build_object('error','forbidden'); end if;
    on_start := exists(select 1 from public.meeting_participants p where p.meeting_id=meeting.id and p.account_id=actor.id);
    if operation='stop' and meeting.status='processing' and meeting.initiator_id=actor.id then
        update public.meetings set status='draft',ended_at=now() where id=meeting.id;
        if payload->'simulateFailure' is distinct from 'true'::jsonb then
            perform meetly_private.demo_add_draft(meeting.id,actor.id);
        end if;
        return jsonb_build_object('ok',true);
    end if;
    if operation='retry' and meeting.status='draft' and on_start then
        if not exists (select 1 from meetly_private.prototype_drafts where meeting_id=meeting.id) then
            perform meetly_private.demo_add_draft(meeting.id,meeting.initiator_id);
        end if;
        return jsonb_build_object('ok',true);
    end if;
    if operation='discard' and meeting.status='draft' and meeting.initiator_id=actor.id then
        delete from meetly_private.prototype_drafts where meeting_id=meeting.id;
        delete from meetly_private.transcript_references where meeting_id=meeting.id;
        update public.meetings set status='discarded' where id=meeting.id;
        return jsonb_build_object('ok',true);
    end if;
    if operation='publish' and on_start then
        if meeting.status <> 'draft' then return jsonb_build_object('error','already'); end if;
        if not exists (select 1 from meetly_private.prototype_drafts where meeting_id=meeting.id)
            then return jsonb_build_object('error','invalid'); end if;
        title_text := btrim(coalesce(payload->>'title',''));
        summary_text := btrim(coalesce(payload->>'summary',''));
        if length(title_text) not between 1 and 120 or length(summary_text) not between 1 and 10000
            then return jsonb_build_object('error','invalid'); end if;
        decision_list := array(select jsonb_array_elements_text(coalesce(payload->'decisions','[]')));
        question_list := array(select jsonb_array_elements_text(coalesce(payload->'questions','[]')));
        if exists (select 1 from jsonb_array_elements(coalesce(payload->'tasks','[]')) t
            where length(btrim(coalesce(t->>'text',''))) not between 1 and 500
               or (nullif(t->>'person','') is not null and not exists (
                    select 1 from public.accounts a where a.id::text=t->>'person' and a.email like '%@example.test'
               ))) then return jsonb_build_object('error','invalid'); end if;
        for item in select jsonb_array_elements(coalesce(payload->'tasks','[]')) loop
            description_text := btrim(item->>'text');
            if nullif(item->>'person','') is null then
                question_list := array_append(question_list,description_text);
            else
                insert into public.tasks(meeting_id,assignee_id,description,due_date,source,status)
                values(meeting.id,(item->>'person')::uuid,description_text,nullif(item->>'due','')::date,'meeting','open');
            end if;
        end loop;
        insert into public.meeting_results(meeting_id,summary,decisions,open_questions)
        values(meeting.id,summary_text,decision_list,question_list);
        delete from meetly_private.prototype_drafts where meeting_id=meeting.id;
        delete from meetly_private.transcript_references where meeting_id=meeting.id;
        update public.meetings set status='approved',title=title_text where id=meeting.id;
    elsif not (on_start and meetly_private.demo_can_read(meeting.id,actor.id)
          and operation in ('set_access','delete_meeting')) then
        return jsonb_build_object('error','forbidden');
    end if;

    if operation='delete_meeting' then
        select array_agg(p.account_id) into members from public.meeting_participants p
        where p.meeting_id=meeting.id and meetly_private.demo_can_read(meeting.id,p.account_id);
        if meeting.ended_at+interval '30 days'>now() and members is not null then
            insert into meetly_private.demo_reimports(title,ended_at,eligible)
            values(meeting.title,meeting.ended_at,members);
        end if;
        delete from public.meetings where id=meeting.id;
    else
        delete from public.meeting_access where meeting_id=meeting.id;
        insert into public.meeting_access(meeting_id,account_id,retained_from_start,explicitly_granted)
        select meeting.id,a.id,p.account_id is not null,p.account_id is null from public.accounts a
        left join public.meeting_participants p on p.meeting_id=meeting.id and p.account_id=a.id
        where a.email like '%@example.test' and a.id::text in (select jsonb_array_elements_text(coalesce(payload->'access','[]')));
    end if;
    return jsonb_build_object('ok',true);
end;
$function$;

revoke all on function public.meetly_demo_action(text,jsonb) from public, anon, authenticated;
grant execute on function public.meetly_demo_action(text,jsonb) to authenticated;
commit;
