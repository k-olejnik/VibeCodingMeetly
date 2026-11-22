# Transkrypcje demonstracyjne Meetly

Trzy fikcyjne spotkania o dodaniu bazy klientów do aplikacji. Dwa pierwsze są zatwierdzone w historii Meetly, a trzecie czeka na zatwierdzenie na koncie PM A. Przed każdym nagraniem inicjator potwierdził obecność wszystkich zaproszonych osób i poinformował je o nagrywaniu.

## Nowa baza klientów — wymagania i wygląd ekranów

**Uczestnicy przy starcie** — Programista A (A1, inicjator), Analityk A (A3), Programista B (A7), PM A.

| Czas | Osoba | Wypowiedź |
| --- | --- | --- |
| 00:00 | A1 | Bot start. Zacznijmy od tego, co pracownik obsługi ma zrobić w nowej bazie. Dzwoni klient. Jak pracownik znajduje jego dane? |
| 00:24 | A3 | Jeśli klient zna swój numer, pracownik wpisuje go w wyszukiwarkę. W przeciwnym razie szuka po imieniu i nazwisku albo po nazwie firmy. Na liście wystarczą numer, nazwa i typ klienta. Telefon i e-mail pokażemy po wejściu w kartę. |
| 00:52 | A1 | Przygotuję trzy makiety: listę, kartę klienta i formularz dodawania. Po wyborze typu „Osoba” formularz pokaże imię i nazwisko, a przy typie „Firma” nazwę firmy. |
| 01:17 | A7 | Rozpiszę, co API ma zwracać na listę i do karty oraz jakie dane przyjmie przy dodawaniu osoby i firmy. Przejdziemy razem przez ten opis, kiedy będą makiety. |
| 01:38 | A3 | Ja spiszę wymagane pola dla obu typów i przygotuję przykłady wyszukiwania po numerze i nazwie. |
| 01:55 | PM A | Pokażę makiety zespołowi obsługi. Dopytam, czy pracownicy często zaczynają od numeru telefonu i czy powinniśmy dodać taką opcję do wyszukiwarki. |
| 02:14 | A1 | Dobrze, to zostawiamy do wyjaśnienia po przeglądzie. Bot stop. |

## Nowa baza klientów — struktura tabel i migracja

**Uczestnicy przy starcie** — Programista B (A7, inicjator), Programista A (A1), Analityk A (A3).

| Czas | Osoba | Wypowiedź |
| --- | --- | --- |
| 00:00 | A7 | Bot start. Proponuję, żeby tabela `klienci` trzymała wspólny identyfikator, numer i typ. W `klienci_osoby` zapiszemy imię i nazwisko, a w `klienci_firmy` nazwę firmy. Obie tabele powiążemy z klientem przez jego identyfikator. |
| 00:33 | A3 | Firma może mieć kilka numerów telefonu i adresów e-mail. Czy po migracji nadal zobaczymy wszystkie na jednej karcie? |
| 00:47 | A7 | Tak. Każdy telefon i e-mail dostanie osobny wiersz w tabeli `kontakty_klientow`, powiązany z klientem. Przygotuję skrypt tworzący cztery tabele, klucze obce i ograniczenie unikalności numeru klienta. |
| 01:16 | A1 | Podłączę listę, kartę i formularz do API, które ustaliliśmy na poprzednim spotkaniu. Po zapisaniu nowej osoby albo firmy otworzymy od razu jej kartę. |
| 01:39 | A7 | Osobno przygotuję skrypt migracji. Zachowamy dotychczasowe numery klientów. Jeśli numer się powtarza, skrypt zgłosi konflikt w raporcie. Musimy jeszcze ustalić, co zrobić z taką parą rekordów. |
| 02:04 | A3 | Do próby przygotuję osobę, firmę z kilkoma kontaktami i dwa rekordy o tym samym numerze. Opiszę, które dane mają się przepisać i który przypadek ma trafić do raportu. |
| 02:26 | A7 | Mamy podział prac. Dzięki, kończymy. |

Nagranie drugiego spotkania kończy się wraz z rozłączeniem rozmowy.

## Nowa baza klientów — plan odbioru

**Uczestnicy przy starcie** — PM A (inicjator), Programista A (A1), Analityk A (A3), Programista B (A7).

| Czas | Osoba | Wypowiedź |
| --- | --- | --- |
| 00:00 | PM A | Bot start. Ustalmy, co sprawdzimy przed odbiorem bazy klientów. Potrzebujemy potwierdzić zarówno działanie ekranów, jak i wynik migracji. |
| 00:23 | A1 | Dodam w aplikacji fikcyjną osobę i firmę. Potem odszukam obie po numerze i sprawdzę na kartach, czy widać zapisane dane. |
| 00:46 | A7 | Uruchomię próbną migrację i porównam numery oraz kontakty z danymi źródłowymi. Sprawdzę też, czy para rekordów z powtórzonym numerem trafiła do raportu. |
| 01:09 | A3 | Porównam wyniki z kryteriami odbioru. Jeśli coś się nie zgadza, spiszę kroki odtworzenia i oczekiwany wynik, żeby dało się od razu wrócić do problemu. |
| 01:29 | PM A | Odbieramy moduł, jeśli da się znaleźć zarówno dodaną osobę, jak i firmę, a po migracji numery i kontakty nadal należą do właściwych klientów. Na tym mamy komplet. Bot stop. |
