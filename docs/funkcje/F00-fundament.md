# F00 · Fundament i zabezpieczenia

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — tworzy środowisko pracy z danymi P2, testami dostępu i konfiguracją usług zewnętrznych.
**Zależy od:** — · **Źródło:** sekcje 7–9 specyfikacji.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 6–9 i 13 · `README.md`.

## Cel

Przygotować bezpieczną, lokalną podstawę Meetly na danych demonstracyjnych, aby kolejne karty mogły być budowane i sprawdzane bez dostępu do prawdziwych spotkań lub sekretów.

## Zachowanie

1. Aplikacja uruchamia się lokalnie zgodnie z planem Fazy A.
2. Dane startowe tworzą fikcyjne konta: PM A, Dyrektor A, Programista A, Programista B i Analityk A oraz fikcyjne wyniki spotkań i zadania niezbędne do testów dostępu.
3. Konfiguracja programistyczna korzysta z nazw zmiennych w `.env.example`; wartości trafiają wyłącznie do lokalnego `.env`.
4. Testy uruchamiają się jednym poleceniem i nie wywołują płatnej transkrypcji ani AI.

## Dane

Przygotowuje kształt danych Konta z powiązaniem Matrix, importowanego Spotkania z listą obecności i dostępu, przejściowej transkrypcji, Wyniku spotkania, Zadania i Zmiany zadania z sekcji 6. Dane startowe są całkowicie fikcyjne. F00 nie przyjmuje audio ani prawdziwych danych.

## Kryteria akceptacji

- F00-KA1 [ręcznie]: Gdy właściciel wykonuje kroki z README na czystym środowisku, to widzi działającą aplikację i ekran gotowy na kolejne karty.
- F00-KA2 [test]: Gdy test korzysta z fikcyjnych kont Programista A oraz Programista B, to żadne żądanie danych konta A nie zwraca danych konta B bez właściwego uprawnienia.
- F00-KA3 [test, ręcznie]: Gdy w projekcie istnieje `.env` z wartością testową, to plik nie jest wskazany do commita, a `.env.example` zawiera wyłącznie nazwy zmiennych bez wartości.
- F00-KA4 [test]: Gdy uruchamiane są testy, to używane są atrapy usług zewnętrznych i nie powstaje połączenie z płatną usługą AI ani transkrypcji.
- F00-KA5 [ręcznie]: Gdy konfiguracja usługi jest nieobecna, to aplikacja pokazuje ogólny komunikat konfiguracyjny bez nazwy sekretu, jego wartości ani danych konta.

## Przypadki brzegowe i błędy

- Brak wymaganej lokalnej konfiguracji: aplikacja nie uruchamia przetwarzania i wskazuje krok z README; nie ujawnia wartości zmiennych.
- Nieudane załadowanie danych demonstracyjnych: aplikacja nie oznacza danych jako gotowych, a README opisuje bezpieczne ponowienie operacji.
- Błąd testu usług zewnętrznych: test kończy się błędem zamiast przełączyć się na prawdziwą usługę.

## Ochrona danych

Poziom P2. Agent nie odczytuje ani nie zmienia `.env` i nie używa produkcyjnych kont. F00 ustanawia blokady odczytu sekretów i folderu na ewentualne prawdziwe pliki właściciela zgodnie z decyzjami Fazy A.

## Poza zakresem tej karty

- Logowanie użytkownika, integracja z botem, AI i ekran wyników.
- Tworzenie kont z prawdziwymi danymi.

## Jak sprawdzić ręcznie

1. Uruchom aplikację oraz testy według README.
2. Sprawdź, że widoczne dane są oznaczone jako demonstracyjne.
3. Sprawdź stan Git: `.env` nie może znaleźć się wśród plików do commita.
