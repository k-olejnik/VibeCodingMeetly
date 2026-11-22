# F02 · Import spotkania z Element

**Status:** do zrobienia · **Priorytet:** MVP-1 · **Złożoność:** wysoka → poziom Wysoki.
**Zależy od:** F01 · **Źródło:** DEC-2, DEC-5, DEC-6, N3, N5.

## Do przeczytania

`AGENTS.md` · `docs/specyfikacja.md`: sekcje 3–8 i 12.

## Zachowanie

1. Prowadzący informuje uczestników o przetwarzaniu, sprawdza obecność kompletu w Element i mówi „bot start”.
2. Bot zapisuje listę faktycznie połączonych kont i rozpoczyna nagrywanie. „Bot stop” albo zakończenie rozmowy zatrzymuje nagrywanie.
3. Nagranie pozostaje na chronionym dysku z automatycznym usuwaniem po 30 dniach. Po transkrypcji bot przekazuje Meetly tekst i metadane, w tym identyfikator spotkania, prowadzącego i listę kont ze startu.
4. Serwer Meetly uwierzytelnia import, sprawdza dane i wiąże konta Matrix z kontami Meetly. Poprawny import uruchamia przygotowanie szkicu w F03.

## Kryteria akceptacji

- F02-KA1 [test, ręcznie]: Przed „bot start” nagranie nie powstaje. Przy starcie lista obejmuje wyłącznie połączone konta uczestników, bez konta bota.
- F02-KA2 [test, ręcznie]: „Bot stop” i zakończenie rozmowy zatrzymują nagrywanie w oddzielnych scenariuszach.
- F02-KA3 [test]: Meetly przyjmuje transkrypcję i metadane z uwierzytelnionego źródła. Ponowienie tego samego importu nie tworzy drugiego spotkania.
- F02-KA4 [test]: Brak mapowania uczestnika nie nadaje dostępu według samej nazwy wyświetlanej. Brak zweryfikowanego prowadzącego blokuje udostępnienie szkicu.
- F02-KA5 [test]: Nagranie jest dostępne wyłącznie w chronionym magazynie integracji i usuwane automatycznie po 30 dniach. Meetly usuwa roboczą transkrypcję zgodnie z N5.
- F02-KA6 [test]: Niekompletny lub nieuwierzytelniony import nie udostępnia wyniku ani danych uczestników.

## Ochrona danych

Poziom P2. Dane wejściowe, mechanizm powiązania prowadzącego, dostęp bota do rozmowy i działanie retencji wymagają weryfikacji w Fazie A. Testy używają fikcyjnych kont, nagrań i transkrypcji. Zasady dostępu do zatwierdzonego wyniku opisuje F04.

## Jak sprawdzić ręcznie

Na fikcyjnym spotkaniu sprawdź start, oba sposoby zatrzymania i import. Porównaj przekazaną listę z połączonymi kontami w chwili startu i powtórz dostarczenie tej samej transkrypcji.
