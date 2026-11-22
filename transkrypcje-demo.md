# Transkrypcje demonstracyjne Meetly

Dwa fikcyjne spotkania zespołu programistycznego. Zapisy stanowią materiał źródłowy dla przykładowych szkiców w prototypie. Każdy zapis zaczyna się od komendy uruchamiającej nagranie. Inicjator wcześniej potwierdził pełny skład i poinformował uczestników o nagrywaniu.

## Uruchomienie prac nad modułem zamówień wewnętrznych

**Uczestnicy przy starcie:** Programista A (A1, inicjator), Analityk A (A3), Programista B (A7), PM A.

| Czas | Osoba | Wypowiedź |
| --- | --- | --- |
| 00:00 | A1 | Bot start. Mamy ustalić zakres pierwszej wersji modułu zamówień wewnętrznych. Obecnie zgłoszenia sprzętu i materiałów wpadają na czat albo w arkusz i trudno sprawdzić, co już obsłużono. |
| 00:26 | A3 | Wystarczy formularz z nazwą, ilością i uzasadnieniem oraz lista zgłoszeń. Potrzebujemy trzech stanów: „Nowe”, „W realizacji”, „Zamknięte”. Wezmę opis pól i kryteria akceptacji dla utworzenia zgłoszenia, błędnych danych i zmiany statusu. |
| 00:55 | A1 | Zgoda. Przygotuję formularz z walidacją wymaganych pól i listę z filtrem po statusie. Dorzucę widok pustej listy, żeby było jasne, co zrobić przy pierwszym wejściu. |
| 01:23 | A7 | Ja przygotuję zapis w bazie i API do dodawania zgłoszeń, pobierania listy oraz zmiany statusu. Dodam test, że ilość równa zero jest odrzucana. |
| 01:48 | PM A | Na pierwszy sprint bierzemy formularz, listę i zmianę statusu. Powiadomienia e-mail przesuwamy na później. Przygotuję pięć fikcyjnych zgłoszeń i zorganizuję ich wspólny przegląd na koniec sprintu. |
| 02:16 | A3 | Zostało pytanie, czy zamknięte zgłoszenie da się ponownie otworzyć, czy trzeba złożyć nowe. Zapiszmy to do wyjaśnienia z działem operacyjnym. |
| 02:35 | A1 | Tak, rozstrzygniemy to przed następnym etapem. Bot stop. |

## Poprawa jakości funkcji naliczania opłat

**Uczestnicy przy starcie:** Programista A (A1, inicjator), Analityk A (A3), Programista B (A7).

| Czas | Osoba | Wypowiedź |
| --- | --- | --- |
| 00:00 | A1 | Bot start. Wracamy do funkcji SQL naliczającej opłaty. Sprawdza dane, wybiera stawkę i zaokrągla wynik w jednym bloku. Chcemy uprościć kod, zachowując wyniki, na których opierają się obecni klienci funkcji. |
| 00:30 | A3 | Przed zmianą rozpiszę oczekiwane wyniki dla brakującej stawki, zerowej podstawy i kwoty dokładnie na progu. Użyję fikcyjnych pozycji i dopiszę, skąd wziął się każdy oczekiwany wynik. |
| 01:02 | A7 | Na tych przypadkach zrobię test regresji. Dorzucę zestaw 50 fikcyjnych pozycji i porównam wyliczenia starej i nowej wersji w środowisku testowym. Każdą rozbieżność zapiszę do przeglądu. |
| 01:31 | A1 | Zajmę się wydzieleniem walidacji, wyboru stawki i obliczenia opłaty. Sygnatura funkcji i zaokrąglanie zostają takie jak teraz. Zmiana może trafić do przeglądu po przejściu testów regresji. |
| 01:56 | A7 | Sprawdzę też plan wykonania obu wersji dla tej samej paczki danych. Do przeglądu dołączę czasy i opis ewentualnej zmiany w odczytach. |
| 02:18 | A3 | Z mojej strony wszystko jasne. |
| 02:24 | A1 | Dzięki, kończymy spotkanie. |

Nagranie drugiego spotkania kończy się wraz z rozłączeniem rozmowy.
