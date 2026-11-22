# F01 · Logowanie i role zespołu

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki — wprowadza konta, role oraz reguły dostępu do danych P2.
**Zależy od:** F00 · **Źródło:** DEC-3, DEC-4, DEC-5, DEC-8.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 4, 6, 7 i 10 · `docs/funkcje/F00-fundament.md`.

## Cel

Zalogowany członek jednego zespołu rozpoznaje swoją rolę w Meetly, a aplikacja ogranicza dane do zakresu tej roli.

## Zachowanie

1. Osoba otwiera E1 i loguje się przez usługę wybraną w Fazie A.
2. Po pomyślnym logowaniu aplikacja odczytuje rolę przypisaną do konta przez właściciela projektu i przechodzi na E2.
3. Każda z czterech ról może być prowadzącym importowanego spotkania. Dostęp do szkicu wymaga zweryfikowanego powiązania prowadzącego z kontem Meetly.
4. Ekran zarządzania rolami nie istnieje w MVP; zwykły użytkownik nie może zmienić swojej roli.

## Dane

Czyta Konto: imię wyświetlane, e-mail, rola i powiązanie z kontem Matrix. Tożsamość i rola pochodzą z bezpiecznej sesji logowania, nigdy z pola formularza ani adresu URL. F01 nie pokazuje e-maili w wynikach spotkań.

## Kryteria akceptacji

- F01-KA1 [test, ręcznie]: Gdy fikcyjne konto PM A, Dyrektor A, Programista A lub Analityk A loguje się poprawnie, to trafia na E2 przypisany do jego roli.
- F01-KA2 [test]: Gdy niezalogowana osoba otwiera ekran wymagający konta, to nie otrzymuje żadnych danych i wraca do E1.
- F01-KA3 [test]: Gdy Programista A próbuje zgłosić rolę PM przez adres lub zmienione dane przeglądarki, to baza albo serwer odrzuca żądanie uprzywilejowanych danych.
- F01-KA4 [test]: Gdy konto Programista A próbuje odczytać Konto Programista B wraz z jego danymi logowania, to żądanie jest odrzucone albo zwraca wyłącznie dane dozwolone przez reguły dostępu.
- F01-KA5 [ręcznie]: Gdy import wskazuje zweryfikowane konto prowadzącego dowolnej z czterech ról, osoba ta może otworzyć swój szkic w E5.

## Przypadki brzegowe i błędy

- Nieudane logowanie: użytkownik widzi prosty komunikat bez podawania, czy konkretny e-mail ma konto.
- Konto bez przypisanej roli: nie otrzymuje dostępu do danych spotkań; właściciel projektu widzi potrzebę uzupełnienia roli poza aplikacją.
- Wygaśnięcie sesji: aplikacja wraca do E1 i nie pokazuje wcześniej pobranych danych.

## Ochrona danych

Poziom P2. Testy obejmują co najmniej dwa konta tej samej roli. E-mail i identyfikator konta nie pojawiają się w adresach URL, logach ani komunikatach błędów.

## Poza zakresem tej karty

- Rejestracja użytkownika, odzyskiwanie hasła i interfejs zmiany ról.
- Widoki wyników po spotkaniach (F04).

## Jak sprawdzić ręcznie

1. Zaloguj się kolejno fikcyjnym kontem PM A i Programista A.
2. Sprawdź, że oba konta widzą możliwość rozpoczęcia spotkania.
3. Spróbuj otworzyć ekran danych bez logowania i po wylogowaniu.
