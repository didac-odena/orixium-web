# Orixium Web
[LIVE DEMO](https://fintech-react-web.netlify.app)

**React UI**  
Ironhack Bootcamp · Frontend Project

**Author:** Dídac Ódena - [Linkedin Profile](https://es.linkedin.com/in/d%C3%ADdac-%C3%B2dena)
---

## Overview

**Orixium Web** is a **frontend-only React application** built as a bootcamp project to demonstrate **realistic frontend engineering practices**: routing, form handling, predictable state management, UI reuse, and clean data flow.

This is **not a production trading platform**.  
The focus is on **readable, maintainable code** and a **credible UI workflow** that behaves like a real application without requiring a backend.

**Best starting point:**  
Log in and explore the **New Trade** flow — it highlights form validation, derived values, confirmation logic, and predictable data handling.

---

## Demo Credentials

Email: demo-admin@orixium.test
Password: 12345678

## Features & Implementation

### 🧱 Architecture & Structure

- Clear separation of concerns:
  - **`pages`** → route-level views
  - **`components`** → reusable UI blocks
  - **`services`** → data access layer
  - **`contexts`** → shared application state
  - **`adapters`** → normalized and predictable data shapes
- Intentional folder structure to avoid tight coupling and implicit dependencies.

---

### 🔄 Data Flow

A predictable, explicit data lifecycle:

1. Data is created via **React Hook Form**
2. Inputs are validated and normalized
3. Payloads are persisted locally
4. Data is reused across views as status changes (**open → closed**)

The same source of truth feeds:
- **Current Trades**
- **Historial**
- **Dashboard summaries**

---

### 🧾 Forms & Validation

- Built with **React Hook Form**
- Includes:
  - Field-level validation rules
  - Cross-field checks
  - Derived / calculated values
  - Explicit confirmation step before persistence
- Focus on **explicit logic**, no hidden side effects.

---

### 🧠 State Handling

- Explicit UI states:
  - Loading
  - Error
  - Empty
- No implicit mutations
- No surprise re-renders

State changes are intentional and traceable.

---

### 💾 Persistence

- Local persistence via **`localStorage`**:
  - Session
  - Theme preference
  - Cached snapshots
  - Manual trade entries
- Ensures continuity across refreshes without a backend.

---

### 🧪 Mocked Backend

- **MSW (Mock Service Worker)** used to simulate API behavior
- Handlers + fixtures act as a fake backend
- UI behaves like a real app **without requiring a server**

---

### 🎨 UI & UX

- Reusable UI primitives:
  - `PageLayout`
  - Table primitives
  - Toolbar & pagination
  - Toggles and dropdowns
- Consistent usage across all views

**Search / filter / ordering**
- Normalized identifiers
- Local search
- Predictable sorting logic

---

### ⚡ Performance Choices

- Snapshot caching
- Manual refresh (no polling)
- Explicit data updates to keep reasoning simple

---

### 📊 External Widgets

- TradingView widgets embedded
- Isolated from core application state
- Synced with light / dark theme

---

### 🧩 Quality Philosophy

- Readability over cleverness
- Simple logic preferred to heavy abstractions
- Manual refresh > hidden automation
- Structure designed to scale without refactor panic

---

## Application Flow

A realistic user journey and data lifecycle:

1. **Dashboard**  
   Overview of open and closed data plus market widgets.

2. **Market Explorer**  
   Browse and filter datasets before acting.

3. **New Trade**
   - Validate inputs
   - Derive values
   - Confirm and persist normalized data

4. **Current Trades**
   - Read open status
   - Refresh snapshot values
   - Close trades when needed

5. **Historial**
   - Closed trades with stored metrics
   - Close reasons
   - Sorted by most recent close

6. **Dashboard (loop)**
   Summaries reflect the latest open / closed state.

---

## Tech Stack

- **React 19** – UI and component architecture
- **React Router DOM** – public/private routing and guards
- **React Hook Form** – forms, validation, submission flow
- **Tailwind CSS + CSS variables** – design tokens and theming
- **Axios** – HTTP client (CoinGecko + local `/api`)
- **MSW (Mock Service Worker)** – API mocking
- **Heroicons** – UI iconography
- **TradingView Widgets** – market visuals
- **Vite + ESLint** – tooling and build pipeline

---

## Tooling

- Lint and build scripts available
- No automated tests yet (intentionally out of scope)

---

## Notes

This project prioritizes **frontend engineering fundamentals**:

- Clear data flow
- Explicit state changes
- Reusable components
- Predictable behavior

The goal is not feature quantity, but **code quality and reasoning clarity**.

