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

## Obserwacje i decyzje

Zachowania porównano z [aktualną specyfikacją](SPEC.md) i [kartą F04](docs/funkcje/F04-widoki-wedlug-roli.md). Zgłoszony priorytet odzwierciedla ocenę w raporcie testera. Decyzje produktowe pozostają po stronie autorki.

| ID | Co zaobserwowano | Ocena względem bieżących wymagań | Dalsza decyzja |
| --- | --- | --- | --- |
| T2-01 | A3 z dostępem do spotkania może usunąć spotkanie prowadzone przez A1. Wynik i zadania znikają dla wszystkich kont w lokalnym prototypie. Tester ocenił to jako krytyczne. | Zachowanie zgodne z DEC-11 i F04-KA8. Każdy, kto widzi zatwierdzone spotkanie, ma prawo usunąć je dla wszystkich. Ostrzeżenie pokazuje skutek operacji. | Ryzyko przypadkowego usunięcia. Ewentualne ograniczenie do prowadzącego lub wybranych ról wymaga zmiany DEC-11. |
| T2-02 | Gdy A3 traci dostęp do spotkania, przypisane mu zadanie pozostaje w zakładce „Zadania”. Tester ocenił to jako krytyczne. | Zachowanie zgodne z regułami F04. Dostęp do własnego zadania wynika z przypisania, a dostęp do wyniku spotkania z listy lub roli. Bez dostępu do spotkania API ma pominąć tytuł i odnośnik do źródła. Prototyp pokazuje treść, osobę odpowiedzialną i stan zadania, bez tytułu spotkania ani odnośnika. | Doprecyzować przed wdrożeniem, czy przy odebraniu dostępu autorka chce też cofać przypisania. Treść zadania może sama zawierać kontekst spotkania. |
| T2-03 | A1 po zatwierdzeniu nie widzi zadania przekazanego A3 w szczegółach. Tester ocenił to jako problem UX o średnim priorytecie. | Zachowanie zgodne z US5/K2 i N1. Programista i analityk widzą własne zadania, a PM i dyrektor widzą wszystkie. | Propozycja UX do decyzji. Pełna lista w szczegółach dla prowadzącego wymaga wyjątku od N1. Zakładka „Zadania” może nadal pokazywać wyłącznie własne pozycje. |
| T2-04 | Dane zapisują się w `localStorage`. Przełączenie konta demonstracyjnego działa w obrębie tej samej przeglądarki. | Ograniczenie prototypu HTML. Synchronizacja i rzeczywista autoryzacja są częścią docelowej aplikacji. | Doprecyzowano informację dla osoby otwierającej prototyp w README. |

## Wniosek

Główny scenariusz został zaliczony w symulacji. Raport wzmacnia potrzebę świadomej decyzji o uprawnieniach do usuwania i widoku zadań prowadzącego. Zachowania opisane w T2-01–T2-03 odpowiadają obecnym wymaganiom. Po zatwierdzeniu ewentualnej zmiany zasad trzeba zaktualizować specyfikację i powtórzyć powiązany scenariusz.

Przebieg nie potwierdza działania integracji z Element i AI, autoryzacji po stronie serwera, synchronizacji między urządzeniami ani użyteczności dla niezależnych użytkowników. [Plan testu z użytkownikami](plan-testu-element.md) pozostaje osobnym punktem weryfikacji.
