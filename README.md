# Meetly

Meetly pomaga małemu zespołowi programistycznemu zamieniać ustalenia ze spotkań w Element w podsumowania i przypisane zadania.

## Wypróbuj

1. Po otwarciu prototypu zobaczysz **Przegląd** na koncie **PM A**. W zakładce **Spotkania** są dwa zatwierdzone spotkania o nowej bazie klientów: „Wymagania i wygląd ekranów” oraz „Struktura tabel i migracja”. Ich osiem zadań jest dostępnych w zakładce **Zadania**.
2. W zakładce **Import z Element** otwórz „Nowa baza klientów — plan odbioru”. Zmień treść lub przypisanie jednego z trzech zadań i kliknij **Zatwierdź wynik**. Przełącz konto na wybranego wykonawcę i sprawdź jego listę **Zadania**.
3. Na koncie **Programista A (A1)** możesz też zatwierdzić szkic „Uruchomienie miejskiej usługi dostaw”.

Prototyp używa fikcyjnych danych i symuluje import z Element, AI oraz konta użytkowników. Zmiany zapisują się lokalnie w przeglądarce, jeśli pozwala na to jej konfiguracja.

## Główna ścieżka

Inicjator rozpoczyna nagranie w Element. Po spotkaniu bot przekazuje transkrypcję i listę uczestników do Meetly. Inicjator poprawia szkic i zatwierdza wynik. Osoby z dostępem mogą wrócić do ustaleń i przypisanych zadań.

## Stan funkcji

| ID | Funkcja | Priorytet | Status | Weryfikacja |
| --- | --- | --- | --- | --- |
| F00 | Fundament i zabezpieczenia | MVP-1 | Do zrobienia | Faza C |
| F01 | Logowanie i role zespołu | MVP-1 | Do zrobienia | Faza C |
| F02 | Import spotkania z Element | MVP-1 | Do zrobienia | Faza C |
| F03 | Wynik spotkania proponowany przez AI | MVP-1 | Do zrobienia | Faza C |
| F04 | Widoki wyników zależne od roli | MVP-1 | Do zrobienia | Faza C |
| F05 | Historia zadań i raport tygodniowy | MVP-1 | Do zrobienia | Faza C |

## Zmiany względem specyfikacji

Zmiany po symulacji dotyczą tego, kto może usuwać spotkania i zadania oraz kiedy zadania są widoczne dla uczestników. Uwzględniają je decyzje DEC-11–DEC-13 w specyfikacji.

## Znane ograniczenia

Prototyp demonstruje interfejs na fikcyjnych danych. Integracje, logowanie i współdzielony zapis należą do MVP. Ścieżka z Element czeka na niezależny test z użytkownikami. Plan techniczny powstanie w Fazie A.

## Bezpieczeństwo i dane

- Poziom ochrony danych — P2.
- Sprawdzenia wymagane przed użyciem prawdziwych danych opisuje sekcja 7 specyfikacji. Etap pozostaje otwarty.
- Weryfikacja całego MVP odbędzie się w Fazie C.

## Jak uruchomić lokalnie

Otwórz plik `meetly-prototyp.html` w przeglądarce. Instrukcja uruchomienia aplikacji i testów powstanie przy karcie F00.

## Dokumentacja

- [Specyfikacja MVP](docs/specyfikacja.md) i [karty funkcji](docs/funkcje/).
- [Kierunek wizualny](DESIGN.md) i [transkrypcje demonstracyjne](transkrypcje-demo.md).
- [Wnioski z testów](docs/wnioski-z-testow.md), [raport z symulacji](raport-testu-symulowanego.md) i [plan testu](plan-testu-element.md).
