# SPEC.md — Meetly

## 1. Aplikacja w jednym zdaniu

Meetly pomaga małemu zespołowi programistycznemu zachować ustalenia ze spotkań w Element, dając inicjatorowi szkic do zatwierdzenia, a osobom z dostępem zapisane podsumowania i zadania.

## 2. Kontekst użytkownika i ograniczenia

- Inicjator korzysta z Element podczas spotkania, a po nim otwiera Meetly w przeglądarce na komputerze lub telefonie. Pierwsza wersja jest po polsku i obejmuje jeden mały zespół. Założenie czasowe to tydzień pracy nad pierwszą wersją.
- Każdy członek zespołu może zainicjować spotkanie. Inicjator oznacza osobę, która je rozpoczęła. Przed nagraniem inicjator informuje uczestników o nagrywaniu, transkrypcji i AI. „Bot start” zapisuje obecność w chwili startu i uruchamia nagranie, a „bot stop” lub koniec rozmowy kończy nagranie. Bot przekazuje do Meetly transkrypcję i metadane.
- Inicjator widzi własny szkic. Po zatwierdzeniu wynik widzą PM, dyrektor i osoby z dostępem do danego spotkania. Domyślny dostęp uczestników wynika z listy startowej i zweryfikowanego powiązania kont. Uczestnik z listy startowej, który ma dostęp, oraz PM i dyrektor mogą zmieniać listę dostępu. Osoba z ręcznie przyznanym dostępem widzi wynik, a programista i analityk widzą na liście wyłącznie własne zadania ze spotkań, do których mają aktualny dostęp. PM i dyrektor widzą zadania zespołu. Tylko PM zmienia stan zadań i dodaje ręcznie wykonane zadania. Inicjator z dostępem do wyniku widzi wszystkie zadania w szczegółach swojego spotkania.
- Nagranie na chronionym dysku integracji jest usuwane po 30 dniach. Meetly usuwa roboczą transkrypcję po zatwierdzeniu albo porzuceniu szkicu. Zatwierdzone spotkanie jest usuwane po 6 miesiącach kalendarzowych od zakończenia. Uczestnik z listy obecności przy „bot start” i z aktualnym dostępem może usunąć je wcześniej dla wszystkich razem z wynikiem, zadaniami i historią ich zmian. Meetly prosi o potwierdzenie. Jeżeli nagranie zachowało się na chronionym dysku, można je ponownie zaimportować jako nowy szkic.
- [DO USTALENIA: w Fazie A potwierdzić dostęp bota do dźwięku i listy uczestników, mapowanie kont z Element na konta Meetly oraz źródło tytułu spotkania].
- [DO USTALENIA: przed użyciem prawdziwych danych uzgodnić retencję kopii tekstu u bota lub dostawcy oraz sposób zgłaszania usunięcia danych].

Szczegółowe role, model danych, reguły P2 oraz ograniczenia dla integracji i AI są w [specyfikacji technicznej](docs/specyfikacja.md).

## 3. Zakres

| Must-have | Nice-to-have | Poza zakresem (powód) |
| --- | --- | --- |
| Logowanie i dostęp według roli oraz listy spotkania | Liczniki spotkań i zadań w Przeglądzie | Obsługa wielu zespołów i organizacji — pierwsza wersja obsługuje jeden zespół. |
| Nagrywanie przez bota w Element i uwierzytelniony import transkrypcji oraz obecności |  | Automatyczne dołączanie z kalendarza oraz integracje z Teams i Google Meet — pierwsze źródło to Element. |
| Automatyczna propozycja skrótu, decyzji, zadań i tematów do wyjaśnienia |  | Wgrywanie plików nagrań do Meetly — uzgodniona ścieżka prowadzi przez import od bota. |
| Edycja i zatwierdzenie szkicu przez inicjatora |  | Powiadomienia e-mailowe lub w komunikatorze — zespół sprawdza wynik i zadania w aplikacji. |
| Odczyt zatwierdzonego wyniku i przypisanych zadań |  | Archiwum pełnych transkrypcji, cytaty i rozpoznawanie mówców — MVP używa transkrypcji przejściowo, a historia służy ustaleniom. |

**Zadania po zatwierdzeniu:** PM lub osoba, której przypisano zadanie i która ma dostęp do spotkania, może usunąć nieaktualne zadanie. Po potwierdzeniu znika ono ze wszystkich profili i raportów. Jeśli późniejsze spotkanie ustaliło nowe zadanie, można jawnie usunąć poprzednie. Nowe zadanie pozostaje na liście. Meetly rozpoznaje zadania po rekordzie, bez automatycznego zastępowania po treści.

Odebranie dostępu do spotkania ukrywa jego zadania dla danej osoby. Pozostali uprawnieni nadal mogą je zobaczyć.

**Uzgodniony zakres MVP poza główną ścieżką:** historia spotkań i zadań, filtry słów, dat i wieku spotkania, zmiana listy dostępu po zatwierdzeniu, wcześniejsze usuwanie i retencja, ręczne dodawanie wykonanych zadań i zmiana ich stanu przez PM, raport tygodniowy dla PM i dyrektora. Te funkcje pozostają w MVP na podstawie DEC-10 i DEC-11. Zaliczenie głównej ścieżki można sprawdzić bez nich.

## 4. Ekrany w kolejności głównej ścieżki

**Główna ścieżka:** po spotkaniu w Element inicjator loguje się do Meetly, otwiera zaimportowany szkic, poprawia i zatwierdza wynik, po czym odbiorca z dostępem widzi wynik oraz przypisane mu zadania.

1. **Logowanie (E1)** — użytkownik uwierzytelnia się i przechodzi do Przeglądu. W prototypie ten krok reprezentuje wybór konta demonstracyjnego.
2. **Przegląd / Mój widok (E2)** — użytkownik widzi podsumowanie tygodnia, ostatnie spotkania i zadania zgodne z dostępem. Inicjator wybiera „Import z Element” z głównej nawigacji lub akcji w Przeglądzie.
3. **Import z Element** — inicjator widzi kolejkę swoich spotkań do zatwierdzenia i wybiera „Sprawdź szkic”.
4. **Wynik spotkania do zatwierdzenia (E5)** — inicjator poprawia treść, przypisania i listę dostępu. Podsumowanie jest po lewej, zadania po prawej. Na wąskim ekranie zadania są pod podsumowaniem. Puste decyzje i tematy do wyjaśnienia mają akcję dodania sekcji. Pola rosną z treścią. Pod listą dostępu pozostają „Zatwierdź wynik”, „Wróć do kolejki” i „Porzuć szkic”.
5. **Zatwierdzony wynik spotkania (E6)** — po akcji „Zatwierdź wynik” prototyp pokazuje komunikat „Zatwierdzono wynik spotkania.” i szczegóły, jeśli inicjator ma do nich dostęp. Przy braku dostępu wraca do historii. Osoba uprawniona wraca do wyniku przez zakładkę „Spotkania”. Osoba odpowiedzialna widzi przypisane zadania w zakładce „Zadania”.

**Ścieżka dodatkowa:** PM i dyrektor otwierają „Raport tygodniowy” (E7). Dyrektor korzysta z raportu w trybie odczytu. PM zarządza stanami zadań i może dodać wykonane zadanie.

Z [aktualnego prototypu](meetly-prototyp.html) zachowujemy układ Przeglądu, kolejność kart i nawigacji, układ szkicu oraz nazwy i miejsca jego głównych akcji. Szczegóły wyglądu zawiera [DESIGN.md](DESIGN.md).

## 5. User stories must-have

### US1 · Logowanie i dostęp

Jako członek zespołu chcę zalogować się na swoje konto, żeby zobaczyć wyniki i zadania w granicach moich uprawnień.

- **K1.** Po poprawnym logowaniu użytkownik trafia do Przeglądu z danymi swojej roli.

  **Sprawdzam:** loguję się na fikcyjne konto analityka, a potem PM. Zaliczone, gdy oba widzą Przegląd, a zakres danych odpowiada ich rolom.
- **K2.** Otwarcie adresu chronionego wyniku bez sesji prowadzi do logowania bez ujawniania wyniku.

  **Sprawdzam:** otwieram adres wyniku w oknie prywatnym. Zaliczone, gdy widzę logowanie i żadnej treści spotkania.
- **K3.** Na liście zalogowanej osoby bez dostępu nie ma danego spotkania. Bezpośredni odczyt również jest zablokowany po stronie serwera.

  **Sprawdzam:** otwieram listę i znany adres wyniku na fikcyjnym koncie bez dostępu. Zaliczone, gdy spotkania nie ma na liście i serwer nie zwraca jego treści.

### US2 · Import z Element

Jako inicjator chcę uzyskać szkic po zakończeniu nagrania w Element, żeby móc sprawdzić ustalenia w Meetly.

- **K1.** Nagranie rozpoczyna się dopiero po „bot start”. Lista wejściowa zawiera konta połączone w chwili komendy, z pominięciem bota.

  **Sprawdzam:** w fikcyjnym spotkaniu dołączam dwoma kontami i wysyłam „bot start”. Zaliczone, gdy nagranie zaczyna się po komendzie, a w szkicu widać obydwa konta i brak konta bota.
- **K2.** „Bot stop” i koniec połączenia kończą nagranie, a przyjęty import pojawia się raz w kolejce inicjatora.

  **Sprawdzam:** wykonuję po jednym fikcyjnym spotkaniu dla obu sposobów zakończenia i ponawiam dostarczenie jednego importu. Zaliczone, gdy oba spotkania mają własne pozycje i powtórzony import nie dubluje pozycji.
- **K3.** Niekompletny import ani import bez zweryfikowanego inicjatora nie wystawia szkicu do zatwierdzenia.

  **Sprawdzam:** wysyłam fikcyjne importy z brakującą transkrypcją i bez powiązania inicjatora. Zaliczone, gdy kolejki testowych kont nie pokazują tych szkiców.

### US3 · Szkic proponowany przez AI

Jako inicjator chcę zobaczyć propozycję wyniku, żeby zweryfikować decyzje i odpowiedzialność przed jej udostępnieniem.

- **K1.** Po przetworzeniu importu szkic pokazuje skrót i zadania, a decyzje i tematy do wyjaśnienia pokazuje, kiedy są wypełnione.

  **Sprawdzam:** otwieram dwa fikcyjne szkice, jeden z decyzją i otwartym tematem, drugi bez nich. Zaliczone, gdy pierwszy pokazuje treść obu sekcji, a drugi pokazuje akcje ich dodania bez pustych pól.
- **K2.** Zadanie bez pewnego wykonawcy trafia do tematów do wyjaśnienia.

  **Sprawdzam:** używam przykładu, w którym podano działanie bez osoby odpowiedzialnej. Zaliczone, gdy działanie można znaleźć w tematach do wyjaśnienia i brak zapisanego zadania bez właściciela.
- **K3.** Błąd generowania daje komunikat i możliwość ponowienia, a wynik pozostaje niezatwierdzony.

  **Sprawdzam:** wywołuję błąd przez atrapę usługi AI. Zaliczone, gdy inicjator widzi akcję ponowienia i spotkania nie ma w historii zatwierdzonych wyników.

### US4 · Edycja i zatwierdzenie

Jako inicjator chcę poprawić szkic i go zatwierdzić, żeby zespół otrzymał zweryfikowany wynik.

- **K1.** Po zatwierdzeniu zachowują się edytowany skrót, treść zadania i wybrana osoba odpowiedzialna.

  **Sprawdzam:** zmieniam skrót i zadanie, przypisuję je Analitykowi A i zatwierdzam. Zaliczone, gdy szczegóły pokazują poprawiony skrót, a zadanie widnieje na liście Analityka A.
- **K2.** Zatwierdzenie usuwa szkic z kolejki i pokazuje potwierdzenie. Wynik staje się dostępny zgodnie z listą dostępu i rolami.

  **Sprawdzam:** zmieniam listę dostępu, zatwierdzam, wracam do kolejki i sprawdzam historię na wybranych kontach. Zaliczone, gdy widzę potwierdzenie, kolejka nie zawiera szkicu, a historia pokazuje wynik wyłącznie na uprawnionych kontach.
- **K3.** Porzucenie szkicu usuwa go z kolejki i nie tworzy wyniku ani zadań.

  **Sprawdzam:** wybieram „Porzuć szkic” na drugim fikcyjnym spotkaniu. Zaliczone, gdy szkic znika z kolejki, a wynik i zadania nie pojawiają się w pozostałych widokach.
- **K4.** Długie pole zadania wyświetla cały tekst, a na telefonie panele są jeden pod drugim.

  **Sprawdzam:** otwieram szkic z długim zadaniem na komputerze i telefonie. Zaliczone, gdy całą treść można przeczytać bez przewijania wewnątrz pola, a na telefonie panele mieszczą się w jednej kolumnie.

### US5 · Powrót do wyniku i zadań

Jako członek zespołu chcę wrócić do zatwierdzonych ustaleń i przypisanych mi zadań, żeby wiedzieć, czym mam się zająć.

- **K1.** Zakładka „Spotkania” pokazuje tytuł i datę dostępnego spotkania i pozwala otworzyć jego zatwierdzone podsumowanie.

  **Sprawdzam:** loguję się jako uczestnik, otwieram „Spotkania” i wybieram wynik. Zaliczone, gdy data i tytuł zgadzają się z wynikiem, a widoczny skrót odpowiada zatwierdzonej treści.
- **K2.** Analityk i programista widzą własne zadania w zakładce „Zadania”. Inicjator może zobaczyć zadania innych osób w szczegółach spotkania, które zainicjował, gdy nadal ma dostęp. PM i dyrektor widzą zadania całego zespołu.

  **Sprawdzam:** po zatwierdzeniu po jednym zadaniu dla dwóch osób przełączam cztery fikcyjne konta. Zaliczone, gdy każda przypisana osoba widzi swoje zadanie, inicjator widzi oba w szczegółach spotkania, a PM i dyrektor widzą oba na liście zadań.
- **K3.** W historii osób uprawnionych pojawiają się tylko wyniki zatwierdzone przez inicjatora.

  **Sprawdzam:** porównuję historię, gdy jeden wynik jest szkicem, a drugi został zatwierdzony. Zaliczone, gdy drugi jest widoczny, a pierwszy znajduje się wyłącznie w kolejce inicjatora.

- **K4.** Gdy osoba traci dostęp do spotkania, znika ono z jej historii, a przypisane jej zadania z tego spotkania znikają z jej listy.

  **Sprawdzam:** odbieram Analitykowi A dostęp i ponownie otwieram jego historię oraz listę zadań. Zaliczone, gdy nie widzi ani spotkania, ani jego zadań, a PM nadal je widzi.

Szczegółowe przypadki, w tym filtry, usuwanie, retencję, stany zadań i raport, opisują [karty F00–F05](docs/funkcje/).

## 6. Kierunek budowy

- **Czy dane mają być wspólne?** Tak. Inicjator zatwierdza na swoim koncie, a uczestnicy, PM i dyrektor odczytują uprawnione wyniki i zadania na własnych urządzeniach (US1, US4 i US5).
- **Czy aplikacja wywołuje płatne API własnym kluczem?** [DO USTALENIA: Faza A potwierdzi dostawców AI i transkrypcji, koszty, region, limity i wymagania dotyczące kluczy]. Integracje są częścią docelowego MVP. Prototyp używa danych fikcyjnych.
- **Kierunek:** aplikacja webowa z bazą, logowaniem, kontrolą dostępu po stronie serwera i przetwarzaniem importu poza przeglądarką.
- **Co świadomie pomijamy:** własny mechanizm haseł i ekran nadawania ról. Właściciel przypisuje role poza interfejsem MVP.
- **Co pozostaje poza zakresem:** listę i powody zawiera sekcja 3.
- **Warunek zmiany kierunku:** przejście na lokalny frontend ma sens tylko po zmianie wymagania o wspólnym dostępie. Jeśli Element nie pozwoli uzyskać dźwięku lub zweryfikowanej obecności w docelowym środowisku, trzeba uzgodnić inne źródło importu przed budową F02.

## 7. Wygląd

[DESIGN.md](DESIGN.md) — własny kierunek wizualny Meetly z aktualnego prototypu, przyjęty po porównaniu wariantów. Granatowy nagłówek, fioletowo-błękitne akcje i jasne karty pomagają inicjatorowi odróżnić nawigację od działań na szkicu i skupić się na treści. Plik opisuje własny wygląd. Starszy wzorzec Minimal i jego licencja pozostają materiałem z wcześniejszej wersji projektu.
