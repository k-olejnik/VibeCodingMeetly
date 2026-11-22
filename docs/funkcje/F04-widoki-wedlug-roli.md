# F04 · Widoki wyników zależne od roli

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — prezentuje dane P2 różnym rolom i musi egzekwować dostęp poza interfejsem.
**Zależy od:** F01, F03 · **Źródło:** DEC-3, DEC-8, DEC-11, N1, N2.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 4–7 i 10 · `docs/funkcje/F01-logowanie-role.md` · `docs/funkcje/F03-wynik-spotkania-ai.md`.

## Cel

Każda osoba otrzymuje po zalogowaniu tylko taki zakres zatwierdzonych wyników Meetly, jaki wynika z jej roli i dostępu do spotkania.

## Zachowanie

1. PM i dyrektor widzą na E2 historię zatwierdzonych spotkań, a po otwarciu E6: skrót, decyzje, tematy do wyjaśnienia oraz wszystkie zadania z ich aktualnym stanem.
2. Programista i analityk widzą na E2 listę wyłącznie własnych zadań: treść, opcjonalny termin, źródło i aktualny stan.
3. Programista i analityk widzą zatwierdzone spotkanie i jego podsumowanie, decyzje oraz tematy do wyjaśnienia, jeśli są na jego aktualnej liście dostępu. Domyślnie lista obejmuje konta połączone w chwili „bot start”. Listę dostępu mogą zmieniać uczestnicy z listy startowej z aktywnym dostępem oraz PM i dyrektor. Dostęp przyznany osobie spoza listy startowej pozwala jej odczytać wynik. Uprawnienia PM i dyrektora wynikają z roli.
4. Widoki pokazują wyłącznie zatwierdzone wyniki; sesje „przetwarzanie”, „do zatwierdzenia” i „odrzucone” nie trafiają do historii innych osób.

5. Historia spotkań na E2 pozwala wyszukać słowa w tytule i podsumowaniu, ustawić daty „Od” i „Do” oraz wybrać „Starsze niż” z liczbą i jednostką „dni”, „tygodnie” lub „miesiące”. Filtry łączą się i odnoszą daty do zakończenia spotkania.
6. Meetly usuwa spotkanie oraz jego wynik po 6 miesiącach kalendarzowych od zakończenia. Każdy użytkownik z aktualnym prawem odczytu zatwierdzonego spotkania może je usunąć wcześniej. W obu przypadkach Meetly usuwa także zadania ze spotkania i historię ich zmian.

## Dane

Czyta Wynik spotkania i Zadania. PM oraz dyrektor odczytują wszystkie zatwierdzone rekordy zespołu. Programista i analityk odczytują wyniki spotkań zgodnie z listą dostępu i wyłącznie własne zadania. Jeżeli widzą własne zadanie bez dostępu do spotkania, API pomija tytuł i odnośnik do spotkania. Reguła dostępu jest egzekwowana przez bazę lub serwer.

## Kryteria akceptacji

- F04-KA1 [test, ręcznie]: Gdy PM A albo Dyrektor A otworzy zatwierdzony wynik, to widzi pełny skrót, decyzje, tematy do wyjaśnienia oraz zadania przypisane do wszystkich osób z ich stanem.
- F04-KA2 [test, ręcznie]: Gdy Programista A otworzy E2, to widzi swoje zadanie „Uzupełnij opis scenariusza logowania” ze stanem, ale nie widzi zadania Analityk A.
- F04-KA3 [test]: Gdy Programista A spróbuje odczytać wynik spotkania bez dostępu albo zadanie Analityka A, serwer odrzuca żądanie. Po dodaniu dostępu wynik staje się widoczny, a po odebraniu znika z listy i bezpośredniego odczytu.
- F04-KA4 [test]: Gdy Analityk A nie ma przypisanych zadań, to widzi stan pusty „Nie masz jeszcze zadań ze spotkań”, bez listy cudzych zadań.
- F04-KA5 [test]: Gdy prowadzący nie zatwierdzi wyniku, to PM, dyrektor, programista i analityk nie widzą go w swoich widokach.

- F04-KA6 [test]: Uczestnik z aktywnym dostępem, PM i dyrektor mogą zmieniać listę dostępu. Serwer odrzuca zmianę od osoby, której jedynie przyznano odczyt.
- F04-KA7 [test, ręcznie]: Wyszukiwanie po słowach, obie granice daty oraz każda jednostka wieku działają osobno i łącznie. Spotkanie bez dostępu nie występuje w wynikach.
- F04-KA8 [test]: Osoba z dostępem może usunąć zatwierdzone spotkanie także po ręcznym przyznaniu dostępu. Serwer odrzuca próbę usunięcia bez aktualnego dostępu. Po wcześniejszym usunięciu lub upływie 6 miesięcy spotkanie i wynik znikają z historii, wyszukiwania i odczytu bezpośredniego dla wszystkich ról.

## Przypadki brzegowe i błędy

- Data „Od” późniejsza od „Do” lub niepoprawna liczba w filtrze „Starsze niż”: pokaż komunikat przy polu.

- Zadanie bez terminu: lista pokazuje treść i źródłowe spotkanie, jeśli osoba ma do niego dostęp bez pustego pola udającego datę.
- Dostęp odebrany przez zmianę roli poza aplikacją: przy następnym odczycie aplikacja nie zwraca już danych niedostępnych dla nowej roli.
- Błąd ładowania danych: użytkownik widzi ogólny komunikat i możliwość ponowienia; aplikacja nie pokazuje danych z pamięci, jeśli sesja wygasła.

## Ochrona danych

Poziom P2. Testy obejmują PM A, Dyrektor A, Programista A, Programista B i Analityk A. Każdy test dostępu sprawdza regułę po stronie serwera lub bazy, nie tylko ukrycie przycisku.

## Poza zakresem tej karty

- Powiadomienia o nowych zadaniach.
- Konfigurowanie przez dyrektora własnego zestawu informacji.
- Oznaczanie zadania jako wykonane i edycja zadań po zatwierdzeniu wyniku.

## Jak sprawdzić ręcznie

1. Zatwierdź demonstracyjny wynik z zadaniem dla Programista A i Analityk A.
2. Otwórz aplikację kolejno jako PM A, Dyrektor A, Programista A i Analityk A.
3. Porównaj widoki z tabelą ról w sekcji 4 specyfikacji.
