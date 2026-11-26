-- Apply only to the isolated Meetly Demo project after prototype-data.sql.
begin;

create or replace function public.meetly_demo_overview(section text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
    with viewer as (
        select id, role
        from public.accounts
        where auth_user_id = (select auth.uid())
          and role is not null
          and email like '%@example.test'
    ), accessible as (
        select meeting.*, viewer.id as viewer_id, viewer.role as viewer_role
        from public.meetings as meeting
        cross join viewer
        where section in ('spotkania', 'zadania')
          and meeting.status = 'approved'
          and ((meeting.ended_at at time zone 'Europe/Warsaw') + interval '6 months')
              at time zone 'Europe/Warsaw' > now()
          and (
              exists (
                  select 1 from public.meeting_access as access
                  where access.meeting_id = meeting.id and access.account_id = viewer.id
                    and (access.retained_from_start or access.explicitly_granted)
              ) or exists (
                  select 1 from public.tasks as task
                  where task.meeting_id = meeting.id and task.assignee_id = viewer.id
              )
          )
    ), meeting_tasks as (
        select meeting.id, task.id as task_id, task.description, task.due_date, task.status,
               meeting.title, person.display_name as assignee,
               task.assignee_id = meeting.viewer_id or meeting.viewer_role in ('pm', 'director') as on_task_list,
               meeting.initiator_id = meeting.viewer_id as viewer_initiated
        from accessible as meeting
        join public.tasks as task on task.meeting_id = meeting.id
        join public.accounts as person on person.id = task.assignee_id
    ), task_list as (
        select task_id, description, due_date, status, title, assignee
        from meeting_tasks where on_task_list
        union all
        select task.id, task.description, task.due_date, task.status, null, person.display_name
        from public.tasks as task
        join public.accounts as person on person.id = task.assignee_id
        cross join viewer
        where section = 'zadania' and task.source = 'manual'
          and (task.assignee_id = viewer.id or viewer.role in ('pm', 'director'))
    )
    select jsonb_build_object(
        'meetings', case when section = 'spotkania' then coalesce((
            select jsonb_agg(jsonb_build_object(
                'title', meeting.title,
                'endedAt', meeting.ended_at,
                'summary', result.summary,
                'decisions', result.decisions,
                'questions', result.open_questions,
                'tasks', coalesce((
                    select jsonb_agg(jsonb_build_object(
                        'description', task.description, 'assignee', task.assignee,
                        'status', task.status, 'dueDate', task.due_date
                    ) order by task.description, task.task_id)
                    from meeting_tasks as task
                    where task.id = meeting.id and (task.on_task_list or task.viewer_initiated)
                ), '[]'::jsonb)
            ) order by meeting.ended_at desc, meeting.title)
            from accessible as meeting
            join public.meeting_results as result on result.meeting_id = meeting.id
        ), '[]'::jsonb) else '[]'::jsonb end,
        'tasks', case when section = 'zadania' then coalesce((
            select jsonb_agg(jsonb_build_object(
                'description', task.description, 'assignee', task.assignee,
                'status', task.status, 'dueDate', task.due_date, 'meetingTitle', task.title
            ) order by task.status, task.description, task.task_id)
            from task_list as task
        ), '[]'::jsonb) else '[]'::jsonb end,
        'drafts', case when section = 'szkice' then coalesce((
            select jsonb_agg(jsonb_build_object(
                'title', meeting.title, 'endedAt', meeting.ended_at, 'summary', draft.summary,
                'decisions', array_remove(array[nullif(draft.decisions, '')], null),
                'questions', array_remove(array[nullif(draft.questions, '')], null),
                'tasks', (
                    select coalesce(jsonb_agg(jsonb_build_object(
                        'description', proposal.data ->> 'text', 'assignee', person.display_name
                    ) order by proposal.position), '[]'::jsonb)
                    from jsonb_array_elements(draft.proposed_tasks) with ordinality as proposal(data, position)
                    left join public.accounts as person on person.email =
                        (case (proposal.data ->> 'assignee')
                            when 'dev' then 'programista.a'
                            when 'devB' then 'programista.b'
                            when 'analyst' then 'analityk.a'
                            when 'pm' then 'pm.a'
                            when 'director' then 'dyrektor.a'
                            else (proposal.data ->> 'assignee')
                        end) || '@example.test'
                )
            ) order by meeting.ended_at desc, meeting.title)
            from meetly_private.prototype_drafts as draft
            join public.meetings as meeting on meeting.id = draft.meeting_id
            cross join viewer
            where meeting.status = 'draft' and exists (
                select 1 from public.meeting_participants as participant
                where participant.meeting_id = meeting.id and participant.account_id = viewer.id
            )
        ), '[]'::jsonb) else '[]'::jsonb end
    );
$function$;

revoke all on function public.meetly_demo_overview(text) from public, anon, authenticated;
grant execute on function public.meetly_demo_overview(text) to authenticated;

commit;
