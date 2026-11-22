# Meetly — raport z testu symulowanego

- **Data:** 22 listopada 2026 r.
- **Przebieg:** Tester nr 2 był symulowanym testerem. Źródłem obserwacji jest raport przekazany przez autorkę projektu.
- **Wersja testowa:** `meetly_prototyp.html`, uruchomiony lokalnie w odizolowanym środowisku Chromium według raportu. Plik w repozytorium nosi nazwę [meetly-prototyp.html](meetly-prototyp.html).
- **Zakres:** ścieżka importu i zatwierdzania, widoki kont demonstracyjnych, obsługa długich zadań i pustych sekcji oraz operacje na lokalnym stanie.

## Wynik scenariusza

| Scenariusz | Wynik podany w raporcie |
| --- | --- |
| Programista A (A1) otwiera szkic „Uruchomienie miejskiej usługi dostaw” i zmienia podsumowanie. | Zaliczone. |
| A1 dopisuje „Sprawdzone w teście” do długiego zadania, przypisuje je Analitykowi A (A3) i zatwierdza spotkanie. | Zaliczone. Cały tekst zadania został zachowany. |
| Po przełączeniu z A1 na A3 zmienione zadanie jest widoczne w zakładce „Zadania”. | Zaliczone w tej samej przeglądarce. |
| A3 zatwierdza „Przegląd gotowości pilotażu dostaw”, gdy brak tematów do wyjaśnienia. | Zaliczone. Pusta sekcja jest ukryta, a pozostała treść jest widoczna. |
| Po ponownym otwarciu prototypu dane są dostępne. | Częściowo zweryfikowane. Raport opisuje częściową symulację zapisu w przeglądarce. |

## Obserwacje z pierwszej symulacji i stan po poprawkach

Symulacja odbyła się przed zmianami T2. Aktualne zasady opisują [SPEC.md](SPEC.md) i [karta F04](docs/funkcje/F04-widoki-wedlug-roli.md).

| ID | Obserwacja w testowanej wersji | Stan aktualnego prototypu |
| --- | --- | --- |
| T2-01 | Osoba z dostępem do spotkania mogła usunąć je dla wszystkich. Tester wskazał ryzyko przypadkowego usunięcia. | Spotkanie może usunąć uczestnik z aktualnym dostępem, po potwierdzeniu. Ponowny import zachowanego nagrania po przypadkowym usunięciu jest opisany w specyfikacji integracji. |
| T2-02 | Po odebraniu dostępu do spotkania przypisane zadanie było nadal widoczne. | Utrata dostępu ukrywa zadania ze spotkania dla tej osoby. PM lub wykonawca z aktualnym dostępem może usunąć pojedyncze zadanie dla wszystkich. Nowsze zadanie z kolejnego spotkania pozostaje osobnym rekordem. |
| T2-03 | Inicjator po zatwierdzeniu nie widział zadania przekazanego innej osobie w szczegółach. | Inicjator z dostępem widzi wszystkie zadania w szczegółach własnego spotkania. Na swojej liście widzi przypisane mu zadania. |
| T2-04 | Stan zapisywał się w `localStorage`. Przełączanie kont demonstracyjnych działało w tej samej przeglądarce. | Zapis lokalny pozostaje cechą prototypu HTML. Synchronizacja i rzeczywista autoryzacja należą do docelowej aplikacji. |

## Wniosek

Główna ścieżka została zaliczona w symulacji. Po zmianie zasad T2-01 do T2-03 sprawdzono logikę w JavaScript z atrapą DOM. Przypadki i wyniki są w [planie testu](plan-testu-element.md#weryfikacja-techniczna-prototypu).

Przebieg nie potwierdza działania integracji z Element i AI, autoryzacji po stronie serwera, synchronizacji między urządzeniami ani użyteczności dla niezależnych użytkowników. [Plan testu z użytkownikami](plan-testu-element.md) pozostaje osobnym punktem weryfikacji.
