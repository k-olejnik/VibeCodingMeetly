# Specyfikacja MVP: Meetly

Wersja 6 · 22 listopada 2026 r. · ujednolicenie dokumentacji

## 1. Cel i użytkownicy

Meetly pomaga małemu zespołowi zamknąć spotkanie jasnym zestawem ustaleń. Bot w Element nagrywa spotkanie i dostarcza transkrypcję oraz listę uczestników. Meetly proponuje skrót, decyzje, zadania i tematy do wyjaśnienia. Uprawniony uczestnik zatwierdza wynik. Historia i raport tygodniowy pomagają PM śledzić zadania. MVP obejmuje jeden mały zespół.

## 2. Co pokazały testy

Wcześniejszy prototyp z transkrypcją w Meetly ma notatki autorki, test jednego uczestnika i oddzielnie oznaczoną symulację agenta. Na obecnej ścieżce z Element brak udokumentowanego testu z użytkownikami. Obserwacje i wynikające z nich poprawki zbierają [wnioski z testów](wnioski-z-testow.md). Scenariusz kolejnej próby jest w [planie testu](../plan-testu-element.md), a niesprawdzone założenia w sekcji 12.

## 3. Zakres MVP

**Główna ścieżka MVP:** inicjator sprawdza obecność w Element i informuje o nagrywaniu, transkrypcji i AI → „bot start” → bot zapisuje listę połączonych kont i nagrywa → „bot stop” lub koniec rozmowy → bot dostarcza transkrypcję i listę → Meetly proponuje wynik → uprawniony uczestnik zatwierdza → wynik jest dostępny zgodnie z sekcją 4.

**Czas na pierwszą wersję:** tydzień pracy.

**W MVP:**

- logowanie członków jednego zespołu z rolami: PM, programista, analityk i dyrektor;
- nagrywanie i transkrypcja przez bota w Element, z listą kont połączonych w chwili startu;
- import transkrypcji i metadanych od bota po zakończeniu nagrania;
- propozycja skrótu, decyzji, zadań i tematów do wyjaśnienia;
- ręczne poprawianie oraz zatwierdzenie wyniku przez osobę inicjującą spotkanie;
- pełny widok zapisanych wyników dla PM i dyrektora;
- dostęp do zatwierdzonego spotkania dla uczestników z listy startowej i osób uprawnionych w Meetly oraz lista własnych zadań dla programisty i analityka;
- historia zatwierdzonych spotkań z filtrami słów, zakresu dat i wieku spotkania oraz historia zadań;
- automatyczne usuwanie spotkań z Meetly po 6 miesiącach i możliwość wcześniejszego usunięcia;
- zmiana stanu zadania przez PM i ręczne dodanie przez PM zadania już wykonanego;
- raport tygodniowy: zamknięte zadania oraz otwarte zadania pogrupowane według osób;
- automatyczne usuwanie nagrań z chronionego dysku po 30 dniach i roboczej transkrypcji z Meetly po zatwierdzeniu lub porzuceniu wyniku.

**Opcjonalne w pierwszej wersji:** liczniki spotkań i zadań w Przeglądzie.

**Później:**

- obsługa wielu niezależnych zespołów i organizacji — wymaga osobnego modelu dostępu do danych;
- automatyczne dołączanie do spotkań z kalendarza, Teams lub Google Meet — rozszerza sposób pozyskania dźwięku;
- dodawanie nagrań po spotkaniu — właściciel wykluczył je z pierwszej wersji;
- powiadomienia e-mailowe i komunikatorowe — pierwsza wersja pokazuje wynik w aplikacji;
- terminy i automatyczne aktualizacje istniejących zadań w innych narzędziach — termin nie jest wymagany w MVP;
- widok dyrektora wybierający tylko istotne dla niego informacje — na początku dyrektor widzi całość;
- rozpoznawanie mówców, cytaty i archiwum pełnych transkrypcji — kolidują z zasadą nieprzechowywania transkrypcji.

## 4. Role i uprawnienia

| Rola | Co widzi | Co tworzy | Co zmienia | Co usuwa |
|---|---|---|---|---|
| PM | Dostępne zatwierdzone spotkania i ich zadania, ręczne zadania zespołu oraz raport tygodniowy zgodny z dostępem | Ręczne zadanie i wynik w dostępnej kolejce szkiców | Dostępny szkic i stan widocznego zadania | Widoczne zadanie po potwierdzeniu. Spotkanie po potwierdzeniu, jeśli był obecny przy starcie i ma dostęp |
| Dyrektor | Dostępne zatwierdzone spotkania i ich zadania, ręczne zadania zespołu oraz raport tygodniowy zgodny z dostępem | Wynik w dostępnej kolejce szkiców | Dostępny szkic | Własne zadanie po potwierdzeniu. Spotkanie po potwierdzeniu, jeśli był obecny przy starcie i ma dostęp |
| Programista | Dostępne zatwierdzone spotkania oraz własne zadania | Wynik w dostępnej kolejce szkiców | Dostępny szkic | Własne zadanie po potwierdzeniu. Spotkanie po potwierdzeniu, jeśli był obecny przy starcie i ma dostęp |
| Analityk | Dostępne zatwierdzone spotkania oraz własne zadania | Wynik w dostępnej kolejce szkiców | Dostępny szkic | Własne zadanie po potwierdzeniu. Spotkanie po potwierdzeniu, jeśli był obecny przy starcie i ma dostęp |

Aktualny dostęp do zatwierdzonego spotkania wynika z zachowanego dostępu uczestnika z listy „bot start”, jawnego nadania lub przypisania co najmniej jednego zadania z tego spotkania. Przypisanie nadaje dostęp przy zatwierdzeniu, niezależnie od roli. Po usunięciu ostatniego przypisanego zadania wygasa dostęp wynikający z przypisania. Pozostałe podstawy dostępu zachowują ważność. Rozłączenie po starcie nie odbiera dostępu. Zmiana listy i usunięcie zatwierdzonego spotkania wymagają obecności przy starcie oraz aktualnego dostępu, niezależnie od roli. Utrata skutecznego dostępu odbiera odczyt spotkania i jego zadań, także przez API i raporty historyczne.

Każdy członek zespołu może zainicjować spotkanie. Inicjator to uczestnik, który je rozpoczął. W szczegółach zainicjowanego spotkania widzi wszystkie zadania, jeśli nadal ma dostęp do wyniku. Każdy zweryfikowany uczestnik z listy „bot start” może otworzyć szkic, poprawić podsumowanie, zadania, przypisania i listę dostępu oraz zatwierdzić wynik. Pierwsze skuteczne zatwierdzenie zapisuje wynik i zadania raz oraz zamyka szkic we wszystkich kolejkach. Przy ponownym imporcie obowiązuje zakres uprawnień z DEC-12.

Rola jest przypisana do konta przez właściciela projektu poza interfejsem MVP. Aplikacja nie ma w pierwszej wersji ekranu zarządzania rolami.

## 5. Ekrany i ścieżki

| ID | Ekran | Rola | Z prototypu | Funkcje |
|---|---|---|---|---|
| E1 | Logowanie | wszyscy | nowy | F01 |
| E2 | Przegląd / Mój widok | wszyscy, zawartość zależna od roli | tak | F04 |
| — | Import z Element | uprawniony uczestnik, kolejka dostępnych szkiców | symulacja | F02, F03 |
| E5 | Wynik spotkania do zatwierdzenia | osoba inicjująca spotkanie | tak | F03 |
| E6 | Zatwierdzony wynik spotkania | osoby z aktualnym dostępem | tak | F04 |
| E7 | Historia zadań i raport tygodniowy | PM i dyrektor, zgodnie z uprawnieniami z sekcji 4 | demonstracyjny raport | F05 |

### Główna ścieżka w aplikacji

1. **Logowanie (E1)** — użytkownik uwierzytelnia się i przechodzi do Przeglądu. W prototypie ten krok reprezentuje wybór konta demonstracyjnego.
2. **Przegląd / Mój widok (E2)** — użytkownik widzi podsumowanie tygodnia, ostatnie spotkania i zadania zgodne z dostępem. Uprawniony uczestnik wybiera „Import z Element” z głównej nawigacji lub akcji w Przeglądzie.
3. **Import z Element** — uprawniony uczestnik widzi kolejkę dostępnych spotkań do zatwierdzenia i wybiera „Sprawdź szkic”.
4. **Wynik spotkania do zatwierdzenia (E5)** — uprawniony uczestnik poprawia treść, przypisania i listę dostępu. Podsumowanie jest po lewej, zadania po prawej. Na wąskim ekranie zadania są pod podsumowaniem. Puste decyzje i tematy do wyjaśnienia mają akcję dodania sekcji. Pola rosną z treścią. Pod listą dostępu pozostają „Zatwierdź wynik”, „Wróć do kolejki” i „Porzuć szkic”.
5. **Zatwierdzony wynik spotkania (E6)** — po akcji „Zatwierdź wynik” Meetly pokazuje komunikat „Zatwierdzono wynik spotkania.” i szczegóły, jeśli zatwierdzająca osoba ma do nich dostęp. Przy braku dostępu wraca do historii. Osoba uprawniona wraca do wyniku przez zakładkę „Spotkania”. Osoba odpowiedzialna widzi przypisane zadania w zakładce „Zadania”.

### Historie użytkowników i kryteria akceptacji

#### US1 · Logowanie i dostęp

Jako członek zespołu chcę zalogować się na swoje konto, żeby zobaczyć wyniki i zadania w granicach moich uprawnień.

- **K1.** Po poprawnym logowaniu użytkownik trafia do Przeglądu z danymi swojej roli.

  **Sprawdzam:** loguję się na fikcyjne konto analityka, a potem PM. Zaliczone, gdy oba widzą Przegląd, a zakres danych odpowiada ich rolom.
- **K2.** Otwarcie adresu chronionego wyniku bez sesji prowadzi do logowania bez ujawniania wyniku.

  **Sprawdzam:** otwieram adres wyniku w oknie prywatnym. Zaliczone, gdy widzę logowanie i żadnej treści spotkania.
- **K3.** Na liście zalogowanej osoby bez dostępu nie ma danego spotkania. Bezpośredni odczyt również jest zablokowany po stronie serwera.

  **Sprawdzam:** otwieram listę i znany adres wyniku na fikcyjnym koncie bez dostępu. Zaliczone, gdy spotkania nie ma na liście i serwer nie zwraca jego treści.

#### US2 · Import z Element

Jako uprawniony uczestnik chcę uzyskać szkic po zakończeniu nagrania w Element, żeby móc sprawdzić ustalenia w Meetly.

- **K1.** Nagranie rozpoczyna się dopiero po „bot start”. Lista wejściowa zawiera konta połączone w chwili komendy, z pominięciem bota.

  **Sprawdzam:** w fikcyjnym spotkaniu dołączam dwoma kontami i wysyłam „bot start”. Zaliczone, gdy nagranie zaczyna się po komendzie, a w szkicu widać obydwa konta i brak konta bota.
- **K2.** „Bot stop” i koniec połączenia kończą nagranie. Ten sam import występuje raz w kolejce każdego uprawnionego uczestnika.

  **Sprawdzam:** wykonuję po jednym fikcyjnym spotkaniu dla obu sposobów zakończenia i ponawiam dostarczenie jednego importu. Zaliczone, gdy oba spotkania mają własne pozycje i powtórzony import nie dubluje pozycji.
- **K3.** Niekompletny lub nieuwierzytelniony import nie wystawia szkicu. Kolejka i odczyt bezpośredni wymagają zweryfikowanego uprawnienia uczestnika.

  **Sprawdzam:** wysyłam niekompletny import, a następnie poprawny import i otwieram kolejki na dwóch kontach uczestników oraz koncie osoby spoza listy startowej. Zaliczone, gdy szkic pojawia się wyłącznie na dwóch uprawnionych kontach.

#### US3 · Szkic proponowany przez AI

Jako uprawniony uczestnik chcę zobaczyć propozycję wyniku, żeby zweryfikować decyzje i odpowiedzialność przed jej udostępnieniem.

- **K1.** Po przetworzeniu importu szkic pokazuje skrót i zadania, a decyzje i tematy do wyjaśnienia pokazuje, kiedy są wypełnione.

  **Sprawdzam:** otwieram dwa fikcyjne szkice, jeden z decyzją i otwartym tematem, drugi bez nich. Zaliczone, gdy pierwszy pokazuje treść obu sekcji, a drugi pokazuje akcje ich dodania bez pustych pól.
- **K2.** Zadanie bez pewnego wykonawcy trafia do tematów do wyjaśnienia.

  **Sprawdzam:** używam przykładu, w którym podano działanie bez osoby odpowiedzialnej. Zaliczone, gdy działanie można znaleźć w tematach do wyjaśnienia i brak zapisanego zadania bez właściciela.
- **K3.** Błąd generowania daje komunikat i możliwość ponowienia, a wynik pozostaje niezatwierdzony.

  **Sprawdzam:** wywołuję błąd przez atrapę usługi AI. Zaliczone, gdy uprawniony uczestnik widzi akcję ponowienia i spotkania nie ma w historii zatwierdzonych wyników.

#### US4 · Edycja i zatwierdzenie

Jako uprawniony uczestnik chcę poprawić szkic i go zatwierdzić, żeby zespół otrzymał zweryfikowany wynik.

- **K1.** Po zatwierdzeniu zachowują się edytowany skrót, treść zadania i wybrana osoba odpowiedzialna.

  **Sprawdzam:** zmieniam skrót i zadanie, przypisuję je Analitykowi A i zatwierdzam. Zaliczone, gdy szczegóły pokazują poprawiony skrót, a zadanie widnieje na liście Analityka A.
- **K2.** Pierwsze skuteczne zatwierdzenie zapisuje wynik i zadania raz, usuwa szkic ze wszystkich kolejek i nadaje wykonawcom wgląd do spotkania.

  **Sprawdzam:** na dwóch kontach uczestników prawie równocześnie zatwierdzam ten sam szkic z zadaniem dla osoby spoza listy. Zaliczone, gdy powstaje jeden wynik, zadanie zapisuje się raz, szkic znika z obu kolejek, a wykonawca widzi wynik.
- **K3.** Porzucenie szkicu usuwa go z kolejki i nie tworzy wyniku ani zadań.

  **Sprawdzam:** wybieram „Porzuć szkic” na drugim fikcyjnym spotkaniu. Zaliczone, gdy szkic znika z kolejki, a wynik i zadania nie pojawiają się w pozostałych widokach.
- **K4.** Długie pole zadania wyświetla cały tekst, a na telefonie panele są jeden pod drugim.

  **Sprawdzam:** otwieram szkic z długim zadaniem na komputerze i telefonie. Zaliczone, gdy całą treść można przeczytać bez przewijania wewnątrz pola, a na telefonie panele mieszczą się w jednej kolumnie.

#### US5 · Powrót do wyniku i zadań

Jako członek zespołu chcę wrócić do zatwierdzonych ustaleń i przypisanych mi zadań, żeby wiedzieć, czym mam się zająć.

- **K1.** Zakładka „Spotkania” pokazuje tytuł i datę dostępnego spotkania i pozwala otworzyć jego zatwierdzone podsumowanie.

  **Sprawdzam:** loguję się jako uczestnik, otwieram „Spotkania” i wybieram wynik. Zaliczone, gdy data i tytuł zgadzają się z wynikiem, a widoczny skrót odpowiada zatwierdzonej treści.
- **K2.** Analityk i programista widzą własne zadania na liście. Inicjator z dostępem widzi także cudze zadania w szczegółach zainicjowanego spotkania. PM i dyrektor widzą zadania z dostępnych im spotkań oraz ręczne zadania zespołu.

  **Sprawdzam:** przypisuję po jednym zadaniu dwóm osobom. Zaliczone, gdy obie widzą własne zadania, inicjator widzi oba w szczegółach, PM z dostępem widzi oba, a dyrektor bez dostępu nie widzi żadnego.
- **K3.** Historia pokazuje wyłącznie zatwierdzone wyniki z dostępnych spotkań.

  **Sprawdzam:** porównuję historię i kolejkę na fikcyjnych kontach uczestnika oraz osoby spoza spotkania. Szkic widzi w kolejce tylko uprawniony uczestnik.

- **K4.** Gdy osoba traci dostęp do spotkania, znika ono z jej historii, a przypisane jej zadania z tego spotkania znikają z jej listy.

  **Sprawdzam:** usuwam ostatnie zadanie Analityka A ze spotkania, do którego miał dostęp wyłącznie przez przypisanie. Zaliczone, gdy znika także spotkanie z jego historii. W osobnej próbie jawnie nadany dostęp pozostaje aktywny.

## 6. Model danych

### Konto

Konto członka jednego zespołu. Służy do logowania, przypisywania zadań oraz sprawdzania roli.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| imię wyświetlane | nazwa osoby w aplikacji | tekst | tak | „Programista A” | osobowe | właściciel projektu | członkowie zespołu zgodnie z rolą |
| e-mail | identyfikator logowania | tekst | tak | `programista.a@example.test` | osobowe | właściciel projektu i usługa logowania | właściciel projektu; nie trafia do wyników spotkań |
| rola | zakres dostępu | wybór: PM, programista, analityk, dyrektor | tak | programista | osobowe w połączeniu z kontem | właściciel projektu | system dostępu, właściciel projektu |

Powiązanie z kontem Matrix jest opcjonalne dla konta Meetly i wymagane do automatycznego nadania dostępu na podstawie obecności. Serwer używa zweryfikowanego identyfikatora, a mapowanie ustala Faza A.

### Spotkanie

Spotkanie zaimportowane z Element. Nagranie pozostaje na chronionym dysku po stronie integracji. Meetly otrzymuje wyłącznie transkrypcję oraz metadane.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| tytuł | opis spotkania | tekst, do 120 znaków | tak | „Planowanie wydania” | może zawierać dane osobowe lub poufne | inicjator | uprawnieni do szkicu albo zatwierdzonego wyniku |
| inicjator | konto osoby, która rozpoczęła spotkanie | odwołanie do Konta | według kontraktu importu | „Programista A” | osobowe | mechanizm ustalany w Fazie A | zgodnie z dostępem do spotkania |
| rozpoczęto | czas uruchomienia | data i godzina | tak | 05.11.2026, 10:00 | zwykłe | aplikacja | zgodnie z dostępem do spotkania |
| zakończono | czas zamknięcia | data i godzina | nie, do końca sesji | 05.11.2026, 10:35 | zwykłe | aplikacja | zgodnie z dostępem do spotkania |
| status | etap importu i wyniku | wybór: przetwarzanie, do zatwierdzenia, zatwierdzone, odrzucone | tak | zatwierdzone | zwykłe | aplikacja na podstawie operacji uprawnionych kont | według uprawnień |

Spotkanie przechowuje identyfikator importu, listę kont obecnych w chwili startu oraz podstawy aktualnego dostępu opisane w sekcji 4. Mapowanie identyfikatora Matrix na konto Meetly jest jednoznaczne i sprawdzane po stronie serwera. Brak mapowania nie nadaje dostępu na podstawie obecności. Do obsługi ponownego importu potrzebna jest informacja o uprawnionych uczestnikach w chwili usunięcia. Zakres i czas przechowywania niezbędnych metadanych integracji ustala Faza A.

### Przejściowa transkrypcja

Tekst przekazany przez bota po zakończeniu nagrania. Służy do wygenerowania szkicu i podlega ochronie P2.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| treść transkrypcji | tekst nagranego fragmentu | tekst | tak do wygenerowania szkicu | „Ustalmy zakres wydania.” | P2 | bot | inicjator przed zatwierdzeniem oraz proces generowania |


Meetly usuwa roboczą transkrypcję po zatwierdzeniu lub porzuceniu wyniku.

Historia wyszukuje słowa w tytułach i zatwierdzonych podsumowaniach dostępnych spotkań. Pola „Od” i „Do” są niezależne i obejmują wskazane dni. „Starsze niż” przyjmuje dodatnią liczbę całkowitą i jednostkę: dni, tygodnie lub miesiące. Filtry daty i wieku stosuje się do daty zakończenia spotkania. Wypełnione filtry działają łącznie.

### Wynik spotkania

Zatwierdzony rezultat, który zastępuje transkrypcję w historii aplikacji. Meetly automatycznie usuwa spotkanie i jego wynik po 6 miesiącach kalendarzowych od zakończenia spotkania. Uczestnik z listy obecności przy „bot start” i z aktualnym dostępem może usunąć je wcześniej. Potwierdzenie ma treść „Czy na pewno chcesz usunąć spotkanie?”. Serwer sprawdza uczestnictwo i dostęp przed wykonaniem operacji. Usunięcie dotyczy wszystkich użytkowników i obejmuje wynik, zadania pochodzące ze spotkania oraz historię ich zmian. Źródłowe nagranie pozostaje na chronionym dysku zgodnie z retencją 30 dni. Dopóki nagranie jest dostępne, jawny ponowny import może zlecić zweryfikowany uczestnik z listy „bot start”, który miał dostęp w chwili usunięcia spotkania. Nowy szkic trafia tylko do takich uczestników. Każdy z nich może go edytować i zatwierdzić. Ponowienie tego samego dostarczenia nie odtwarza usuniętego spotkania. Pierwotne edycje i przypisania trzeba w takim szkicu sprawdzić ponownie. Mechanizm ponownego importu jest do ustalenia w Fazie A.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| skrót | zwięzły opis ustaleń | tekst | tak po zatwierdzeniu | „Zespół ustalił zakres wydania.” | P2: może zawierać treści służbowe | AI proponuje, uprawniony uczestnik zatwierdza | osoby z aktualnym dostępem do spotkania |
| decyzje | lista podjętych decyzji | lista tekstów | tak, może być pusta | „Wydanie w piątek.” | P2 | AI proponuje, uprawniony uczestnik zatwierdza | osoby z aktualnym dostępem do spotkania |
| tematy do wyjaśnienia | nierozstrzygnięte pytania | lista tekstów | tak, może być pusta | „Kto zatwierdza komunikację?” | P2 | AI proponuje, uprawniony uczestnik zatwierdza | osoby z aktualnym dostępem do spotkania |

### Zadanie

Pozycja wynikająca ze spotkania. Opis może oznaczać nowe działanie albo zmianę w pracy osoby przypisanej.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| treść | co ma zrobić lub zmienić osoba | tekst, do 500 znaków | tak | „Uzupełnij opis scenariusza logowania.” | P2: może zawierać dane służbowe | AI proponuje, uprawniony uczestnik zatwierdza | zgodnie z zasadami odczytu z sekcji 4 |
| osoba odpowiedzialna | konto wykonujące zadanie | odwołanie do Konta | tak | „Analityk A” | osobowe | AI proponuje, uprawniony uczestnik zatwierdza | zgodnie z zasadami odczytu z sekcji 4 |
| termin | data wykonania, jeśli padła na spotkaniu | data | nie | 07.11.2026 | zwykłe | AI proponuje, uprawniony uczestnik zatwierdza | zgodnie z zasadami odczytu z sekcji 4 |
| źródło | skąd pochodzi zadanie | wybór: spotkanie, dodane ręcznie przez PM | tak | spotkanie | pośrednio P2 | aplikacja albo PM | zgodnie z zasadami odczytu z sekcji 4 |
| spotkanie | źródłowa sesja, jeśli zadanie powstało ze spotkania | odwołanie do Spotkania | nie | „Planowanie wydania” | pośrednio P2 | aplikacja | zgodnie z zasadami odczytu z sekcji 4 |
| stan | aktualny etap zadania | wybór: otwarte, zamknięte | tak | otwarte | zwykłe | aplikacja przy utworzeniu; PM później | zgodnie z zasadami odczytu z sekcji 4 |

Nie powstaje zadanie bez wskazanej osoby odpowiedzialnej. AI ma wtedy dodać sprawę do „tematów do wyjaśnienia”. PM może dodać ręcznie zadanie już wykonane, wskazując osobę odpowiedzialną; jego źródłem jest wtedy „dodane ręcznie przez PM”. PM lub wykonawca mogą usunąć zadanie po potwierdzeniu. Dla zadania ze spotkania osoba usuwająca musi mieć aktualny dostęp do spotkania. Usunięcie obejmuje wszystkie profile, szczegóły spotkania i raporty oraz historię zmian tego zadania. Jeśli kolejne spotkanie zmieniło zadanie, człowiek może usunąć poprzednią pozycję i zachować nową. Import i AI nie zastępują zadań automatycznie. Po utracie skutecznego dostępu do spotkania zadanie znika z widoków tej osoby, a serwer odrzuca bezpośredni odczyt i próbę jego usunięcia. Rekord pozostaje dostępny dla pozostałych uprawnionych. Tryb zgłaszania usunięcia danych pozostaje do ustalenia (Q1). Usunięcie spotkania usuwa zadania pochodzące z tego spotkania i historię ich zmian. Ręczne zadania PM mają osobne źródło.

### Zmiana zadania

Trwały wpis historii utworzony, gdy PM zamyka albo ponownie otwiera zadanie. Służy do rzetelnego raportu tygodniowego, także gdy zadanie później zmieni stan.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| zadanie | zadanie, którego dotyczy zmiana | odwołanie do Zadania | tak | „Uzupełnij opis scenariusza logowania.” | pośrednio P2 | aplikacja | PM, dyrektor |
| zmiana | nowy stan zadania | wybór: zamknięte, otwarte | tak | zamknięte | zwykłe | PM | PM, dyrektor |
| kiedy | czas zmiany | data i godzina | tak | 05.11.2026, 16:15 | zwykłe | aplikacja | PM, dyrektor |
| zmienił | konto PM wykonującego zmianę | odwołanie do Konta | tak | „PM A” | osobowe | aplikacja z sesji logowania | PM, dyrektor |

Raport tygodniowy nie jest osobną kopią danych. Dla wybranego tygodnia pokazuje Zmiany zadania na „zamknięte” oraz aktualnie otwarte Zadania pogrupowane według osób.

## 7. Ochrona danych i bezpieczeństwo

**Poziom:** P2 — spotkanie na żywo, transkrypcja i wynik mogą zawierać dane osób trzecich oraz poufne treści służbowe.

**Dane osobowe w MVP:** Konto zawiera imię wyświetlane, e-mail i rolę wyłącznie do logowania, przydzielania zadań i kontroli dostępu. Dane te widzą wyłącznie role wskazane w sekcji 6. Robocza transkrypcja podlega N3 i N5. Identyfikatory Matrix służą wyłącznie do powiązania kont z obecnością i kontrolą dostępu. Zatwierdzony wynik może zawierać dane osobowe lub służbowe; jego retencję określa DEC-11.

**Usługi zewnętrzne przetwarzające dane:** usługa logowania, baza danych, hosting, Element, bot i usługa transkrypcji oraz model AI do analizy. Przed Fazą A należy sprawdzić aktualne warunki, region przetwarzania danych i limity każdej usługi. W środowisku deweloperskim używane są wyłącznie dane fikcyjne.

**Niezmienniki:**

- N1: Zatwierdzony wynik jest dostępny wyłącznie dla osób z aktualnym dostępem do spotkania. Programista i analityk widzą na listach własne zadania z dostępnych spotkań oraz własne zadania ręczne. W szczegółach swojego spotkania inicjator z dostępem widzi wszystkie zadania. Test obejmuje listy oraz odczyt bezpośredni.
- N2: PM i dyrektor widzą zatwierdzone wyniki i zadania ze spotkań, do których mają aktualny dostęp. Ta sama reguła obowiązuje w raportach, również za minione tygodnie. Ręczne zadania zespołu są dla nich dostępne.
- N3: Surowa transkrypcja robocza jest dostępna wyłącznie dla inicjatora przed zatwierdzeniem oraz dla procesu generowania szkicu.
- N4: Szkic edytują i zatwierdzają uprawnieni zweryfikowani uczestnicy. Tylko pierwsze skuteczne zatwierdzenie publikuje wynik i zadania. AI nie publikuje ani nie nadpisuje wyniku.
- N5: Meetly usuwa transkrypcję po zatwierdzeniu lub porzuceniu wyniku. Nagranie pozostaje na chronionym dysku integracji i jest automatycznie usuwane po 30 dniach.
- N6: Treść spotkań, e-maile i dane logowania nie trafiają do logów, komunikatów błędów, adresów URL ani nazw plików — przegląd testów i zmienionych plików.
- N7: Tylko PM może dodać ręczne zadanie lub zmienić stan widocznego zadania. Po potwierdzeniu PM lub wykonawca mogą usunąć zadanie ręczne. Zadanie ze spotkania mogą usunąć PM z dostępem do tego spotkania lub jego wykonawca z takim dostępem. Każda zmiana stanu tworzy historię. Test obejmuje wszystkie role.

**Zasady dla agenta programującego:**

1. Agent używa wyłącznie fikcyjnych kont, spotkań i zadań.
2. Środowisko deweloperskie jest odseparowane od produkcyjnego i nie zawiera prawdziwych danych.
3. Klucze oraz hasła są wyłącznie w `.env`, który agent nie czyta ani nie zmienia; repozytorium zawiera tylko `.env.example` bez wartości.
4. Klucze usług AI, transkrypcji i bazy nie trafiają do kodu przeglądarki.
5. Każdy odczyt oraz zapis sprawdza rolę i uprawnienia do zasobu po stronie serwera lub w bazie; ukrycie elementu ekranu nie jest zabezpieczeniem.
6. Nie zapisuje się danych osobowych w logach, błędach, adresach URL ani nazwach plików.
7. Prawdziwe nagrania, transkrypcje, eksporty i zrzuty z produkcji nie trafiają do rozmów z agentem ani do repozytorium.
8. Klucz lub prawdziwe dane, które trafiły do historii Git, uznaje się za ujawnione; klucz trzeba zmienić.
9. Każde pole osobowe ma cel opisany w sekcji 6.
10. Błąd lub brak konfiguracji blokuje rozpoczęcie przetwarzania, zamiast wysłać dane do nieznanej usługi.

**Funkcje z modelem AI:** Do AI trafiają tylko: przejściowa transkrypcja nagrania, tytuł spotkania oraz imiona wyświetlane i role uczestników konieczne do przypisania zadania. Nie trafiają: e-maile, identyfikatory Matrix i Meetly, historia innych spotkań ani dane poza aktywną sesją. Test z wartością `ZNACZNIK_EMAIL` w polu e-mail musi potwierdzać, że nie występuje w zapytaniu do AI. Odpowiedź AI ma ustalony format: skrót, decyzje, zadania z przypisaną osobą i opcjonalnym terminem oraz tematy do wyjaśnienia. Aplikacja sprawdza format odpowiedzi przed pokazaniem jej uprawnionym uczestnikom. AI jedynie proponuje treść; człowiek zatwierdza i może poprawić każdy element. Koszt jednego użycia, limit na użytkownika oraz limit budżetu są do sprawdzenia w Fazie A. Przy błędzie AI aplikacja nie zapisuje wyniku, pokazuje zrozumiały komunikat i pozwala uprawnionemu uczestnikowi ręcznie ponowić próbę, dopóki sesja pozostaje otwarta.

**Ograniczenia:** Usunięcie surowej transkrypcji po sesji ogranicza ryzyko przechowywania danych, ale nie gwarantuje poprawności propozycji AI. Nie zastępuje też obowiązków zespołu dotyczących poinformowania uczestników spotkania.

**Lista kontrolna weryfikacji:** Dla każdej karty należy udowodnić spełnienie kryteriów, uruchomić testy niezmienników N1–N7, sprawdzić dostęp na co najmniej dwóch kontach, sprawdzić brak sekretów i prawdziwych danych w zmianach oraz potwierdzić, że testy nie wysyłają danych do płatnych usług. Weryfikator sprawdza również, że nie doszło do zmian poza kartą.

**Bramka prawdziwych danych:** Przed pierwszym prawdziwym spotkaniem właściciel projektu potwierdza osobne środowisko produkcyjne i klucze, region każdej usługi, test dostępu dwóch kont, informację dla uczestników o transkrypcji i AI, sposób zgłoszenia usunięcia danych, okres retencji, listę usług przetwarzających dane oraz konsultację z osobą odpowiedzialną za ochronę danych. Bez przejścia bramki wolno używać tylko danych fikcyjnych.

## 8. Założenia techniczne

Kierunek: aplikacja webowa z logowaniem, bazą danych i przetwarzaniem po stronie serwera, ponieważ wynik spotkania ma być dostępny dla różnych osób według ich roli. Interfejs i komunikaty są po polsku. Aplikacja nie buduje własnego mechanizmu haseł ani nie przechowuje ich samodzielnie.

Faza A wybierze usługi oraz potwierdzi ich aktualne limity, regiony, obsługę bota i transkrypcji w Element, koszty, sposób bezpiecznego przekazania audio i tekstu do przetwarzania, sposób zmian struktury danych oraz zgodność z wymaganiami P2. Faza A ma też potwierdzić techniczną możliwość pozyskania dźwięku i listy obecności przez bota, uwierzytelnionego importu oraz usuwania nagrań po 30 dniach.

Jeśli bot w docelowym środowisku Element nie może pozyskać dźwięku lub zweryfikowanej listy obecności, przed rozpoczęciem F02 trzeba uzgodnić inne źródło importu.

## 9. Wymagania ogólne

Kierunek wyglądu opisuje [DESIGN.md](../DESIGN.md). Układ, nazwy i miejsca głównych akcji wynikają z [aktualnego prototypu](../meetly-prototyp.html) i [głównej ścieżki w sekcji 5](#5-ekrany-i-ścieżki). Interfejs używa tekstu co najmniej 16 px, kontrastu WCAG AA i elementów klikalnych o wymiarze co najmniej 44 × 44 px. Meetly pokazuje stan importu i ewentualny błąd osobie uprawnionej. Komunikaty błędów są po polsku i nie ujawniają treści spotkania ani danych konta. Przy braku połączenia aplikacja nie oznacza transkrypcji ani wyniku jako gotowych.

## 10. Funkcje

| ID | Funkcja | Priorytet | Złożoność → poziom | Zależy od | Karta |
|---|---|---|---|---|---|
| F00 | Fundament i zabezpieczenia | MVP-1 | wysoka → Wysoki | — | docs/funkcje/F00-fundament.md |
| F01 | Logowanie i role zespołu | MVP-1 | wysoka → Wysoki | F00 | docs/funkcje/F01-logowanie-role.md |
| F02 | Import spotkania z Element | MVP-1 | wysoka → Wysoki | F01 | docs/funkcje/F02-import-spotkania-z-element.md |
| F03 | Wynik spotkania proponowany przez AI | MVP-1 | wysoka → Wysoki | F02 | docs/funkcje/F03-wynik-spotkania-ai.md |
| F04 | Widoki wyników zależne od roli | MVP-1 | wysoka → Wysoki | F01, F03 | docs/funkcje/F04-widoki-wedlug-roli.md |
| F05 | Historia zadań i raport tygodniowy | MVP-1 | wysoka → Wysoki | F04 | docs/funkcje/F05-historia-zadan-raport.md |

## 11. Decyzje i założenia

- DEC-1 · 05.11.2026: Nazwa aplikacji to Meetly — źródło: właściciel projektu.
- DEC-2 · 18.11.2026: Spotkania odbywają się w Element. Inicjator sprawdza komplet uczestników i mówi „bot start”. Bot zapisuje listę połączonych kont i zaczyna nagrywanie. „Bot stop” lub koniec rozmowy kończy nagranie. Bot przekazuje Meetly listę i transkrypcję.
- DEC-3 · 24.11.2026: Aktualny dostęp do zatwierdzonego spotkania wynika z zachowanego dostępu uczestnika z listy „bot start”, jawnego nadania lub przypisania co najmniej jednego zadania z tego spotkania. Przypisanie nadaje dostęp przy zatwierdzeniu, niezależnie od roli. Po usunięciu ostatniego przypisanego zadania wygasa dostęp wynikający z przypisania. Pozostałe podstawy dostępu zachowują ważność. Programista i analityk widzą własne zadania na liście. Wyjątek dla inicjatora w szczegółach opisuje DEC-12.
- DEC-4 · 05.11.2026: Pierwsza wersja służy jednemu małemu zespołowi; wiele zespołów jest później — źródło: właściciel projektu.
- DEC-5 · 24.11.2026: Każdy zweryfikowany uczestnik z listy „bot start” może otworzyć szkic, poprawić podsumowanie, zadania, przypisania i listę dostępu oraz zatwierdzić wynik. Pierwsze skuteczne zatwierdzenie zapisuje wynik i zadania raz oraz zamyka szkic we wszystkich kolejkach. Przy ponownym imporcie obowiązuje zakres uprawnień z DEC-12. Robocza transkrypcja podlega N3.
- DEC-6 · 18.11.2026: Nagranie pozostaje na chronionym dysku i jest automatycznie usuwane po 30 dniach. Meetly usuwa transkrypcję po zatwierdzeniu lub porzuceniu wyniku.
- DEC-7 · 05.11.2026: Termin zadania jest opcjonalny; zadanie może opisywać zmianę do wykonania w bieżącej pracy osoby — źródło: właściciel projektu.
- DEC-8 · 24.11.2026: PM i dyrektor widzą wyniki i zadania tylko z dostępnych spotkań. Raporty stosują aktualny dostęp także dla minionych tygodni. Ręczne zadania zespołu pozostają widoczne.
- DEC-9 · 05.11.2026: Interfejs pierwszej wersji jest po polsku — źródło: język rozmowy z właścicielem projektu.
- DEC-10 · 05.11.2026: Meetly przechowuje historię zatwierdzonych wyników i zadań; PM może ręcznie dodać wykonane zadanie oraz zamykać lub ponownie otwierać zadania. Raport tygodniowy pokazuje zamknięte i otwarte zadania według osób — źródło: właściciel projektu. Zmienia zakres MVP z wersji 1.
- DEC-11 · 24.11.2026: Meetly usuwa spotkania po 6 miesiącach kalendarzowych od zakończenia. Tylko uczestnik z listy „bot start” i z aktualnym dostępem może zmienić listę dostępu lub wcześniej usunąć spotkanie po potwierdzeniu. Usunięcie obejmuje wynik, zadania i historię ich zmian. Historia spotkań ma filtr słów, zakres dat i filtr wieku w dniach, tygodniach lub miesiącach.
- DEC-12 · 24.11.2026: Każdy członek zespołu może zainicjować spotkanie. Inicjator z dostępem widzi wszystkie zadania w szczegółach swojego spotkania. Dopóki nagranie jest dostępne, jawny ponowny import może zlecić zweryfikowany uczestnik z listy „bot start”, który miał dostęp w chwili usunięcia spotkania. Nowy szkic trafia tylko do takich uczestników. Każdy z nich może go edytować i zatwierdzić. Ponowienie tego samego dostarczenia nie odtwarza usuniętego spotkania.
- DEC-13 · 24.11.2026: PM i wykonawca mogą usunąć zadanie po potwierdzeniu. Dla zadania ze spotkania wykonawca operacji musi mieć aktualny dostęp do spotkania. Usunięcie obejmuje wszystkie widoki i historię zadania. Utrata skutecznego dostępu odbiera odczyt wszystkich zadań z danego spotkania.
- A1: Inicjator informuje uczestników o nagrywaniu, transkrypcji i AI przed komendą „bot start”.
- A2: Tytuł spotkania ma od 1 do 120 znaków. Źródło tytułu potwierdza Faza A.
- A3: Gdy AI nie przypisze zadania pewnie do konta, tworzy temat do wyjaśnienia zamiast zadania bez właściciela — szczegół wykonawczy do F03.
- A4: Raport tygodniowy domyślnie pokazuje bieżący tydzień kalendarzowy od poniedziałku do niedzieli; PM może wybrać wcześniejszy tydzień — szczegół wykonawczy do F05.

## 12. Pytania otwarte i ryzyka

- Q4: Jak długo bot lub usługa transkrypcji przechowują własną kopię tekstu? — decyzja przed bramką prawdziwych danych.

- Q1: W jaki sposób członek zespołu zgłasza usunięcie swoich danych? — blokuje: użycie prawdziwych danych — odpowiedź: właściciel projektu przed bramką prawdziwych danych.
- Q2: Jak bot pozyskuje listę połączonych kont w docelowym Element i jak integracja wiąże spotkanie oraz inicjatora z Meetly? — do potwierdzenia w Fazie A.
- Q5: Jak ma działać jawne odebranie dostępu, gdy osoba nadal ma przypisane zadanie z tego spotkania? — decyzja właściciela przed zatwierdzeniem polityk dostępu.
- R1: Brakuje testu ścieżki z Element z użytkownikami. Nie wiadomo jeszcze, czy role i prezentacja wyników są zrozumiałe — ograniczenie: test na kilku członkach zespołu po demonstratorze.
- R2: Integracja musi potwierdzić dostęp bota do zdarzeń połączenia i audio oraz usuwanie nagrań po 30 dniach — test z fikcyjnymi kontami w Fazie A.
- R3: AI może pominąć decyzję lub przypisać zadanie niewłaściwej osobie — ograniczenie: zatwierdzający uczestnik sprawdza wynik, a niepewne przypisanie staje się tematem do wyjaśnienia.
- R4: Użycie prawdziwych treści spotkań bez ustalenia zasad prywatności stwarza ryzyko dla zespołu — ograniczenie: bramka prawdziwych danych i P2.

## 13. Jak budować z tą specyfikacją

**Zadania właściciela poza kodem:** przed Fazą A potwierdź docelową konfigurację Element i bota (Q2). Przed pierwszym prawdziwym spotkaniem ustal sposób zgłaszania usunięcia danych (Q1), potwierdź informacje dla uczestników oraz przejdź bramkę prawdziwych danych z sekcji 7. Przed publikacją skonfiguruj produkcyjne środowisko i klucze poza repozytorium.

**Faza A — plan techniczny, poziom Najwyższy:** agent czyta `AGENTS.md`, tę specyfikację i wszystkie karty, weryfikuje P2 oraz aktualną dokumentację usług, po czym tworzy `docs/plan.md`. Nie pisze kodu.

**Faza B — budowa funkcji, poziom Wysoki:** jedna karta w jednej sesji. Agent buduje tylko kartę, aktualizuje plan i README, uruchamia testy oraz robi commit karty.

**Faza C — weryfikacja, poziom Najwyższy:** inna sesja sprawdza każde kryterium, niezmienniki i zakres karty, bez poprawiania kodu. Raport zapisuje w `docs/weryfikacja/Fxx.md`.

```
Faza A · poziom Najwyższy
Przeczytaj AGENTS.md, docs/specyfikacja.md i wszystkie karty w docs/funkcje/. Zacznij od przeglądu specyfikacji (PASS / WARNING / FAIL) oraz sprawdź aktualną dokumentację usług potrzebnych do logowania, bezpiecznego przechowywania danych, integracji z Element, transkrypcji i AI. Następnie przygotuj docs/plan.md. Nie pisz kodu. Wypisz pytania blokujące na końcu planu i zatrzymaj się.
```

```
Faza B · poziom Wysoki
Zbuduj funkcję Fxx według jej pliku w docs/funkcje/ i części Fxx w docs/plan.md. Przestrzegaj AGENTS.md. Zacznij od planu w 3–5 punktach.
```

```
Faza C · poziom Najwyższy
Zweryfikuj funkcję Fxx. Przeczytaj AGENTS.md, jej kartę, sekcję 7 docs/specyfikacja.md, zmiany z commita Fxx oraz wnioski w docs/plan.md. Sprawdź każde kryterium, niezmienniki i listę kontrolną. Nie poprawiaj kodu. Zapisz raport PASS / WARNING / FAIL w docs/weryfikacja/Fxx.md.
```

**Zawartość repozytorium po MVP:**

| Element | Ścieżka | Powstaje | Kryterium |
|---|---|---|---|
| README | `README.md` | teraz, aktualizowany w Fazie B | opis, stan kart i brak sekretów |
| Specyfikacja i karty | `docs/specyfikacja.md`, `docs/funkcje/` | teraz | aktualna wersja i karta dla każdej funkcji |
| Zasady dla agentów | `AGENTS.md`, `CLAUDE.md` | teraz | zasady P2 i odwołania do dokumentacji |
| Materiały wejściowe | prototyp, transkrypcje demonstracyjne i wnioski z testów | teraz | przykłady fikcyjne, obserwacje oddzielone od wniosków |
| Plan techniczny | `docs/plan.md` | Faza A | statusy, kroki, ryzyka, „Później” i „Następny krok” |
| Raporty weryfikacji | `docs/weryfikacja/` | Faza C | dowody kryteriów każdej karty |
| Kod i testy | zgodnie z planem | Faza B | testy uruchamiane jednym poleceniem |
| Konfiguracja | `.gitignore`, `.env.example` | reguły ignorowania teraz, szablon w F00 | brak sekretów i prawdziwych danych |

W repozytorium ani historii Git nie wolno umieszczać `.env`, kluczy, haseł, prawdziwych nagrań, transkrypcji, eksportów ani danych osób.
