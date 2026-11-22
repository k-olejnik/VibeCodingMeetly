# Specyfikacja MVP: Meetly

Wersja 5 · ustalenia po teście symulowanym z 22 listopada 2026 r.

[SPEC.md](../SPEC.md) przedstawia tę wersję w formacie kursowym. Ten dokument rozwija model danych, ochronę danych i kryteria techniczne.

## 1. Cel i użytkownicy

Meetly pomaga małemu zespołowi zamknąć spotkanie jasnym zestawem ustaleń. Bot w Element nagrywa spotkanie i dostarcza transkrypcję oraz listę uczestników. Meetly proponuje skrót, decyzje, zadania i tematy do wyjaśnienia. Inicjator zatwierdza wynik. Historia i raport tygodniowy pomagają PM śledzić zadania. MVP obejmuje jeden mały zespół.

## 2. Co pokazały testy

Wcześniejszy prototyp z transkrypcją w Meetly ma notatki autorki, test jednego uczestnika i oddzielnie oznaczoną symulację agenta. Na obecnej ścieżce z Element brak udokumentowanego testu z użytkownikami. Scenariusz znajduje się w [planie testu](../plan-testu-element.md), a niesprawdzone założenia w sekcji 12.

## 3. Zakres MVP

**Główna ścieżka MVP:** inicjator sprawdza obecność w Element → „bot start” → bot zapisuje listę połączonych kont i nagrywa → „bot stop” lub koniec rozmowy → bot dostarcza transkrypcję i listę → Meetly proponuje wynik → inicjator zatwierdza → uczestnicy, PM i dyrektor mają dostęp zgodnie z sekcją 4.

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
| PM | Wszystkie zatwierdzone spotkania i wyniki, wszystkie zadania i raporty tygodniowe | Ręczne zadanie, wynik zainicjowanego spotkania | Własny szkic wyniku i stan każdego zadania | Pojedyncze zadanie oraz spotkania, w których uczestniczył i do których ma dostęp |
| Dyrektor | Wszystkie zatwierdzone spotkania i wyniki, wszystkie zadania i raporty w trybie odczytu | Wynik zainicjowanego spotkania | Własny szkic wyniku | Spotkania, w których uczestniczył i do których ma dostęp |
| Programista | Zatwierdzone spotkania, do których ma dostęp, oraz własne zadania | Wynik zainicjowanego spotkania | Własny szkic wyniku | Spotkania, w których uczestniczył i do których ma dostęp |
| Analityk | Zatwierdzone spotkania, do których ma dostęp, oraz własne zadania | Wynik zainicjowanego spotkania | Własny szkic wyniku | Spotkania, w których uczestniczył i do których ma dostęp |

Dostęp dla uczestników ustala zapis kont połączonych w chwili „bot start”. Rozłączenie po starcie nie odbiera dostępu. Dostęp do spotkania mogą zmieniać uczestnicy z listy startowej, którzy mają do niego dostęp, oraz PM i dyrektor. Użytkownik spoza listy startowej, któremu przyznano dostęp, uzyskuje prawo odczytu. PM i dyrektor mają dostęp wynikający z roli. Odebranie skutecznego dostępu do spotkania odbiera również dostęp do jego zadań. Wykonawca z aktualnym dostępem może usunąć własne zadanie, a PM może usunąć dowolne. Serwer egzekwuje te reguły także przy odczycie bezpośrednim.

Każdy członek zespołu może zainicjować spotkanie. Inicjator to uczestnik, który rozpoczął spotkanie, i może zatwierdzić szkic tego spotkania. W szczegółach zainicjowanego spotkania widzi wszystkie zadania, jeśli nadal ma dostęp do wyniku.

Rola jest przypisana do konta przez właściciela projektu poza interfejsem MVP. Aplikacja nie ma w pierwszej wersji ekranu zarządzania rolami.

## 5. Ekrany i ścieżki

| ID | Ekran | Rola | Z prototypu | Funkcje |
|---|---|---|---|---|
| E1 | Logowanie | wszyscy | nowy | F01 |
| E2 | Przegląd / Mój widok | wszyscy, zawartość zależna od roli | tak | F04 |
| — | Import z Element | inicjator, kolejka własnych szkiców | symulacja | F02, F03 |
| E5 | Wynik spotkania do zatwierdzenia | osoba inicjująca spotkanie | tak | F03 |
| E6 | Zatwierdzony wynik spotkania | uczestnicy i inne osoby uprawnione, PM, dyrektor | tak | F04 |
| E7 | Historia zadań i raport tygodniowy | PM; dyrektor tylko do odczytu | demonstracyjny raport | F05 |

Główna ścieżka: spotkanie odbywa się w Element. Po imporcie inicjator otwiera szkic w E5. Po zatwierdzeniu E2 zawiera historię dostępnych spotkań z filtrami oraz zadania, E6 pokazuje zatwierdzony wynik zgodnie z uprawnieniami, a E7 służy do historii zadań i raportu.

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
| tytuł | opis spotkania | tekst, do 120 znaków | tak | „Planowanie wydania” | może zawierać dane osobowe lub poufne | inicjator | inicjator; po zatwierdzeniu osoby z dostępem, PM i dyrektor |
| inicjator | osoba uprawniona do zatwierdzenia szkicu | odwołanie do Konta | tak przed zatwierdzeniem | „Programista A” | osobowe | mechanizm ustalany w Fazie A | zgodnie z dostępem do spotkania |
| rozpoczęto | czas uruchomienia | data i godzina | tak | 05.11.2026, 10:00 | zwykłe | aplikacja | inicjator, PM, dyrektor |
| zakończono | czas zamknięcia | data i godzina | nie, do końca sesji | 05.11.2026, 10:35 | zwykłe | aplikacja | inicjator, PM, dyrektor |
| status | etap importu i wyniku | wybór: przetwarzanie, do zatwierdzenia, zatwierdzone, odrzucone | tak | zatwierdzone | zwykłe | aplikacja i inicjator | według uprawnień |

Spotkanie przechowuje identyfikator importu, listę kont obecnych w chwili startu oraz aktualną listę dostępu inicjalizowaną z tej listy. Mapowanie identyfikatora Matrix na konto Meetly jest jednoznaczne i sprawdzane po stronie serwera. Brak mapowania nie nadaje dostępu.

### Przejściowa transkrypcja

Tekst przekazany przez bota po zakończeniu nagrania. Służy do wygenerowania szkicu i podlega ochronie P2.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| treść transkrypcji | tekst nagranego fragmentu | tekst | tak do wygenerowania szkicu | „Ustalmy zakres wydania.” | P2 | bot | inicjator przed zatwierdzeniem oraz proces generowania |


Meetly usuwa roboczą transkrypcję po zatwierdzeniu lub porzuceniu wyniku.

Historia wyszukuje słowa w tytułach i zatwierdzonych podsumowaniach dostępnych spotkań. Pola „Od” i „Do” są niezależne i obejmują wskazane dni. „Starsze niż” przyjmuje dodatnią liczbę całkowitą i jednostkę: dni, tygodnie lub miesiące. Filtry daty i wieku stosuje się do daty zakończenia spotkania. Wypełnione filtry działają łącznie.

### Wynik spotkania

Zatwierdzony rezultat, który zastępuje transkrypcję w historii aplikacji. Meetly automatycznie usuwa spotkanie i jego wynik po 6 miesiącach kalendarzowych od zakończenia spotkania. Uczestnik z listy obecności przy „bot start” i z aktualnym dostępem może usunąć je wcześniej. Potwierdzenie ma treść „Czy na pewno chcesz usunąć spotkanie?”. Serwer sprawdza uczestnictwo i dostęp przed wykonaniem operacji. Usunięcie dotyczy wszystkich użytkowników i obejmuje wynik, zadania pochodzące ze spotkania oraz historię ich zmian. Źródłowe nagranie pozostaje na chronionym dysku zgodnie z retencją 30 dni. Jeśli nadal istnieje, można jawnie zlecić ponowny import jako nowy szkic do zatwierdzenia. Pierwotne edycje i przypisania trzeba w takim szkicu sprawdzić ponownie. Mechanizm ponownego importu jest do ustalenia w Fazie A.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| skrót | zwięzły opis ustaleń | tekst | tak po zatwierdzeniu | „Zespół ustalił zakres wydania.” | P2: może zawierać treści służbowe | AI proponuje, inicjator zatwierdza | osoby z dostępem do spotkania, PM i dyrektor |
| decyzje | lista podjętych decyzji | lista tekstów | tak, może być pusta | „Wydanie w piątek.” | P2 | AI proponuje, inicjator zatwierdza | osoby z dostępem do spotkania, PM i dyrektor |
| tematy do wyjaśnienia | nierozstrzygnięte pytania | lista tekstów | tak, może być pusta | „Kto zatwierdza komunikację?” | P2 | AI proponuje, inicjator zatwierdza | osoby z dostępem do spotkania, PM i dyrektor |

### Zadanie

Pozycja wynikająca ze spotkania. Opis może oznaczać nowe działanie albo zmianę w pracy osoby przypisanej.

| Pole | Znaczenie | Typ | Wymagane | Przykład fikcyjny | Kategoria danych | Kto ustawia | Kto widzi |
|---|---|---|---|---|---|---|---|
| treść | co ma zrobić lub zmienić osoba | tekst, do 500 znaków | tak | „Uzupełnij opis scenariusza logowania.” | P2: może zawierać dane służbowe | AI proponuje, inicjator zatwierdza | przypisana osoba, PM, dyrektor |
| osoba odpowiedzialna | konto wykonujące zadanie | odwołanie do Konta | tak | „Analityk A” | osobowe | AI proponuje, inicjator zatwierdza | przypisana osoba, PM, dyrektor |
| termin | data wykonania, jeśli padła na spotkaniu | data | nie | 07.11.2026 | zwykłe | AI proponuje, inicjator zatwierdza | przypisana osoba, PM, dyrektor |
| źródło | skąd pochodzi zadanie | wybór: spotkanie, dodane ręcznie przez PM | tak | spotkanie | pośrednio P2 | aplikacja albo PM | przypisana osoba, PM, dyrektor |
| spotkanie | źródłowa sesja, jeśli zadanie powstało ze spotkania | odwołanie do Spotkania | nie | „Planowanie wydania” | pośrednio P2 | aplikacja | przypisana osoba z dostępem do spotkania, PM, dyrektor |
| stan | aktualny etap zadania | wybór: otwarte, zamknięte | tak | otwarte | zwykłe | aplikacja przy utworzeniu; PM później | przypisana osoba, PM, dyrektor |

Nie powstaje zadanie bez wskazanej osoby odpowiedzialnej. AI ma wtedy dodać sprawę do „tematów do wyjaśnienia”. PM może dodać ręcznie zadanie już wykonane, wskazując osobę odpowiedzialną; jego źródłem jest wtedy „dodane ręcznie przez PM”. PM lub osoba przypisana do zadania z aktualnym dostępem do spotkania może usunąć je po potwierdzeniu. Usunięcie obejmuje wszystkie profile, szczegóły spotkania i raporty oraz historię zmian tego zadania. Jeśli kolejne spotkanie zmieniło zadanie, człowiek może usunąć poprzednią pozycję i zachować nową. Import i AI nie zastępują zadań automatycznie. Po odebraniu dostępu do spotkania zadanie znika z widoków tej osoby, a serwer odrzuca bezpośredni odczyt i próbę jego usunięcia. Rekord pozostaje dostępny dla pozostałych uprawnionych. Tryb zgłaszania usunięcia danych pozostaje do ustalenia (Q1). Usunięcie spotkania usuwa zadania pochodzące z tego spotkania i historię ich zmian. Ręczne zadania PM mają osobne źródło.

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

- N1: Programista i analityk widzą zatwierdzony wynik wyłącznie przy dostępie do spotkania i widzą na listach wyłącznie własne zadania ze spotkań, do których mają dostęp. W szczegółach zainicjowanego spotkania inicjator z dostępem widzi wszystkie zadania tego spotkania. Test obejmuje listę spotkań i bezpośredni odczyt po stronie serwera.
- N2: PM i dyrektor widzą wszystkie zatwierdzone wyniki oraz zadania zespołu — test kont roli PM i dyrektora.
- N3: Surowa transkrypcja robocza jest dostępna wyłącznie dla inicjatora przed zatwierdzeniem oraz dla procesu generowania szkicu.
- N4: AI nie publikuje ani nie nadpisuje wyniku; zapis następuje wyłącznie po zatwierdzeniu przez inicjatora — test.
- N5: Meetly usuwa transkrypcję po zatwierdzeniu lub porzuceniu wyniku. Nagranie pozostaje na chronionym dysku integracji i jest automatycznie usuwane po 30 dniach.
- N6: Treść spotkań, e-maile i dane logowania nie trafiają do logów, komunikatów błędów, adresów URL ani nazw plików — przegląd testów i zmienionych plików.
- N7: Tylko PM może dodać ręczne zadanie lub zmienić stan zadania. Zatwierdzone zadanie może usunąć PM albo wykonawca mający dostęp do spotkania źródłowego. Każda zmiana stanu tworzy historię. Test obejmuje konto PM i pozostałe role.

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

**Funkcje z modelem AI:** Do AI trafiają tylko: przejściowa transkrypcja nagrania, tytuł spotkania oraz imiona wyświetlane i role uczestników konieczne do przypisania zadania. Nie trafiają: e-maile, identyfikatory Matrix i Meetly, historia innych spotkań ani dane poza aktywną sesją. Test z wartością `ZNACZNIK_EMAIL` w polu e-mail musi potwierdzać, że nie występuje w zapytaniu do AI. Odpowiedź AI ma ustalony format: skrót, decyzje, zadania z przypisaną osobą i opcjonalnym terminem oraz tematy do wyjaśnienia. Aplikacja sprawdza format odpowiedzi przed pokazaniem jej inicjatorowi. AI jedynie proponuje treść; człowiek zatwierdza i może poprawić każdy element. Koszt jednego użycia, limit na użytkownika oraz limit budżetu są do sprawdzenia w Fazie A. Przy błędzie AI aplikacja nie zapisuje wyniku, pokazuje zrozumiały komunikat i pozwala inicjatorowi ręcznie ponowić próbę, dopóki sesja pozostaje otwarta.

**Ograniczenia:** Usunięcie surowej transkrypcji po sesji ogranicza ryzyko przechowywania danych, ale nie gwarantuje poprawności propozycji AI. Nie zastępuje też obowiązków zespołu dotyczących poinformowania uczestników spotkania.

**Lista kontrolna weryfikacji:** Dla każdej karty należy udowodnić spełnienie kryteriów, uruchomić testy niezmienników N1–N7, sprawdzić dostęp na co najmniej dwóch kontach, sprawdzić brak sekretów i prawdziwych danych w zmianach oraz potwierdzić, że testy nie wysyłają danych do płatnych usług. Weryfikator sprawdza również, że nie doszło do zmian poza kartą.

**Bramka prawdziwych danych:** Przed pierwszym prawdziwym spotkaniem właściciel projektu potwierdza osobne środowisko produkcyjne i klucze, region każdej usługi, test dostępu dwóch kont, informację dla uczestników o transkrypcji i AI, sposób zgłoszenia usunięcia danych, okres retencji, listę usług przetwarzających dane oraz konsultację z osobą odpowiedzialną za ochronę danych. Bez przejścia bramki wolno używać tylko danych fikcyjnych.

## 8. Założenia techniczne

Kierunek: aplikacja webowa z logowaniem, bazą danych i przetwarzaniem po stronie serwera, ponieważ wynik spotkania ma być dostępny dla różnych osób według ich roli. Interfejs i komunikaty są po polsku. Aplikacja nie buduje własnego mechanizmu haseł ani nie przechowuje ich samodzielnie.

Faza A wybierze usługi oraz potwierdzi ich aktualne limity, regiony, obsługę bota i transkrypcji w Element, koszty, sposób bezpiecznego przekazania audio i tekstu do przetwarzania, sposób zmian struktury danych oraz zgodność z wymaganiami P2. Faza A ma też potwierdzić techniczną możliwość pozyskania dźwięku i listy obecności przez bota, uwierzytelnionego importu oraz usuwania nagrań po 30 dniach.

## 9. Wymagania ogólne

Kierunek wyglądu opisuje [DESIGN.md](../DESIGN.md). Układ, nazwy i miejsca głównych akcji wynikają z [aktualnego prototypu](../meetly-prototyp.html) i ścieżki w [SPEC.md](../SPEC.md). Interfejs używa tekstu co najmniej 16 px, kontrastu WCAG AA i elementów klikalnych o wymiarze co najmniej 44 × 44 px. Meetly pokazuje stan importu i ewentualny błąd osobie uprawnionej. Komunikaty błędów są po polsku i nie ujawniają treści spotkania ani danych konta. Przy braku połączenia aplikacja nie oznacza transkrypcji ani wyniku jako gotowych.

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
- DEC-3 · 18.11.2026: Domyślnie spotkanie widzą osoby połączone w chwili „bot start”. Dostęp do konkretnego spotkania można zmienić w Meetly. PM i dyrektor widzą wszystkie zatwierdzone spotkania. Programista i analityk widzą własne zadania na liście. Wyjątek w szczegółach opisuje DEC-12.
- DEC-4 · 05.11.2026: Pierwsza wersja służy jednemu małemu zespołowi; wiele zespołów jest później — źródło: właściciel projektu.
- DEC-5 · 18.11.2026: Inicjator przegląda, poprawia i zatwierdza szkic wyniku w Meetly.
- DEC-6 · 18.11.2026: Nagranie pozostaje na chronionym dysku i jest automatycznie usuwane po 30 dniach. Meetly usuwa transkrypcję po zatwierdzeniu lub porzuceniu wyniku.
- DEC-7 · 05.11.2026: Termin zadania jest opcjonalny; zadanie może opisywać zmianę do wykonania w bieżącej pracy osoby — źródło: właściciel projektu.
- DEC-8 · 05.11.2026: Dyrektor początkowo widzi całość wyników oraz wszystkie zadania; później zdecyduje, które informacje są dla niego istotne — źródło: właściciel projektu.
- DEC-9 · 05.11.2026: Interfejs pierwszej wersji jest po polsku — źródło: język rozmowy z właścicielem projektu.
- DEC-10 · 05.11.2026: Meetly przechowuje historię zatwierdzonych wyników i zadań; PM może ręcznie dodać wykonane zadanie oraz zamykać lub ponownie otwierać zadania. Raport tygodniowy pokazuje zamknięte i otwarte zadania według osób — źródło: właściciel projektu. Zmienia zakres MVP z wersji 1.
- DEC-11 · 18.11.2026: Spotkania w Meetly są dostępne przez 6 miesięcy. Uczestnik z listy obecności i z aktualnym dostępem może je usunąć wcześniej po potwierdzeniu. Usunięcie obejmuje wynik, zadania ze spotkania i historię ich zmian. Uczestnik danego spotkania, PM i dyrektor mogą zmieniać jego listę dostępu. Historia spotkań ma filtr słów, dat od i do oraz filtr wieku w dniach, tygodniach lub miesiącach.
- DEC-12 · 22.11.2026: Każdy członek zespołu może zainicjować spotkanie. Inicjator z dostępem widzi wszystkie zadania w szczegółach swojego spotkania. Po usunięciu zadania znika ono u wszystkich. Jeżeli spotkanie usunięto przez przypadek, nagranie z chronionego dysku można ponownie zaimportować do upływu jego retencji.
- DEC-13 · 22.11.2026: PM i przypisana osoba z dostępem mogą usunąć zadanie dla wszystkich po potwierdzeniu. Odebranie dostępu do spotkania odbiera dostęp do wszystkich jego zadań tej osobie.
- A1: Inicjator informuje uczestników o nagrywaniu, transkrypcji i AI przed komendą „bot start”.
- A2: Tytuł spotkania ma od 1 do 120 znaków. Źródło tytułu potwierdza Faza A.
- A3: Gdy AI nie przypisze zadania pewnie do konta, tworzy temat do wyjaśnienia zamiast zadania bez właściciela — szczegół wykonawczy do F03.
- A4: Raport tygodniowy domyślnie pokazuje bieżący tydzień kalendarzowy od poniedziałku do niedzieli; PM może wybrać wcześniejszy tydzień — szczegół wykonawczy do F05.

## 12. Pytania otwarte i ryzyka

- Q4: Jak długo bot lub usługa transkrypcji przechowują własną kopię tekstu? — decyzja przed bramką prawdziwych danych.

- Q1: W jaki sposób członek zespołu zgłasza usunięcie swoich danych? — blokuje: użycie prawdziwych danych — odpowiedź: właściciel projektu przed bramką prawdziwych danych.
- Q2: Jak bot pozyskuje listę połączonych kont w docelowym Element i jak integracja wiąże spotkanie oraz inicjatora z Meetly? — do potwierdzenia w Fazie A.
- R1: Brakuje testu ścieżki z Element z użytkownikami. Nie wiadomo jeszcze, czy role i prezentacja wyników są zrozumiałe — ograniczenie: test na kilku członkach zespołu po demonstratorze.
- R2: Integracja musi potwierdzić dostęp bota do zdarzeń połączenia i audio oraz usuwanie nagrań po 30 dniach — test z fikcyjnymi kontami w Fazie A.
- R3: AI może pominąć decyzję lub przypisać zadanie niewłaściwej osobie — ograniczenie: inicjator sprawdza wynik, a niepewne przypisanie staje się tematem do wyjaśnienia.
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
| Plan techniczny | `docs/plan.md` | Faza A | statusy, kroki, ryzyka, „Później” i „Następny krok” |
| Raporty weryfikacji | `docs/weryfikacja/` | Faza C | dowody kryteriów każdej karty |
| Kod i testy | zgodnie z planem | Faza B | testy uruchamiane jednym poleceniem |
| Konfiguracja | `.env.example`, `.gitignore` | F00 | brak sekretów i danych prawdziwych |

W repozytorium ani historii Git nie wolno umieszczać `.env`, kluczy, haseł, prawdziwych nagrań, transkrypcji, eksportów ani danych osób.
