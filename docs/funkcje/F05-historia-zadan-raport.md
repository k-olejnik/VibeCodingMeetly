# F05 · Historia zadań i raport tygodniowy

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — zmienia trwałe dane P2, wprowadza historię zmian i egzekwuje nowe uprawnienie PM.
**Zależy od:** F04 · **Źródło:** DEC-10, DEC-12, DEC-13, A4, N7.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 3, 4, 6, 7, 10–12 · `docs/funkcje/F04-widoki-wedlug-roli.md`.

## Cel

PM ma historię zadań oraz czytelny raport tygodniowy: co zostało zamknięte, a co pozostaje otwarte u każdej osoby. Może również dodać do historii zadanie, które zespół wykonał poza Meetly.

## Zachowanie

1. PM otwiera E7, który domyślnie pokazuje bieżący tydzień kalendarzowy od poniedziałku do niedzieli; może wybrać wcześniejszy tydzień.
2. Sekcja „Zamknięte w tym tygodniu” pokazuje zadania, dla których w wybranym tygodniu powstała Zmiana zadania na „zamknięte”.
3. Sekcja „Otwarte zadania” grupuje aktualnie otwarte Zadania według osób odpowiedzialnych.
4. PM może zamknąć albo ponownie otworzyć widoczne zadanie. Każda taka czynność zmienia jego aktualny stan i tworzy Zmianę zadania z czasem oraz kontem PM.
5. PM może dodać ręcznie wykonane zadanie: wpisuje treść, wybiera osobę odpowiedzialną i zapisuje je jako zamknięte. Zdarzenie zamknięcia trafia do raportu tygodniowego.
6. Dyrektor może czytać E7. Jako wykonawca może usunąć własne zadanie po potwierdzeniu zgodnie z punktem 7. Pozostałe role nie mają dostępu do E7.

7. PM i wykonawca mogą usunąć widoczne zadanie po potwierdzeniu. Przy zadaniu ze spotkania osoba usuwająca musi mieć do niego aktualny dostęp. Przy zadaniu ręcznym uprawnienie wynika z roli PM albo przypisania. Jeżeli późniejsze spotkanie zmieniło ustalenia, uprawniona osoba może jawnie usunąć wcześniejsze zadanie. Nowe zadanie pozostaje niezależnym rekordem.

## Dane

Czyta Zadanie i Zmianę zadania. Tworzy ręczne Zadanie ze źródłem „dodane ręcznie przez PM” oraz Zmianę zadania. Zmiana stanu zapisuje historię. Usunięcie zadania usuwa również jego zdarzenia z historii i raportów. Raport jest wyliczany z historii, bez kopiowania do osobnej encji.

## Kryteria akceptacji

- F05-KA1 [test, ręcznie]: Gdy PM A otworzy E7 w tygodniu od 02.11.2026 do 08.11.2026, to widzi sekcje „Zamknięte w tym tygodniu” i „Otwarte zadania”, a domyślny zakres obejmuje te dni od poniedziałku do niedzieli.
- F05-KA2 [test]: Gdy PM A zamknie otwarte zadanie Programista A, to zadanie zmienia stan na „zamknięte”, powstaje jedna Zmiana zadania z kontem PM A i czasem zmiany, a zadanie pojawia się w sekcji zamkniętych danego tygodnia.
- F05-KA3 [test]: Gdy PM A ponownie otworzy wcześniej zamknięte zadanie, to jego aktualny stan jest „otwarte” i widnieje ono przy osobie odpowiedzialnej; historyczne zdarzenie zamknięcia pozostaje w raporcie tygodnia, w którym nastąpiło.
- F05-KA4 [test, ręcznie]: Gdy PM A doda ręcznie zadanie „Zweryfikowano opis wydania”, przypisze je Analityk A i zapisze jako zamknięte, to ma źródło „dodane ręcznie przez PM”, tworzy się historia zamknięcia, a zadanie jest widoczne w raporcie oraz dla PM i dyrektora.
- F05-KA5 [test]: Gdy Dyrektor A, Programista A albo Analityk A spróbuje dodać ręczne zadanie lub zmienić jego stan, także z pominięciem interfejsu, to baza albo serwer odrzuca operację.
- F05-KA6 [test]: Gdy Programista A lub Analityk A spróbuje odczytać E7 albo Zmiany zadań, to nie otrzymuje danych; Dyrektor A widzi raport bez możliwości zmiany.

- [test]: Po usunięciu spotkania raport i historia pomijają jego zadania oraz zdarzenia zmiany stanu. Ręcznie dodane zadanie PM jest nadal widoczne.

- F05-KA7 [test, ręcznie]: PM usuwa widoczne wcześniejsze zadanie po potwierdzeniu. Zadanie znika z list, szczegółów i raportów, a nowsze pozostaje. Wykonawca może usunąć własne zadanie ręczne albo własne zadanie ze spotkania, do którego ma dostęp. Po utracie dostępu serwer odrzuca odczyt i operacje na zadaniach z tego spotkania.
- F05-KA8 [test]: Dla PM i dyrektora raport uwzględnia zadania ręczne oraz tylko zadania z aktualnie dostępnych spotkań, także za minione tygodnie. Po utracie dostępu do spotkania znikają również jego zdarzenia i zadania w raporcie tej osoby, a pozostali uprawnieni nadal je widzą.

## Przypadki brzegowe i błędy

- Wybrany tydzień nie zawiera zamkniętych zadań: sekcja pokazuje „W tym tygodniu nie zamknięto zadań”, bez danych z innych tygodni.
- Osoba nie ma otwartych zadań: nie pojawia się jako pusta grupa w raporcie.
- Dwukrotne zamknięcie tego samego zadania: stan zmienia się raz i powstaje jedno zdarzenie zamknięcia.
- Treść ręcznie dodawanego zadania ma 0 albo ponad 500 znaków: zapis jest zablokowany, a PM widzi komunikat przy polu. Treść od 1 do 500 znaków może zostać zapisana.
- Błąd zapisu stanu lub ręcznego zadania: aplikacja pokazuje „Nie udało się zapisać zmiany. Spróbuj ponownie”, zachowuje wpisaną treść i nie pokazuje zmiany w raporcie przed udanym zapisem.

## Ochrona danych

PM i dyrektor mają dostęp do ręcznych zadań zespołu. Zadania, zdarzenia i odnośniki związane ze spotkaniem są widoczne tylko przy aktualnym dostępie do tego spotkania. Reguła obejmuje również raporty z wcześniejszych tygodni. Usunięcie spotkania usuwa powiązane zadania i historię ich zmian dla wszystkich uprawnionych.

Poziom P2. Zdarzenie zmiany zawiera konto PM i pośrednio informacje o pracy członka zespołu, więc nie trafia do logów. Testy korzystają wyłącznie z fikcyjnych kont. N7 musi być sprawdzony przez próbę zmiany z każdej roli.

## Poza zakresem tej karty

- Powiadomienia o zmianie stanu zadania.
- Edytowanie treści zadań po zatwierdzeniu wyniku spotkania.
- Automatyczny eksport raportu, integracje z innymi narzędziami i raporty za inne okresy niż tydzień.

## Jak sprawdzić ręcznie

1. Zaloguj się jako PM A i zamknij demonstracyjne zadanie Programista A.
2. Sprawdź raport bieżącego tygodnia, a następnie ponownie otwórz zadanie.
3. Dodaj zakończone zadanie dla Analityk A.
4. Zaloguj się jako Dyrektor A, Programista A i Analityk A, aby sprawdzić różne zakresy dostępu.
