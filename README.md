# Meetly · Specyfikacja MVP · M2/P1

Meetly pomaga zespołowi zamienić ustalenia ze spotkań w Element w podsumowania i przypisane zadania.

**Dokument do oceny:** [SPEC.md — specyfikacja MVP](SPEC.md)

| Materiał | Co zawiera |
| --- | --- |
| [Prototyp HTML](meetly-prototyp.html) | Demonstrację od importu szkicu do odczytu przypisanego zadania. |
| [Transkrypcje demonstracyjne](transkrypcje-demo.md) | Dwa fikcyjne spotkania o module zamówień wewnętrznych i jakości funkcji SQL. |
| [Raport z testu symulowanego](raport-testu-symulowanego.md) | Wyniki pierwszej symulacji i zasady przyjęte po zgłoszeniach T2. |
| [Plan testu i weryfikacja techniczna](plan-testu-element.md) | Scenariusze oraz wyniki sprawdzenia logiki po poprawkach. Aktualna ścieżka czeka na niezależne testy z użytkownikami. |
| [Kierunek wizualny](DESIGN.md) i [specyfikacja techniczna](docs/specyfikacja.md) | Uzupełnienie specyfikacji MVP. |

## Jak uruchomić prototyp

1. [Pobierz ZIP](https://github.com/k-olejnik/VibeCodingMeetly/archive/refs/heads/main.zip), rozpakuj i otwórz plik `meetly-prototyp.html` w przeglądarce.
2. Wybierz **Programista A (A1)**, przejdź do **Import z Element** i kliknij **Sprawdź szkic** przy spotkaniu „Uruchomienie miejskiej usługi dostaw”.
3. Przypisz jedno zadanie do **Analityka A (A3)** i kliknij **Zatwierdź wynik**. Przełącz konto na A3 i sprawdź zadanie w zakładce **Zadania**.
4. Wróć na konto **Programista A (A1)**. W **Imporcie z Element** otwórz „Uruchomienie prac nad modułem zamówień wewnętrznych” i „Poprawa jakości funkcji naliczania opłat”. Po zatwierdzeniu obu szkiców osiem zadań pojawi się na listach przypisanych osób. Na koncie **Programista B (A7)** sprawdź trzy nowe zadania, a na koncie **PM A** wszystkie osiem.

Prototyp używa fikcyjnych danych i symuluje import z Element, AI oraz konta użytkowników. Zmiany zapisują się lokalnie w przeglądarce, jeśli pozwala na to jej konfiguracja.
