# Meetly — test prototypu po imporcie z Element

**Status:** nowa ścieżka czeka na niezależny test z użytkownikami. Wcześniejsza karta decyzji i notatki dotyczą prototypu z przyciskami „Rozpocznij spotkanie” i „Zakończ spotkanie”. Zawierają jeden test uczestnika, obserwacje autorki i osobno oznaczoną symulację agenta. Symulacja nie jest drugą obserwacją użytkownika. Aktualną ścieżkę sprawdził symulowany Tester nr 2. [Raport z przebiegu](raport-testu-symulowanego.md) zawiera wyniki i ocenę względem specyfikacji.

## Scenariusz

Każda osoba testuje samodzielnie na świeżym stanie [prototypu](meetly-prototyp.html). Prototyp może zachować stan w przeglądarce, więc na kolejne przejście użyj osobnego profilu lub usuń dane testowe tej strony. Korzystaj wyłącznie z fikcyjnych kont i spotkań.

1. Na koncie Programista A (A1) znajdź szkic „Uruchomienie miejskiej usługi dostaw”, który właśnie trafił z Element. Zapisz, gdzie osoba szuka szkicu i czy znajduje go bez podpowiedzi.
2. Popraw skrót, edytuj dłuższe zadanie i przypisz je Analitykowi A (A3). Przeczytaj pełną treść zadania. Na telefonie sprawdź, czy podsumowanie i zadania mieszczą się jeden pod drugim.
3. Upewnij się, że Analityk A ma dostęp do wyniku i zatwierdź. Zapisz, czy osoba znajduje akcję zatwierdzenia i wie, że wynik został zapisany.
4. Przełącz konto na Analityka A. Znajdź spotkanie w „Spotkaniach” i zadanie w „Zadaniach”. Porównaj skrót i przypisanie z krokiem drugim.
5. W drugim przykładzie „Przegląd gotowości pilotażu dostaw” na koncie Analityka A sprawdź stan szkicu bez tematów do wyjaśnienia.

### Scenariusze po zmianie zasad

1. Otwórz zatwierdzony wynik jako uczestnik, wybierz „Usuń spotkanie” i anuluj. Spotkanie oraz zadania pozostają dostępne. Otwórz ten sam wynik jako osoba spoza listy obecności z przyznanym dostępem. Akcja usunięcia jest niedostępna. Wróć na konto uczestnika i potwierdź usunięcie. Wynik oraz powiązane zadania znikają we wszystkich widokach.
2. Zatwierdź jako A1 spotkanie z zadaniem dla A3. A1 widzi to zadanie w szczegółach spotkania, a zakładka „Zadania” A1 je pomija. A3 widzi przypisane zadanie na swojej liście. Po odebraniu A3 dostępu do spotkania zadanie znika z jego listy i z Przeglądu. PM nadal widzi je w swoim widoku. Po ponownym nadaniu dostępu A3 widzi zadanie ponownie.
3. Na koncie osoby przypisanej usuń pojedyncze wcześniejsze zadanie w zakładce „Zadania”. W oddzielnej próbie sprawdź usuwanie przez PM oraz brak operacji u pozostałych osób. Sprawdź, że zniknęło u wykonawcy, w szczegółach i w raporcie. Nowsze zadanie z kolejnego spotkania powinno pozostać widoczne.

Próba sprawdza zrozumiałość interfejsu na danych demonstracyjnych. Integrację z Element, logowanie, reguły serwera i retencję potwierdzają oddzielne kryteria wdrożeniowe.

## Karta decyzji po teście

| Data i tester | Dosłowna obserwacja lub cytat | Wzorzec czy pojedyncza obserwacja | Decyzja i powód | Ekran lub kryterium |
| --- | --- | --- | --- | --- |
| Tester 1 |  |  |  |  |
| Tester 2 |  |  |  |  |

Wzorzec zapisujemy, gdy co najmniej dwie niezależnie testujące osoby napotkają tę samą trudność. W decyzji wskazujemy zmianę zakresu, zmianę wyglądu albo odrzucenie i podajemy powód. Zmianę w [SPEC.md](SPEC.md) oznaczamy identyfikatorem osoby testującej.

## Weryfikacja techniczna prototypu

22 listopada 2026 r. test logiki JavaScript na fikcyjnych danych przeszedł dla Przeglądu, kolejki inicjatora, zatwierdzania i porzucania szkicu, przypisywania zadań, pustej sekcji, zachowania długiego tekstu oraz widoczności wyniku dla różnych kont. Test używał atrapy DOM. Wygląd na telefonie i zrozumiałość ścieżki są do sprawdzenia w przeglądarce podczas sesji z uczestnikami.

Po zmianach T2 ponownie uruchomiono test logiki JavaScript z atrapą DOM. Przeszły scenariusze potwierdzenia i anulowania usuwania, braku uprawnienia u osoby spoza listy obecności, usunięcia zadania we wszystkich profilach i raporcie, zachowania nowszego zadania, widoku inicjatora i ponownego wczytania zapisanego stanu.

Po doprecyzowaniu DEC-13 test logiki potwierdził usuwanie przez PM i wykonawcę, brak tej akcji u innych osób, ukrycie zadań po odebraniu dostępu oraz blokadę potwierdzenia usunięcia po utracie dostępu. Przywrócenie dostępu ponownie pokazuje zadania, których nie usunięto.
