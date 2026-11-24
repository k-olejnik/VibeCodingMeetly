# F04 · Widoki wyników zależne od roli

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — prezentuje dane P2 różnym rolom i musi egzekwować dostęp poza interfejsem.
**Zależy od:** F01, F03 · **Źródło:** DEC-3, DEC-8, DEC-11, DEC-12, DEC-13, N1, N2.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 4–7 i 10 · `docs/funkcje/F01-logowanie-role.md` · `docs/funkcje/F03-wynik-spotkania-ai.md`.

## Cel

Każda osoba otrzymuje po zalogowaniu tylko taki zakres zatwierdzonych wyników Meetly, jaki wynika z jej roli i dostępu do spotkania.

## Zachowanie

1. PM i dyrektor widzą na E2 historię zatwierdzonych spotkań, do których mają aktualny dostęp. W E6 widzą ich skrót, decyzje, tematy do wyjaśnienia oraz wszystkie zadania ze stanami.
2. Programista i analityk widzą na E2 listę wyłącznie własnych zadań z dostępnych spotkań oraz zadań bez spotkania. Lista pokazuje treść, opcjonalny termin, źródło i aktualny stan.
3. Aktualny dostęp do zatwierdzonego spotkania wynika z zachowanego dostępu uczestnika z listy „bot start”, jawnego nadania lub przypisania co najmniej jednego zadania z tego spotkania. Przypisanie nadaje dostęp przy zatwierdzeniu, niezależnie od roli. Po usunięciu ostatniego przypisanego zadania wygasa dostęp wynikający z przypisania. Pozostałe podstawy dostępu zachowują ważność. Listę dostępu mogą zmieniać wyłącznie uczestnicy z listy startowej, którzy mają aktualny dostęp, niezależnie od roli. Osoba spoza listy startowej z jawnym dostępem lub przypisanym zadaniem uzyskuje odczyt.
4. Widoki pokazują wyłącznie zatwierdzone wyniki; sesje „przetwarzanie”, „do zatwierdzenia” i „odrzucone” nie trafiają do historii innych osób.

5. Historia spotkań na E2 pozwala wyszukać słowa w tytule i podsumowaniu, ustawić daty „Od” i „Do” oraz wybrać „Starsze niż” z liczbą i jednostką „dni”, „tygodnie” lub „miesiące”. Filtry łączą się i odnoszą daty do zakończenia spotkania.
6. Meetly usuwa spotkanie oraz jego wynik po 6 miesiącach kalendarzowych od zakończenia. Uczestnik z listy obecności przy „bot start” i z aktualnym dostępem może je usunąć wcześniej, po potwierdzeniu w oknie dialogowym. Sama rola PM lub dyrektora nie daje prawa do tej operacji. W obu przypadkach Meetly usuwa także zadania ze spotkania i historię ich zmian.

7. Inicjator z dostępem widzi wszystkie zadania w szczegółach swojego spotkania. Zakładka „Zadania” programisty i analityka nadal pokazuje wyłącznie zadania przypisane do danego konta.

## Dane

Czyta Wynik spotkania i Zadania zgodnie z dostępem do spotkania. PM i dyrektor widzą wszystkie zadania z dostępnych spotkań oraz ręczne zadania zespołu. Programista i analityk odczytują własne zadania. Inicjator z dostępem widzi wszystkie zadania w szczegółach zainicjowanego spotkania. Utrata skutecznego dostępu odbiera odczyt spotkania i jego zadań również w API i raportach. Reguły egzekwuje baza lub serwer.

## Kryteria akceptacji

- F04-KA1 [test, ręcznie]: PM i dyrektor z dostępem widzą pełny wynik oraz wszystkie zadania ze spotkania. Bez dostępu, także po jego utracie, historia, wyszukiwanie i odczyt bezpośredni nie zwracają spotkania ani zadań.
- F04-KA2 [test, ręcznie]: Gdy Programista A otworzy E2, to widzi swoje zadanie „Uzupełnij opis scenariusza logowania” ze stanem, ale nie widzi zadania Analityk A.
- F04-KA3 [test]: Gdy Programista A spróbuje odczytać wynik spotkania bez dostępu lub cudze zadanie poza szczegółami zainicjowanego spotkania, serwer odrzuca żądanie. Po dodaniu dostępu wynik staje się widoczny. Gdy Programista A traci ostatnią podstawę dostępu, wynik i zadania znikają z list oraz przestają być dostępne bezpośrednio. Pozostali uprawnieni nadal je widzą.
- F04-KA4 [test]: Gdy Analityk A nie ma przypisanych zadań, to widzi stan pusty „Nie masz jeszcze zadań ze spotkań”, bez listy cudzych zadań.
- F04-KA5 [test]: Dopóki wynik nie jest zatwierdzony, żadna rola nie widzi go w historii. Szkic pojawia się w kolejce uprawnionych uczestników zgodnie z F02.

- F04-KA6 [test]: Listę może zmienić uczestnik z listy startowej i z aktualnym dostępem. Serwer odrzuca próbę uczestnika po utracie dostępu i próbę osoby spoza listy startowej, także PM i dyrektora.
- F04-KA7 [test, ręcznie]: Wyszukiwanie po słowach, obie granice daty oraz każda jednostka wieku działają osobno i łącznie. Spotkanie bez dostępu nie występuje w wynikach.
- F04-KA8 [test]: Uczestnik z aktualnym dostępem widzi „Usuń spotkanie”. Anulowanie zachowuje spotkanie i zadania, a potwierdzenie usuwa je dla wszystkich. Serwer odrzuca próbę usunięcia przez osobę spoza listy uczestników lub bez aktualnego dostępu. Po wcześniejszym usunięciu lub upływie 6 miesięcy spotkanie i wynik znikają z historii, wyszukiwania i odczytu bezpośredniego dla wszystkich ról.

- F04-KA9 [test, ręcznie]: Gdy Programista A zainicjuje spotkanie i przypisze zadanie Analitykowi A, widzi je w szczegółach tego spotkania. Jego własna lista nie pokazuje zadania Analityka A. Analityk A widzi przypisane mu zadanie.
- F04-KA10 [test]: Zadanie nadaje wgląd również nieobecnemu PM lub dyrektorowi. Po usunięciu ostatniego przypisanego zadania odczyt wygasa, jeśli osoba nie ma innej podstawy dostępu. W osobnej próbie jawne nadanie zachowuje odczyt.

## Przypadki brzegowe i błędy

- Data „Od” późniejsza od „Do” lub niepoprawna liczba w filtrze „Starsze niż”: pokaż komunikat przy polu.

- Zadanie bez terminu: lista pokazuje treść i źródłowe spotkanie, jeśli osoba ma do niego dostęp bez pustego pola udającego datę.
- Zmiana roli poza aplikacją: przy następnym odczycie aplikacja stosuje uprawnienia nowej roli i aktualny dostęp do spotkania.
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
