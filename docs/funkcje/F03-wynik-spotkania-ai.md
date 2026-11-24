# F03 · Wynik spotkania proponowany przez AI

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — wysyła do usługi AI przejściową treść P2 oraz zapisuje zatwierdzone dane wynikowe.
**Zależy od:** F02 · **Źródło:** opis Meetly właściciela projektu, DEC-5, DEC-6, DEC-7, A3.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 3, 6, 7, 10 i 12 · `docs/funkcje/F02-import-spotkania-z-element.md`.

## Cel

Po zakończeniu spotkania uprawnieni uczestnicy otrzymują propozycję skrótu, decyzji, zadań i tematów do wyjaśnienia, którą mogą poprawić przed zapisem.

## Zachowanie

1. Po poprawnym imporcie aplikacja wysyła do AI wyłącznie pola dozwolone w sekcji 7 specyfikacji.
2. E5 pokazuje Podsumowanie po lewej i Zadania po prawej, a na wąskim ekranie panele układają się jeden pod drugim. Podsumowanie zawiera Skrót oraz wypełnione Decyzje i Tematy do wyjaśnienia. Puste sekcje można dodać. Pole zadania rośnie wraz z treścią.
3. Każdy uczestnik z dostępem do szkicu może poprawić lub usunąć każdą propozycję, zmienić wykonawcę oraz listę dostępu do publikowanego wyniku.
4. Pierwsze skuteczne zatwierdzenie zapisuje Wynik spotkania, Zadania i wynikające z przypisań uprawnienia. Meetly usuwa roboczą transkrypcję i zamyka szkic we wszystkich kolejkach. Kolejna próba zatwierdzenia zgłasza, że wynik został już zatwierdzony.
5. AI nie tworzy zadania bez pewnie wskazanej osoby; taka sprawa trafia do Tematów do wyjaśnienia.

## Dane

Czyta przejściową transkrypcję, tytuł oraz imiona wyświetlane i role uczestników z listy startowej. Tworzy Wynik spotkania i Zadania ze źródłem „spotkanie” oraz odwołaniem do bieżącej sesji. E-mail, identyfikatory Matrix i Meetly i dane innych spotkań nie trafiają do modelu. Termin zadania pozostaje pusty, jeśli nie został jasno podany lub zaakceptowany przez zatwierdzającego uczestnika.

## Kryteria akceptacji

- F03-KA1 [test]: Gdy atrapa AI zwróci szkic, E5 pokazuje edytowalny skrót i pełną treść zadań. Wypełnione decyzje i tematy do wyjaśnienia są widoczne w Podsumowaniu, a przy pustych sekcjach uczestnik widzi akcję ich dodania.
- F03-KA2 [test, ręcznie]: Uczestnik inny niż inicjator poprawia zadanie, przypisuje je Analitykowi A i zatwierdza. Wynik zachowuje poprawkę, a przypisanie daje Analitykowi A dostęp także wtedy, gdy nie był obecny.
- F03-KA3 [test]: Gdy odpowiedź AI zawiera zadanie bez osoby odpowiedzialnej, to nie zostaje ono zapisane jako Zadanie, a jego treść pojawia się w Tematach do wyjaśnienia.
- F03-KA4 [test]: Gdy e-mail konta zawiera `ZNACZNIK_EMAIL`, to wartość nie jest obecna w danych przekazanych do atrapy AI.
- F03-KA5 [test]: Gdy inicjator wybierze „Porzuć szkic”, to Wynik spotkania i Zadania nie zostają zapisane, a przejściowa transkrypcja jest usunięta.
- F03-KA6 [test, ręcznie]: Dwie uprawnione osoby niemal równocześnie zatwierdzają szkic. Wynik i zadania zapisują się raz, szkic znika z obu kolejek, a robocza transkrypcja przestaje być dostępna.

## Przypadki brzegowe i błędy

- Odpowiedź AI ma nieprawidłowy format: aplikacja nie pokazuje jej jako wyniku, nic nie zapisuje i prosi uprawnionego uczestnika o ręczne ponowienie.
- Usługa AI nie odpowiada: E5 informuje „Nie udało się przygotować podsumowania. Spróbuj ponownie.”; aplikacja nie ponawia sama. Uprawniony uczestnik może ponowić w otwartej sesji albo zakończyć ją bez zapisu.
- Zatwierdzenie dwukrotnie: powstaje jeden Wynik spotkania i po jednym rekordzie każdego zatwierdzonego zadania.
- Tekst zadania przekracza 500 znaków: uczestnik widzi komunikat przy pozycji i nie może zatwierdzić, dopóki jej nie skróci albo nie usunie.

## Ochrona danych

Poziom P2. Przed zatwierdzeniem roboczą transkrypcję mogą odczytać wyłącznie inicjator i proces generowania szkicu. Klucz AI pozostaje po stronie serwera. Wszystkie testy używają atrapy AI. Prawdziwa treść spotkań nie może trafić do AI przed przejściem bramki danych i sprawdzeniem aktualnych warunków usługi.

## Poza zakresem tej karty

- Samodzielne wysyłanie wyników e-mailem lub komunikatorem.
- Aktualizowanie zadań w innych aplikacjach oraz cytaty z transkrypcji.

## Jak sprawdzić ręcznie

1. Zaimportuj demonstracyjne spotkanie i sprawdź układ E5, widoczność pustych sekcji oraz pełną treść długiego zadania.
2. Popraw jedno zadanie, usuń drugie i zatwierdź wynik.
3. Sprawdź na drugim koncie, że surowa transkrypcja nie jest dostępna.
