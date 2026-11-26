insert into public.accounts (id, display_name, email, role, matrix_user_id) values
    ('00000000-0000-4000-8000-000000000001', 'PM A', 'pm.a@example.test', 'pm', '@pm-a:example.test'),
    ('00000000-0000-4000-8000-000000000002', 'Dyrektor A', 'dyrektor.a@example.test', 'director', null),
    ('00000000-0000-4000-8000-000000000003', 'Programista A', 'programista.a@example.test', 'programmer', '@dev-a:example.test'),
    ('00000000-0000-4000-8000-000000000004', 'Programista B', 'programista.b@example.test', 'programmer', '@dev-b:example.test'),
    ('00000000-0000-4000-8000-000000000005', 'Analityk A', 'analityk.a@example.test', 'analyst', null);

insert into public.meetings (id, source_id, import_id, title, initiator_id, started_at, ended_at, status) values
    ('00000000-0000-4000-8100-000000000001', '00000000-0000-4000-8200-000000000001',
     '00000000-0000-4000-8300-000000000001', 'Demonstracyjne planowanie wydania',
     '00000000-0000-4000-8000-000000000003', '2026-11-23 09:00+00', '2026-11-23 09:30+00', 'approved'),
    ('00000000-0000-4000-8100-000000000002', '00000000-0000-4000-8200-000000000002',
     '00000000-0000-4000-8300-000000000002', 'Demonstracyjny przegląd testów',
     '00000000-0000-4000-8000-000000000004', '2026-11-23 10:00+00', '2026-11-23 10:20+00', 'approved');

insert into public.meeting_participants (meeting_id, matrix_user_id, account_id) values
    ('00000000-0000-4000-8100-000000000001', '@dev-a:example.test', '00000000-0000-4000-8000-000000000003'),
    ('00000000-0000-4000-8100-000000000002', '@dev-b:example.test', '00000000-0000-4000-8000-000000000004');

insert into public.meeting_access (meeting_id, account_id, retained_from_start)
    select meeting_id, account_id, true from public.meeting_participants;

insert into public.meeting_results (meeting_id, summary) values
    ('00000000-0000-4000-8100-000000000001', 'Zespół ustalił demonstracyjny zakres wydania.'),
    ('00000000-0000-4000-8100-000000000002', 'Zespół sprawdził demonstracyjny plan testów.');

insert into public.tasks (meeting_id, assignee_id, description, source, status) values
    ('00000000-0000-4000-8100-000000000001', '00000000-0000-4000-8000-000000000003',
     'Uzupełnij opis scenariusza logowania.', 'meeting', 'open'),
    ('00000000-0000-4000-8100-000000000002', '00000000-0000-4000-8000-000000000004',
     'Przejrzyj demonstracyjną listę przypadków testowych.', 'meeting', 'open');
