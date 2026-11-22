# Wnioski z testów prototypu Meetly

## Obserwacje

- W symulacji T2 zmienione zadanie po zatwierdzeniu spotkania było widoczne na koncie nowego wykonawcy. Dane obu kont demonstracyjnych działały w tej samej przeglądarce.
- W pierwszej wersji symulacji osoba z dostępem mogła usunąć spotkanie dla wszystkich. Po odebraniu dostępu przypisane zadanie nadal było widoczne.
- Inicjator nie widział wszystkich zadań ze swojego zatwierdzonego spotkania, gdy zostały przypisane innym osobom.

## Wnioski i decyzje

- DEC-11 ogranicza usuwanie spotkania do uczestnika z aktualnym dostępem i wymaga potwierdzenia.
- DEC-12 pozwala inicjatorowi z dostępem zobaczyć wszystkie zadania we własnym spotkaniu.
- DEC-13 uzależnia widoczność zadań od dostępu do spotkania. Pojedyncze zadanie może usunąć PM lub jego wykonawca z aktualnym dostępem.

Szczegóły zawiera [raport z symulacji T2](../raport-testu-symulowanego.md), a sprawdzenia po poprawkach opisuje [plan testu](../plan-testu-element.md#weryfikacja-techniczna-prototypu). Ścieżka z Element czeka na niezależny test z użytkownikami.
