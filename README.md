# Meetly

Meetly pomaga małemu zespołowi programistycznemu zamieniać ustalenia ze spotkań w Element w podsumowania i przypisane zadania.

## Wypróbuj

- [Otwórz działające Meetly Demo](https://meetly-demo-testy.kkszczak.chatgpt.site/). Do logowania użyj fikcyjnego konta przekazanego przez właściciela.
- W **Przeglądzie** sekcja **Najnowsze zadania** pokazuje zadania z pięciu ostatnich spotkań. Nazwa otwiera wynik spotkania, a data jest po prawej. Sekcja **Po terminie** zbiera otwarte zaległości także ze starszych spotkań.
- W zatwierdzonym spotkaniu PM z dostępem może dodać otwarte zadanie oraz edytować treść, wykonawcę i termin. Pokaz używa fikcyjnych danych oraz symulacji Element i AI.

1. Po otwarciu prototypu zobaczysz **Przegląd** na koncie **PM A**. W zakładce **Spotkania** są dwa zatwierdzone spotkania o nowej bazie klientów: „Wymagania i wygląd ekranów” oraz „Struktura tabel i migracja”. Ich osiem zadań jest dostępnych w zakładce **Zadania**.
2. W zakładce **Import z Element** otwórz „Nowa baza klientów — plan odbioru”. Zmień treść lub przypisanie jednego z trzech zadań i kliknij **Zatwierdź wynik**. Przełącz konto na wybranego wykonawcę i sprawdź jego listę **Zadania**.
3. Na koncie **Programista A (A1)** możesz też zatwierdzić szkic „Uruchomienie miejskiej usługi dostaw”.

Prototyp używa fikcyjnych danych i symuluje import z Element, AI oraz konta użytkowników. Zmiany zapisują się lokalnie w przeglądarce, jeśli pozwala na to jej konfiguracja.

## Główna ścieżka

Inicjator rozpoczyna nagranie w Element. Po spotkaniu bot przekazuje transkrypcję i listę uczestników do Meetly. Inicjator poprawia szkic i zatwierdza wynik. Osoby z dostępem mogą wrócić do ustaleń i przypisanych zadań.

## Stan funkcji

| ID | Funkcja | Priorytet | Status | Weryfikacja |
| --- | --- | --- | --- | --- |
| F00 | Fundament i zabezpieczenia | MVP-1 | Działa w demo | Testy HTTP i PostgreSQL |
| F01 | Logowanie i role zespołu | MVP-1 | Działa w demo | Testy ról i przejścia do Przeglądu |
| F02 | Import spotkania z Element | MVP-1 | Symulacja w demo | Fikcyjne importy i ponowienie |
| F03 | Wynik spotkania proponowany przez AI | MVP-1 | Symulacja AI w demo | Edycja szkicu i jednokrotne zatwierdzenie |
| F04 | Widoki wyników zależne od roli | MVP-1 | Działa w demo | Najnowsze zadania, zaległości i edycja zadań po zatwierdzeniu |
| F05 | Historia zadań i raport tygodniowy | MVP-1 | Działa w demo | Zmiany stanu oraz raport tygodniowy |

## Zmiany względem specyfikacji

Zmiany po symulacji dotyczą tego, kto może usuwać spotkania i zadania oraz kiedy zadania są widoczne dla uczestników. Uwzględniają je decyzje DEC-11–DEC-13 w specyfikacji.

## Znane ograniczenia

Prototyp demonstruje interfejs na fikcyjnych danych. Integracje, logowanie i współdzielony zapis należą do MVP. Ścieżka z Element czeka na niezależny test z użytkownikami. Plan techniczny powstanie w Fazie A.

## Bezpieczeństwo i dane

- Poziom ochrony danych — P2.
- Sprawdzenia wymagane przed użyciem prawdziwych danych opisuje sekcja 7 specyfikacji. Etap pozostaje otwarty.
- Weryfikacja całego MVP odbędzie się w Fazie C.

## Jak uruchomić lokalnie

Starszy prototyp można otworzyć z pliku [meetly-prototyp.html](meetly-prototyp.html).

1. Użyj Node.js 24 i uruchom `npm ci`.
2. Uruchom `npm test` i `npm run typecheck`. Testy HTTP i PostgreSQL w pamięci używają danych fikcyjnych.
3. Zbuduj hostowany demonstrator poleceniem `node deploy/meetly-demo/build.mjs`. Kod serwera i interfejsu jest w [deploy/meetly-demo](deploy/meetly-demo).
4. Do lokalnej próby z logowaniem przygotuj osobny projekt Supabase, ustaw w nim zatwierdzone fikcyjne konta i powiąż je z profilami. Zastosuj [migrację](supabase/migrations/20261124000100_foundation.sql), [dane startowe](supabase/seed.sql), [dane z prototypu](supabase/demo/prototype-data.sql), [podgląd lokalny](supabase/demo/overview.sql) i [akcje demonstratora](supabase/demo/interactive.sql). Skopiuj [szablon konfiguracji](.env.example) do lokalnego `.env`, uzupełnij go i uruchom `npm start`.

## Dokumentacja

- [Specyfikacja MVP](docs/specyfikacja.md) i [karty funkcji](docs/funkcje/).
- [Kierunek wizualny](DESIGN.md) i [transkrypcje demonstracyjne](transkrypcje-demo.md).
- [Wnioski z testów](docs/wnioski-z-testow.md), [raport z symulacji](raport-testu-symulowanego.md) i [plan testu](plan-testu-element.md).
