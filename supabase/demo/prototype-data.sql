-- Fikcyjne dane startowe z prototyp/meetly-prototyp.html.
-- Względne daty prototypu ustalono na 24 listopada 2026 r. w Europe/Warsaw.
-- Uruchom po seed.sql wyłącznie w odrębnym środowisku demonstracyjnym.
begin;

select pg_advisory_xact_lock(hashtext('meetly-demo-prototype-fixtures'));

do $demo_only$
begin
    if (select count(*) from public.accounts where email in (
        'pm.a@example.test', 'dyrektor.a@example.test', 'programista.a@example.test',
        'programista.b@example.test', 'analityk.a@example.test'
    )) <> 5 or exists (select 1 from public.accounts where email not like '%@example.test') then
        raise exception 'Prototype fixtures require the isolated demo seed';
    end if;
end
$demo_only$;

create table if not exists meetly_private.prototype_drafts (
    meeting_id uuid primary key references public.meetings (id) on delete cascade,
    summary text not null,
    decisions text not null,
    questions text not null,
    proposed_tasks jsonb not null
);

alter table meetly_private.prototype_drafts enable row level security;
revoke all on meetly_private.prototype_drafts from public, anon, authenticated;

insert into public.accounts (display_name, email, matrix_user_id)
select upper(alias), alias || '@example.test', '@' || alias || ':example.test'
from unnest(array['a2', 'a4', 'a5', 'a6', 'a8']) as alias
on conflict (email) do nothing;

create temporary table prototype_people on commit drop as
select source.alias, account.id, coalesce(account.matrix_user_id, source.matrix_user_id) as matrix_user_id
from (values
    ('pm', 'pm.a@example.test', '@pm-a:example.test'),
    ('director', 'dyrektor.a@example.test', '@director-a:example.test'),
    ('dev', 'programista.a@example.test', '@dev-a:example.test'),
    ('devB', 'programista.b@example.test', '@dev-b:example.test'),
    ('analyst', 'analityk.a@example.test', '@analyst-a:example.test'),
    ('a2', 'a2@example.test', '@a2:example.test'),
    ('a4', 'a4@example.test', '@a4:example.test'),
    ('a5', 'a5@example.test', '@a5:example.test'),
    ('a6', 'a6@example.test', '@a6:example.test'),
    ('a8', 'a8@example.test', '@a8:example.test')
) as source(alias, email, matrix_user_id)
join public.accounts as account on account.email = source.email;

-- Istniejące rekordy pomijamy w całości, aby ponowienie nie odtwarzało
-- usuniętych zadań, nadpisywało edycji lub przywracało odebranego dostępu.
create temporary table prototype_meetings on commit drop as
select
    md5('meetly-demo:prototype:meeting:' || (source.data ->> 'id'))::uuid as id,
    md5('meetly-demo:prototype:source:' || (source.data ->> 'id'))::uuid as source_id,
    md5('meetly-demo:prototype:import:' || (source.data ->> 'id'))::uuid as import_id,
    source.data
from (values
    ('{"id":"client-screens","title":"Nowa baza klientów — wymagania i wygląd ekranów","ended":"2026-11-23T11:00:00.000Z","host":"dev","participants":["dev","analyst","devB","pm"],"access":["dev","analyst","devB","pm"],"summary":"Zespół ustalił, jak pracownik obsługi ma znaleźć klienta, sprawdzić jego dane i dodać nową osobę lub firmę.","decisions":"Lista pokazuje numer, nazwę i typ klienta. Telefon i e-mail są widoczne na karcie klienta. Formularz pokazuje właściwe pola po wyborze typu: osoba lub firma.","questions":"Czy pracownicy obsługi potrzebują wyszukiwania po numerze telefonu? Sprawdzimy to podczas przeglądu makiet.","tasks":[{"text":"Przygotować makiety listy klientów, karty klienta i formularza dodawania osoby lub firmy.","assignee":"dev","closed":""},{"text":"Opisać, jakie dane API przekazuje na listę i kartę klienta oraz jakie dane przyjmuje przy dodawaniu osoby lub firmy.","assignee":"devB","closed":""},{"text":"Spisać wymagane pola dla osoby i firmy. Przygotować przykłady wyszukiwania po numerze klienta i po nazwie.","assignee":"analyst","closed":""},{"text":"Omówić makiety z zespołem obsługi i ustalić, czy potrzebne jest wyszukiwanie po numerze telefonu.","assignee":"pm","closed":""}],"status":"approved"}'::jsonb),
    ('{"id":"client-tables","title":"Nowa baza klientów — struktura tabel i migracja","ended":"2026-11-24T11:00:00.000Z","host":"devB","participants":["dev","analyst","devB"],"access":["dev","analyst","devB"],"summary":"Zespół ustalił, gdzie zapisać dane wspólne, dane osoby lub firmy oraz kontakty. Omówił też zachowanie dotychczasowych numerów klientów podczas migracji.","decisions":"Tabela klienci przechowuje wspólny identyfikator, numer i typ klienta. Tabele klienci_osoby i klienci_firmy przechowują dane właściwe dla typu klienta. Tabela kontakty_klientow pozwala powiązać z klientem kilka numerów telefonu i adresów e-mail.","questions":"Jak obsłużyć rekordy, w których dotychczasowy numer klienta się powtarza? Do czasu decyzji migracja zgłasza konflikt.","tasks":[{"text":"Przygotować skrypt SQL tworzący tabele klientów, osób, firm i kontaktów. Zdefiniować klucze obce i unikalność numeru klienta.","assignee":"devB","closed":""},{"text":"Przygotować skrypt migracji zachowujący dotychczasowe numery klientów. W raporcie migracji wypisać rekordy z powtórzonym numerem.","assignee":"devB","closed":""},{"text":"Podłączyć listę, kartę i formularz klienta do uzgodnionego API. Po zapisaniu osoby lub firmy otworzyć kartę nowego klienta.","assignee":"dev","closed":""},{"text":"Przygotować dane do próby migracji: osobę, firmę z kilkoma kontaktami i dwa rekordy z tym samym numerem klienta. Opisać oczekiwany wynik każdego przypadku.","assignee":"analyst","closed":""}],"status":"approved"}'::jsonb),
    ('{"id":"integration","title":"Integracja z operatorem dostaw","ended":"2026-11-24T11:00:00.000Z","host":"dev","participants":["dev","devB"],"access":["dev","devB"],"summary":"Ustalono zakres testów statusów dostawy oraz dostępności kurierów.","decisions":"Potwierdzono zakres prac na kolejny etap.","questions":"","tasks":[{"text":"Sprawdzić import statusów dostawy.","assignee":"dev","closed":""}],"status":"approved"}'::jsonb),
    ('{"id":"orders","title":"Test koszyków w sklepie","ended":"2026-11-24T11:00:00.000Z","host":"analyst","participants":["analyst","dev"],"access":["analyst","dev"],"summary":"Porównano czasy kompletacji małych i dużych koszyków.","decisions":"Potwierdzono zakres prac na kolejny etap.","questions":"","tasks":[{"text":"Zebrać czasy kompletacji.","assignee":"analyst","closed":"2026-11-24"}],"status":"approved"}'::jsonb),
    ('{"id":"pilot","title":"Założenia pilotażu dostaw","ended":"2026-11-08T11:00:00.000Z","host":"devB","participants":["devB","pm"],"access":["devB","pm"],"summary":"Uzgodniono pilotaż w jednym sklepie.","decisions":"Potwierdzono zakres prac na kolejny etap.","questions":"","tasks":[{"text":"Przygotować listę warunków publicznego startu.","assignee":"devB","closed":""}],"status":"approved"}'::jsonb),
    ('{"id":"delivery","title":"Uruchomienie miejskiej usługi dostaw","ended":"2026-11-24T11:00:00.000Z","host":"dev","participants":["dev","a2","analyst","a4","a5","a6","devB","a8"],"access":["dev","a2","analyst","a4","a5","a6","devB","a8"],"summary":"Zespół omawiał pilotaż dostaw zamówień z jednego sklepu sieci „Półka” w Brzozowie. Usługa ma pozwolić klientowi złożyć zamówienie w aplikacji lub na stronie, sklep ma skompletować zakupy, a zewnętrzny operator dostarczyć je pod wskazany adres. Nazwa „Punkt w 90” i dostawa w 90 minut są robocze. Celem spotkania było ustalenie zakresu pilotażu oraz wskazanie warunków, których spełnienie poprzedzi publiczny start.\n\nUzgodniony kierunek\n- Pilotaż projektowany jest dla jednego sklepu w Brzozowie. Drugi sklep może zostać rozważony jako rezerwowy po sprawdzeniu obsady. Wyników jednego sklepu nie wolno przedstawiać jako reprezentatywnych dla całej sieci.\n- 1 czerwca jest roboczym terminem konfiguracji/testów wewnętrznych, a 9 czerwca warunkowym celem startu publicznego. Żaden z terminów nie został zatwierdzony jako gwarantowany. Festyn i zamknięcia ulic w Brzozowie 5–6 czerwca przemawiają przeciw startowi w tych dniach.\n- Usługa ma być dostępna tylko w konfigurowanych godzinach danego sklepu i w zdefiniowanej strefie. Godziny oraz strefę trzeba oprzeć na realnej obsadzie, trasach i dostępności kurierów, nie na jednym ustawieniu dla wszystkich sklepów.\n- Na pilotaż preferowana jest płatność online. Płatność przy odbiorze nie jest planowana ze względu na obsługę gotówki i reklamacje. Publiczny start zależy od potwierdzenia, że można obciążyć klienta po kompletacji tylko za produkty faktycznie dostarczone.\n- Zamówienie ma pozwalać klientowi określić sposób postępowania w razie braku produktu: zaakceptować podobny zamiennik, poprosić o kontakt albo pominąć pozycję. Ostateczny tekst i zachowanie wymagają akceptacji prawnej i sprawdzenia aktualizacji kwoty płatności.\n- Sklep może na pilotażu ręcznie potwierdzać koniec kompletacji. Docelowe statusy dla klienta mają być proste i nie mogą sugerować dokładnej lokalizacji kuriera, jeśli system jej nie dostarcza. Dokładny sposób potwierdzenia dostawy i integracja statusów zależą od operatora.\n- Lista produktów i kategorii wykluczonych wymaga potwierdzenia. W rozmowie uzgodniono kierunek wykluczenia alkoholu, produktów wymagających weryfikacji wieku oraz produktów leczniczych; trzeba sprawdzić, jak te kategorie są oznaczone w asortymencie.","decisions":"1. Nie zatwierdzono obietnicy „dostawa w 90 minut” dla wszystkich zamówień. Czas kompletacji, oczekiwanie na kuriera i czas jazdy mają dużą zmienność; przyjęta wcześniej średnia kompletacji 15 minut nie odpowiadała koszykowi 18 pozycji, który w teście zajął 27 minut.\n2. Pilotaż ma ograniczony zakres: jeden sklep i konfigurowalny limit zamówień. Limit 12 dziennie jest propozycją do zweryfikowania, a nie decyzją produkcyjną. Ma zapobiec przeciążeniu sklepu i przyjęciu większej liczby zleceń niż operator może obsłużyć.\n3. Opłata 9,90 zł, minimalna wartość koszyka 80 zł, stawka dostawy oraz rabat promocyjny nie zostały zatwierdzone. Wstępna stawka operatora to 17 zł za kurs do 4 km przy małym wolumenie; 14 zł zależy od osiągnięcia nieustalonego wolumenu. Model finansowy ma pokazać kilka wariantów i uwzględnić kompletację, opakowania, płatność, braki i reklamacje.\n4. Przegląd wyników odbędzie się po dwóch tygodniach od uruchomienia. Progi sukcesu trzeba zdefiniować przed startem publicznym, kiedy znane będą koszty oraz możliwości kurierów. Wśród mierników mają znaleźć się: całkowity czas od potwierdzenia zamówienia do dostawy, czas kompletacji, brakujące pozycje/zamienniki, nieudane przekazania i koszt zmienny na zamówienie.\n5. Nie zatwierdzono promocji z kodem rabatowym. Taka promocja mogłaby zniekształcić ocenę ekonomiki usługi, a jej limit 100 zamówień sam w sobie nie rozwiązuje pytania, co ma mierzyć test.\n6. Obsługa klienta ma być jednym kanałem dla reklamacji dostawy; klient nie powinien sam rozstrzygać, czy problem leżał po stronie sklepu czy kuriera. Podział odpowiedzialności i terminy reklamacji wymagają uzgodnienia z operatorem.","questions":"- Czy operator może przekazywać rzeczywistą dostępność kurierów, limity zleceń i status dostarczenia, czy pilot będzie wymagał ręcznej obsługi?\n- Czy 90 minut ma być celem wewnętrznym, deklarowanym przedziałem czy późniejszą obietnicą klientowską? Od którego zdarzenia liczyć czas i jakie wyjątki dopuścić?\n- Czy płatność częściowa po kompletacji działa w nowej ścieżce? Jak i kiedy klient otrzyma korektę kwoty za brakujące pozycje?\n- Czy operator obsłuży kod PIN/QR, plombę, skanowanie torby i numer pośredni? Czy dopuszcza zdjęcie dostawy i na jakich zasadach?\n- Kto formalnie zatwierdza umowę o danych, aktualizację regulaminu, teksty o zamiennikach i informację o przekazaniu danych?\n- Czy wspólny login sklepu jest dopuszczalny przy ograniczonym dostępie do telefonu i adresu? Jeśli nie, jaki minimalny mechanizm identyfikacji pracownika wdrożyć?\n- Czy 9 czerwca pozostaje realistycznym celem po otrzymaniu dokumentacji operatora i przejściu testu wewnętrznego? Start nie jest potwierdzony.\n- Kto będzie końcowym właścicielem zatwierdzenia zakresu publicznej komunikacji i progów sukcesu? Na spotkaniu nie uzgodniono tej osoby.","tasks":[{"text":"Uzyskać od operatora dostaw specyfikację API, dostęp do środowiska testowego oraz odpowiedź, czy można odczytać dostępność kurierów i ustawiać limity per sklep/miasto. Termin: 21 maja 2026.","assignee":"a5","closed":""},{"text":"Potwierdzić warunki handlowe dla pilotażu: stawkę 17 zł do 4 km, zasady dopłat za dalszy dystans, oczekiwanie, nieudany odbiór, wolumenowe progi 14 zł oraz SLA przy braku kuriera. Termin: 21 maja 2026.","assignee":"a5","closed":""},{"text":"Przygotować model finansowy dla koszyków 60/80/100 zł i opłat dostawy 9,90/14,90 zł, uwzględniając co najmniej 17 zł kosztu dostawy, różne czasy kompletacji, płatność, opakowania, braki i warianty wolumenu. Oznaczyć 40 kursów dziennie jako scenariusz długoterminowy, nie prognozę pilotażu. Termin: 25 maja 2026.","assignee":"a4","closed":""},{"text":"Sprawdzić możliwość częściowego obciążenia płatności po kompletacji i udokumentować przepływ autoryzacji, korekty kwoty i zwrotu. Termin: 22 maja 2026.","assignee":"devB","closed":""},{"text":"Przygotować zakres produktu do sprintu: adres i dostępność per sklep/godziny, konfiguracja strefy i limitu, zgoda na zamiennik/kontakt/pominięcie, dwa statusy klienta oraz znaczniki czasu. Termin: 15 maja 2026.","assignee":"analyst","closed":""},{"text":"Wykonać test 10 koszyków w sklepie i zebrać czas kompletacji, pozycje niedostępne, problemy pakowania oraz wpływ pory dnia; przygotować również porównanie stanów systemowych z półką dla 30 popularnych produktów rano i po południu. Termin: 20 maja 2026.","assignee":"a8","closed":""},{"text":"Sprawdzić obsadę, godziny działania usługi i realny limit dzienny dla sklepu w Brzozowie; zaproponować ustawienia godzin oraz strefy uwzględniające festyn 5–6 czerwca i objazdy. Termin: 22 maja 2026.","assignee":"a2","closed":""},{"text":"Przygotować projekt procesu obsługi braków, kontaktu z klientem, anulowania/zwrotu przy problemie pogodowym lub braku kuriera oraz jednego kanału reklamacji. Sprawdzić delegacje kwotowe (w rozmowie padła niezatwierdzona propozycja limitu 30 zł) i termin zgłoszeń reklamacji operatorowi. Termin: 25 maja 2026.","assignee":"a6","closed":""},{"text":"Potwierdzić wymogi przekazywania danych operatorowi, możliwość numeru pośredniego, retencję, role dostępowe i dziennik zmian; ustalić, czy wspólne konto sklepu może być użyte bez ujawniania danych wszystkim pracownikom. Termin: 25 maja 2026.","assignee":"devB","closed":""},{"text":"Opracować instrukcję kompletacji i pakowania oraz przeprowadzić szkolenie zespołu Brzozowa; określić materiały (torby, kartony, plomby/taśma), identyfikację paczki bez danych osobowych i wymagane urządzenie przy stanowisku. Termin: 29 maja 2026.","assignee":"a2","closed":""},{"text":"Ustalić przed startem publicznym progi sukcesu pilotażu i zatwierdzić komunikację klienta, w tym opłatę, minimalny koszyk, listę kategorii wykluczonych i brak promocji albo jej uzasadniony wariant. Termin: przed decyzją o starcie; konkretnej daty i właściciela końcowego zatwierdzenia nie ustalono.","assignee":"","closed":""}],"status":"draft"}'::jsonb),
    ('{"id":"review","title":"Przegląd gotowości pilotażu dostaw","ended":"2026-11-24T11:00:00.000Z","host":"analyst","participants":["analyst","pm"],"access":["analyst","pm"],"summary":"Zespół sprawdził gotowość do testów wewnętrznych.","decisions":"Potwierdzono zakres prac na kolejny etap.","questions":"","tasks":[{"text":"Potwierdzić datę próby w sklepie.","assignee":"analyst","closed":""}],"status":"draft"}'::jsonb),
    ('{"id":"client-acceptance","title":"Nowa baza klientów — plan odbioru","ended":"2026-11-24T11:00:00.000Z","host":"pm","participants":["pm","dev","analyst","devB"],"access":["pm","dev","analyst","devB"],"summary":"Zespół zaplanował próbę na danych testowych. Sprawdzi dodawanie i wyszukiwanie klientów oraz to, czy po migracji numery i kontakty są nadal przypisane do właściwych klientów.","decisions":"Odbiór jest możliwy, gdy dodana osoba i firma są widoczne w wyszukiwarce, a migracja zachowuje numery klientów i prawidłowe powiązania kontaktów.","questions":"","tasks":[{"text":"Dodać w aplikacji fikcyjną osobę i firmę. Odnaleźć oba rekordy po numerze i sprawdzić, czy ich karty pokazują zapisane dane.","assignee":"dev","closed":""},{"text":"Uruchomić próbną migrację i porównać numery oraz kontakty klientów z danymi źródłowymi. Sprawdzić, czy raport wykrył powtórzony numer.","assignee":"devB","closed":""},{"text":"Porównać wyniki testów z kryteriami odbioru. Rozpisać wykryte niezgodności z krokami odtworzenia i oczekiwanym wynikiem.","assignee":"analyst","closed":""}],"status":"draft"}'::jsonb)
) as source(data)
where not exists (
    select 1 from public.meetings as existing
    where existing.source_id = md5('meetly-demo:prototype:source:' || (source.data ->> 'id'))::uuid
);

insert into public.meetings (id, source_id, import_id, title, initiator_id, started_at, ended_at, status)
select
    meeting.id, meeting.source_id, meeting.import_id, meeting.data ->> 'title', host.id,
    (meeting.data ->> 'ended')::timestamptz, (meeting.data ->> 'ended')::timestamptz,
    (meeting.data ->> 'status')::public.meeting_status
from prototype_meetings as meeting
join prototype_people as host on host.alias = meeting.data ->> 'host';

insert into public.meeting_participants (meeting_id, matrix_user_id, account_id)
select meeting.id, person.matrix_user_id, person.id
from prototype_meetings as meeting
cross join lateral jsonb_array_elements_text(meeting.data -> 'participants') as participant(alias)
join prototype_people as person on person.alias = participant.alias;

insert into public.meeting_access (meeting_id, account_id, retained_from_start, explicitly_granted)
select
    meeting.id, person.id,
    (meeting.data -> 'participants') ? person.alias,
    not ((meeting.data -> 'participants') ? person.alias)
from prototype_meetings as meeting
cross join lateral jsonb_array_elements_text(meeting.data -> 'access') as access(alias)
join prototype_people as person on person.alias = access.alias
where meeting.data ->> 'status' = 'approved';

insert into public.meeting_results (meeting_id, summary, decisions, open_questions)
select
    meeting.id, meeting.data ->> 'summary',
    array_remove(array[nullif(meeting.data ->> 'decisions', '')], null),
    array_remove(array[nullif(meeting.data ->> 'questions', '')], null)
from prototype_meetings as meeting
where meeting.data ->> 'status' = 'approved';

insert into meetly_private.prototype_drafts (meeting_id, summary, decisions, questions, proposed_tasks)
select
    meeting.id, meeting.data ->> 'summary', meeting.data ->> 'decisions',
    meeting.data ->> 'questions', meeting.data -> 'tasks'
from prototype_meetings as meeting
where meeting.data ->> 'status' = 'draft';

create temporary table prototype_tasks on commit drop as
select
    md5('meetly-demo:prototype:task:' || meeting.id::text || ':' || task.position::text)::uuid as id,
    meeting.id as meeting_id, assignee.id as assignee_id, task.data ->> 'text' as description,
    nullif(task.data ->> 'closed', '')::date as closed_date
from prototype_meetings as meeting
cross join lateral jsonb_array_elements(meeting.data -> 'tasks') with ordinality as task(data, position)
join prototype_people as assignee on assignee.alias = task.data ->> 'assignee'
where meeting.data ->> 'status' = 'approved';

insert into public.tasks (id, meeting_id, assignee_id, description, source, status)
select id, meeting_id, assignee_id, description, 'meeting',
    case when closed_date is null then 'open' else 'closed' end::public.task_status
from prototype_tasks;

-- Prototyp podaje dzień zamknięcia, bez godziny i konta wykonującego zmianę.
insert into public.task_changes (task_id, changed_by, changed_at, status)
select task.id, pm.id, (task.closed_date + time '12:00') at time zone 'Europe/Warsaw', 'closed'
from prototype_tasks as task
join prototype_people as pm on pm.alias = 'pm'
where task.closed_date is not null;

commit;
