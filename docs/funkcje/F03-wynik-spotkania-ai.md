# F03 · Wynik spotkania proponowany przez AI

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — wysyła do usługi AI przejściową treść P2 oraz zapisuje zatwierdzone dane wynikowe.
**Zależy od:** F02 · **Źródło:** opis Meetly właściciela projektu, DEC-5, DEC-6, DEC-7, A3.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 3, 6, 7, 10 i 12 · `docs/funkcje/F02-import-spotkania-z-element.md`.

## Cel

Po zakończeniu spotkania prowadzący otrzymuje czytelną propozycję skrótu, decyzji, zadań i tematów do wyjaśnienia, którą może poprawić przed zapisem.

## Zachowanie

1. Po poprawnym imporcie aplikacja wysyła do AI wyłącznie pola dozwolone w sekcji 7 specyfikacji.
2. E5 pokazuje Podsumowanie po lewej i Zadania po prawej, a na wąskim ekranie panele układają się jeden pod drugim. Podsumowanie zawiera Skrót oraz wypełnione Decyzje i Tematy do wyjaśnienia. Puste sekcje można dodać. Pole zadania rośnie wraz z treścią.
3. Prowadzący może poprawić lub usunąć każdą propozycję oraz zmienić osobę odpowiedzialną za zadanie.
4. Prowadzący zatwierdza wynik. Aplikacja zapisuje Wynik spotkania i Zadania, a następnie usuwa przejściową transkrypcję.
5. AI nie tworzy zadania bez pewnie wskazanej osoby; taka sprawa trafia do Tematów do wyjaśnienia.

## Dane

Czyta przejściową transkrypcję, tytuł oraz imiona wyświetlane i role uczestników z listy startowej. Tworzy Wynik spotkania i Zadania ze źródłem „spotkanie” oraz odwołaniem do bieżącej sesji. E-mail, identyfikatory Matrix i Meetly i dane innych spotkań nie trafiają do modelu. Termin zadania pozostaje pusty, jeśli nie został jasno podany lub zaakceptowany przez prowadzącego.

## Kryteria akceptacji

- F03-KA1 [test]: Gdy atrapa AI zwróci szkic, E5 pokazuje edytowalny skrót i pełną treść zadań. Wypełnione decyzje i tematy do wyjaśnienia są widoczne w Podsumowaniu, a przy pustych sekcjach prowadzący widzi akcję ich dodania.
- F03-KA2 [test, ręcznie]: Gdy prowadzący zmieni treść zadania, przypisze je Analitykowi A i zatwierdzi wynik, to zapisane zadanie ma poprawioną treść oraz przypisanie; AI nie nadpisuje tej poprawki.
- F03-KA3 [test]: Gdy odpowiedź AI zawiera zadanie bez osoby odpowiedzialnej, to nie zostaje ono zapisane jako Zadanie, a jego treść pojawia się w Tematach do wyjaśnienia.
- F03-KA4 [test]: Gdy e-mail konta zawiera `ZNACZNIK_EMAIL`, to wartość nie jest obecna w danych przekazanych do atrapy AI.
- F03-KA5 [test]: Gdy prowadzący wybierze „Porzuć szkic”, to Wynik spotkania i Zadania nie zostają zapisane, a przejściowa transkrypcja jest usunięta.
- F03-KA6 [test, ręcznie]: Gdy prowadzący zatwierdzi wynik, to surowa transkrypcja nie jest już możliwa do odczytu, a zapisany Wynik spotkania jest dostępny zgodnie z rolami z F04.

## Przypadki brzegowe i błędy

- Odpowiedź AI ma nieprawidłowy format: aplikacja nie pokazuje jej jako wyniku, nic nie zapisuje i prosi prowadzącego o ręczne ponowienie.
- Usługa AI nie odpowiada: E5 informuje „Nie udało się przygotować podsumowania. Spróbuj ponownie.”; aplikacja nie ponawia sama. Prowadzący może ponowić w otwartej sesji albo zakończyć ją bez zapisu.
- Zatwierdzenie dwukrotnie: powstaje jeden Wynik spotkania i po jednym rekordzie każdego zatwierdzonego zadania.
- Tekst zadania przekracza 500 znaków: prowadzący widzi komunikat przy pozycji i nie może zatwierdzić, dopóki jej nie skróci albo nie usunie.

## Ochrona danych

Poziom P2. Klucz AI pozostaje po stronie serwera. Wszystkie testy używają atrapy AI. Prawdziwa treść spotkań nie może trafić do AI przed przejściem bramki danych i sprawdzeniem aktualnych warunków usługi.

## Poza zakresem tej karty

- Samodzielne wysyłanie wyników e-mailem lub komunikatorem.
- Aktualizowanie zadań w innych aplikacjach oraz cytaty z transkrypcji.

## Jak sprawdzić ręcznie

1. Zaimportuj demonstracyjne spotkanie i sprawdź układ E5, widoczność pustych sekcji oraz pełną treść długiego zadania.
2. Popraw jedno zadanie, usuń drugie i zatwierdź wynik.
3. Sprawdź na drugim koncie, że surowa transkrypcja nie jest dostępna.
