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

## Testy Meetly z 26 listopada 2026

W próbie wzięło udział dwóch testerów. Korzystali z opublikowanego demonstratora i fikcyjnych danych. Import, nagrywanie, transkrypcja i odpowiedzi AI były symulowane.

| Tester | Co zadziałało | Gdzie pojawiły się trudności |
|---|---|---|
| Tester 1 | Zalogował się jako PM, otworzył import i szczegóły notatek, ponownie otworzył zamknięte zadanie, przypisał dodatkowe osoby i otrzymał szczegóły po symulacji nagrania. Dwa przykłady przeszedł samodzielnie, trzeci z podpowiedzią. | Przy dacie szukał osobnego zatwierdzenia. Zapis na dole zadziałał. Szukał transkrypcji. Znaczenie zamknięcia zadania i komunikatu błędu AI było niejasne. Szukał akcji dodania zadania w szczegółach i zgłosił, że nowa pozycja miała stan „zamknięte”. Nie wiedział, czy zadanie zapisuje się od razu. Po pominięciu wykonawcy nie zobaczył komunikatu. Zwrócił uwagę na kolejność i brak dat pomagających rozpoznać nowsze pozycje. |
| Tester 2 | Zalogował się, zapisał dane i przeszedł ścieżkę do końca. | Zgłosił nieklikalny link. Przeznaczenie sekcji „Zadania” i zasady dostępu do spotkania wymagały wyjaśnienia. Zapis listy dostępu przeniósł go na inną stronę, a tester nie zauważył potwierdzenia. W jednym widoku widział jedynie „Usuń”. Miejsce wymaga ustalenia. |

### Rzeczy do poprawy

1. **Najpierw F03 · Zatwierdzanie szkicu.** Zapobiec niezamierzonemu przeniesieniu zadania do tematów do wyjaśnienia. Pokazać moment zapisu i wymagać jawnego wyboru przy każdej pozycji. Scenariusz ręczny na fikcyjnych danych: dodać zadanie, spróbować zatwierdzić bez wyboru, odczytać komunikat, wybrać wykonawcę i ponowić. W osobnym szkicu wybrać przeniesienie i sprawdzić treść w tematach do wyjaśnienia.
2. **Następnie F04 · Lista dostępu.** Odtworzyć nieklikalny link i widok z samym „Usuń”. Sprawdzić, gdzie pojawia się istniejący komunikat o zapisie dostępu, i zweryfikować zachowanie, gdy zapis odbiera osobie dostęp do szczegółów.
3. **Potem F05 · Czytelność zadań.** Odtworzyć stan nowej pozycji, rozróżniając zadanie ze szkicu od ręcznie dodawanego wykonanego zadania PM. Sprawdzić etykiety stanu oraz możliwość pokazania dat i kolejności. Dodawanie zadań do zatwierdzonego spotkania z jego szczegółów wymaga decyzji produktowej. Pełny podgląd transkrypcji wymaga uzgodnienia z zasadami dostępu i retencji. W F03 pozostaje sprawdzenie, gdzie tester zobaczył samą etykietę błędu AI, skoro widok nieudanego szkicu już pokazuje akcję ponowienia.

### Weryfikacja techniczna

| Sprawdzenie | Wynik |
|---|---|
| Logowanie na opublikowanej stronie po poprawce F01 | Zaliczone. Po zalogowaniu fikcyjne konto PM otworzyło Przegląd z właściwą rolą i zakładką Raport tygodniowy. |
| `npm test` w lokalnej wersji po poprawce F03 | 15 zaliczonych, 0 nieudanych. Zestaw obejmuje logowanie i role, izolację kont, zakres dostępu do szkiców i zadań, jednorazowy zapis wyniku oraz jawny wybór sposobu obsłużenia każdego zadania. |
| `npm run typecheck` | Zaliczone. |

Powtórzenie ręczne ścieżki F03 po poprawce oraz sprawdzenie zgłoszeń F04 i F05 pozostają otwarte. Rzeczywista integracja z Element, transkrypcją i AI oraz pełna weryfikacja MVP wymagają osobnych prób.
