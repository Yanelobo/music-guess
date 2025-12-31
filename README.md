# 🎵 Music Guess

Um jogo cozy diário onde você tenta adivinhar músicas baseadas em moods. Uma tentativa por dia, sem pressão.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Instalar Frontend

```bash
npm install
```

### 2. Instalar Backend

```bash
cd backend
npm install
cd ..
```

### 3. Rodar Backend (em um terminal separado)

```bash
cd backend
npm run dev
```

Backend estará em `http://localhost:3001`

### 4. Rodar Frontend

```bash
npm start
```

Frontend estará em `http://localhost:4200`

---

## 📖 Development server

Para iniciar servidor de desenvolvimento:

```bash
ng serve
```

Navegue para `http://localhost:4200/`. A aplicação recarrega automaticamente ao modificar arquivos.

---

## 🎯 Como Jogar

1. Digite seu nome na tela inicial
2. Todos os dias um novo **humor musical** é escolhido
3. Adivinhe um **artista** e uma **música** que combinem com esse mood
4. Veja a **correspondência** com a vibe do dia
5. Volte amanhã para sua próxima tentativa!

---

## 🏗️ Arquitetura

```
Frontend (Angular 21+)
    ↓ [Standalone Components + Signals]
State Management (Angular Signals)
    ↓ [localStorage]
Core Services
    ├─ GameStateService
    ├─ PlayerService
    ├─ MusicMatchService
    └─ StorageService
    ↓
Backend (Node.js/Express)
    ├→ MusicBrainz API
    └→ AcousticBrainz API
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── music-match.service.ts
│   │       ├── game-state.service.ts
│   │       ├── player.service.ts
│   │       └── ...
│   ├── features/
│   │   ├── game/
│   │   ├── ranking/
│   │   └── character-customizer/
│   └── shared/
│       ├── models/
│       └── components/
│
backend/
├── server.ts
├── package.json
└── tsconfig.json
```

---

## 🛠️ Code scaffolding

Angular CLI include ferramentas poderosas:

```bash
ng generate component component-name
```

Para mais informações:
```bash
ng generate --help
```

---

## 📦 Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
