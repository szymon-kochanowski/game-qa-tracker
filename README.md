# Game QA Regression Tracker

> **High-Performance Regression Suite & Operations Middleware for Game Development QA**  
> Designed and Developed by **Szymon Kochanowski** • Licensed under the **MIT License**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🇬🇧 English Overview

### The Problem
During game development regression passes (pre-milestone, certification, and release candidates), QA departments face severe operational bottlenecks:
- Jira ticket queues grow into hundreds of simultaneous verification tasks across disparate build configurations.
- Multi-platform testing (**PC, PlayStation 5, Xbox Series X|S, Nintendo Switch 2**) creates redundant effort when testers inadvertently verify cross-platform issues on multiple DevKits.
- Manual spreadsheet tracking leads to lost build tags, stale verification comments, and human error during evening sign-offs.

### The Solution: Game QA Tracker
**Game QA Tracker** is a production-grade regression workflow tool built specifically for game studio QA teams. It acts as an operational middleware bridging Jira and daily testing operations, eliminating repetitive manual data entry through rule-based automations and instantaneous synchronization.

---

### Key Architectural Capabilities

#### 1. Regex Bug Triage Engine (`guessBugTypeFromSummary`)
When tickets are imported from Jira CSV exports or added manually, an ordered regex triage analyzer parses ticket titles and auto-classifies them into eight core game QA domains:
- **Stability** (`crash`, `fatal error`, `softlock`, `memory leak`, `hang`) &rarr; Auto-targeted for **All Platforms**
- **Visual** (`texture`, `clipping`, `lighting`, `lod`, `z-fighting`) &rarr; Auto-targeted for **PS5 or XSX** + PC
- **Gameplay** (`collision`, `oob`, `hitbox`, `quest`, `mechanic`) &rarr; Auto-targeted for **Any Console** + PC
- **Localization** (`translation`, `typo`, `unlocalized`, `grammar`, `l10n`) &rarr; Auto-targeted for **Any Console** + PC
- **Achievements** (`trophy`, `gamerscore`, `badge`, `unlock`) &rarr; Auto-targeted for **PC, PS5, XSX** (Switch 2 set to *N/A*)
- **UI/UX, Audio, and Settings** &rarr; Contextually distributed across target SDKs

#### 2. Console Mutual Exclusivity Automation (`applyConsoleExclusivity`)
To prevent team members from testing the same issue on different consoles simultaneously:
- When a tester sets a console target (e.g., PS5) to **`In Progress`**, the system automatically sets conflicting console targets (`PS5 or XSX` or `Any Console`) to **`N/A`**.
- Saves hundreds of hours of redundant console DevKit testing time across every milestone.

#### 3. Auto-Handoff & Reverser Pipeline (`evaluateAutoHandoff`)
- As soon as all required platforms for a ticket reach a terminal status (`Fixed`, `Occurs`, `Blocked`, or `N/A`), the bug’s overall status automatically advances to **`To Be Reviewed`**.
- QA Leads can immediately identify verified tickets ready for sign-off.
- If a tester discovers an anomaly and switches any platform back to testing, the ticket automatically reverts to **`In Progress`**, preventing premature closures.

#### 4. Instant Jira Integration & JQL Generator
- **Jira Comment Generator**: Generates formatted, standardized verification comments mentioning the specific platform, build identifier, and blocking tickets ready for direct paste into Jira.
- **Bulk JQL Query Generator**: One-click generation of `key in (BUG-101, BUG-102, ...)` queries filtered strictly to tickets in `To Be Reviewed` status, enabling fast bulk closure in Jira.

#### 5. Dual-Mode Database: Mock Cloud Bridge & Google Apps Script Sync
- **Local Showcase / Zero-Config Mode**: Out-of-the-box local mode. Clicking *Push to Google Sheet* or *Pull from Sheet* triggers an 800ms simulated REST exchange (`Simulated REST sync with Google Apps Script endpoint`) and updates the sync timestamp.
- **Production Google Sheets Database**: Fully functional Google Apps Script Web App API script included (`GOOGLE_APPS_SCRIPT_TEMPLATE`) utilizing `LockService.getScriptLock()` to guarantee concurrency-safe, transactional multi-user updates.

#### 6. Dynamic Daily Tasks & Branch Registry
- **Branches & DevKit Registry**: Tracks active builds across PC (Steam branches & passwords), PS5 (Neighborhood packages), Xbox Series X (GDK packages), and Switch 2 (Target Manager dev builds).
- **Daily Task Allocation**: Lead assigns testers with dynamic XLOOKUP-style resolution from Branch name to Build Identifier.
- **One-Click Broadcast**: Generates pre-formatted morning messages with `@tester` mentions for Slack, Microsoft Teams, or Discord.

#### 7. End of Day (EoD) Effort Matrix
- Tracks tester attendance (`Active`, `Absent`, `Half-day`, `Sick`).
- Up to 5 task slots per tester categorized into 9 industry standard activities (*Destructive testing, Localization, Focused testing, Regression, Performance*).
- Real-time studio hour roll-up.

---

### Project Structure

```
├── .env.example              # Sample environment configuration
├── .gitignore                # Production ignore rules (includes metadata and studio artifacts)
├── LICENSE                   # MIT License (c) 2026 Szymon Kochanowski
├── package.json              # Clean project definition & dependencies
├── tsconfig.json             # TypeScript 2022 / React JSX configuration
├── vite.config.ts            # Standard Vite configuration with Tailwind CSS v4
├── index.html                # Application entry point with custom typography
└── src/
    ├── types/                # Core TypeScript domain models & interfaces
    ├── services/
    │   ├── triage.ts         # Regex triage engine, console exclusivity, sort weighting
    │   ├── csvParser.ts      # RFC-compliant CSV parser & cross-sprint duplicate detector
    │   ├── storage.ts        # LocalStorage persistence & anonymized team demo roster
    │   ├── googleSheets.ts   # Google Sheets REST bridge & LockService Apps Script template
    │   └── security.ts       # URL sanitization and XSS prevention helpers
    ├── components/
    │   ├── Header.tsx        # Top navigation bar, metrics chip, tools dropdown
    │   ├── RegressionQueue/  # Main regression table with interactive platform badges
    │   ├── DailyTasks/       # Daily task board with automatic build resolution
    │   ├── Branches/         # Game build registry across console DevKits
    │   ├── TaskHours/        # EoD tester effort matrix and category roll-up
    │   ├── CsvImport/        # Jira CSV ingestion engine with live diff preview
    │   ├── Auth/             # 1-click role-switching login modal
    │   ├── LeadPanel/        # Administrative lead panel & Google Sheets config
    │   └── Modals/           # JQL, Jira comment, daily report, and build injector dialogs
    ├── App.tsx               # Main application container and modal state manager
    ├── main.tsx              # React 19 application root
    └── index.css             # Tailwind CSS & theme styling
```

---

### Quick Start & Installation

```bash
# Clone the repository
git clone https://github.com/your-username/game-qa-tracker.git
cd game-qa-tracker

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🇵🇱 Opis w języku polskim

### Kontekst i Geneza Projektu
**Game QA Regression Tracker** to profesjonalne narzędzie inżynierskie stworzone z myślą o zespołach testów regresyjnych gier wideo (FQA / Functionality Quality Assurance). Podczas intensywnych cykli testowych przed certyfikacją i premierą (RC / Gold Candidate) koordynacja pracy na wielu platformach sprzętowych (**PC, PlayStation 5, Xbox Series X, Nintendo Switch 2**) napotyka bariery:
- Arkusze kalkulacyjne szybko stają się nieczytelne, a ręczne wpisywanie numerów kompilacji (CL / build hash) generuje błędy.
- Testerzy marnują setki godzin, weryfikując te same błędy na różnych konsolach, gdy wystarczyłby test na jednej z nich.
- Zamykanie zweryfikowanych zgłoszeń w Jira wymaga czasochłonnego manualnego wyszukiwania.

### Główne Funkcjonalności

1. **Silnik Klasyfikacji Regex (Regex Bug Triage)**  
   Po wklejeniu eksportu CSV z Jira, wbudowane wyrażenia regularne natychmiast kategoryzują zgłoszenia (np. *Stability, Gameplay, Visual, Localization, Achievements*) i przypisują odpowiednią macierz platform docelowych.

2. **Wzajemne Wykluczanie Konsol (Console Mutual Exclusivity)**  
   Oznaczenie błędu jako `In Progress` na jednej z konsol automatycznie przestawia pozostałe alternatywne platformy (`PS5 or XSX` lub `Any Console`) w stan `N/A`, zapobiegając duplikacji pracy w zespole.

3. **Automatyczny Handoff i Reverser**  
   Gdy wszystkie platformy przypisane do błędu zostaną zweryfikowane (`Fixed`, `Occurs`, `Blocked`, `N/A`), status ogólny automatycznie zmienia się na `To Be Reviewed`, sygnalizując Lead QA gotowość do akceptacji. Jakakolwiek zmiana statusu platformy z powrotem na testy automatycznie przywraca zgłoszenie do `In Progress`.

4. **Generator Zapytań JQL i Komentarzy Jira**  
   Jednym kliknięciem generuje precyzyjną kwerendę `key in (...)` do masowego zamykania zweryfikowanych błędów w Jira oraz zunifikowane komentarze weryfikacyjne z oznaczeniem wersji kompilacji.

5. **Symulator Google Sheets Sync (Mock Cloud Bridge)**  
   Aplikacja posiada wbudowaną symulację zapytania REST (800ms) oraz dostarcza kompletny skrypt Google Apps Script z obsługą `LockService.getScriptLock()` do bezkonfliktowej, transakcyjnej pracy wieloosobowej.

6. **Tablica Zadań Dziennych i Rejestr Kompilacji**  
   Automatyczne powiązanie gałęzi z numerami kompilacji oraz generator porannych komunikatów z tagami `@tester` na Slacka i Microsoft Teams.

7. **Matryca Czasu Pracy (Task Hours EoD)**  
   Rejestracja wysiłku testerów w 9 kategoriach jakościowych z automatycznym podsumowaniem roboczogodzin całego studia.

---

## 📄 License
This project is open-source and released under the **MIT License**.  
Copyright (c) 2026 **Szymon Kochanowski**. See the [LICENSE](LICENSE) file for full details.
