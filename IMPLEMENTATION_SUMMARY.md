# 🎵 Music Guess - Esqueleto Implementado

## ✅ O que foi criado

Acabei de criar o **esqueleto completo e funcional** de um jogo web cozy music guess em Angular. A aplicação está pronta para ser estendida com lógica adicional, integração com APIs, e refinamentos visuais.

---

## 📁 Estrutura de Pastas

```
src/app/
├── core/services/                 # Lógica de negócio
│   ├── storage.service.ts         # localStorage genérico
│   ├── daily-limit.service.ts     # Limite diário (1 tentativa/dia)
│   ├── game-state.service.ts      # Estado global (Signals)
│   ├── player.service.ts          # Jogadores e ranking
│   ├── music-match.service.ts     # Algoritmo de matching
│   └── index.ts                   # Barrel export
│
├── shared/
│   ├── models/index.ts            # Interfaces (Mood, Player, Character, GameScore, etc)
│   └── components/layout.component.ts  # Layout com navegação
│
├── features/
│   ├── game/
│   │   ├── home.component.ts      # Welcome screen
│   │   └── game.component.ts      # Tela de jogo principal
│   ├── ranking/ranking.component.ts   # Ranking diário + geral (top 5)
│   └── character-customizer/      # Customização do personagem
│
├── app.routes.ts                  # Rotas (lazy loading ready)
├── app.config.ts                  # Config da app
└── app.ts                         # Root component

styles.scss                         # Estilos globais (mobile-first, cozy theme)
```

---

## 🎯 Componentes Implementados

### 1. **HomeComponent** (`/`)
- Tela inicial/welcome
- Input para nome do jogador
- Instruções de como jogar
- Criação/carregamento do perfil

### 2. **GameComponent** (`/game`)
- Exibe humor musical do dia
- Interface para adivinhar música
- Mostra resultado e percentual de match
- Bloqueia jogador após 1 tentativa/dia

### 3. **RankingComponent** (`/ranking`)
- Ranking diário (top 5 de hoje)
- Ranking geral (top 5 todos os tempos)
- Abas para alternar entre os dois
- Emojis de medalhas (🥇🥈🥉)

### 4. **CharacterCustomizerComponent** (`/character`)
- Customizar personagem com camadas
- Opções: cor de pele, cabelo, outfit, acessórios
- Prévia em tempo real
- Salva no localStorage

### 5. **LayoutComponent**
- Navegação sticky no topo
- Menu com links para todas as páginas
- Footer cozy
- Router outlet para conteúdo

---

## 🔧 Serviços Core

### **StorageService**
Abstração genérica para localStorage:
```typescript
get<T>(key: string, defaultValue?: T): T | undefined
set<T>(key: string, value: T): void
remove(key: string): void
clear(): void
has(key: string): boolean
```

### **DailyLimitService**
- Controla limite diário (1 tentativa/dia)
- Persiste última data de jogo
- Reseta automaticamente

### **GameStateService** (Signals)
Estado global reativo:
- `isLoading` | `hasPlayedToday` | `currentMood`
- `currentScore` | `selectedCharacter` | `error`
- Computed signals: `isGameLocked`, `canPlayGame`

### **PlayerService** (Signals)
- CRUD de jogadores
- Registro de scores
- **Ranking diário** (top 5 de hoje)
- **Ranking geral** (top 5 todos os tempos)
- Customização de personagem

### **MusicMatchService**
- Algoritmo determinístico de matching (0-100%)
- Feedback personalizado baseado no score
- Usa similaridade textual + componente pseudo-aleatória

---

## 📊 Modelos de Dados

```typescript
// Humor musical
interface Mood {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

// Jogador
interface Player {
  id: string;
  name: string;
  createdAt: number;
  dailyPlays: number;
  totalPlays: number;
  dailyScore?: number;
}

// Score do jogo
interface GameScore {
  playerId: string;
  playerName: string;
  mood: string;
  userGuess: string;
  matchPercentage: number;
  date: string;
  timestamp: number;
}

// Customização do personagem
interface Character {
  playerId: string;
  skinColor: string;
  hairStyle: string;
  outfit: string;
  accessories: string[];
  lastUpdated: number;
}

// Estado do jogo
interface GameState {
  isLoading: boolean;
  hasPlayedToday: boolean;
  currentMood: Mood | null;
  currentScore: GameScore | null;
  selectedCharacter: Character | null;
  error: string | null;
}
```

---

## 🎨 Design & Responsividade

- **Mobile-first**: 100% responsivo (768px, 480px breakpoints)
- **Cozy theme**: Gradientes warm, purples, pinks, beiges
- **Acessibilidade**: Estilos globais, fonts legíveis, spacing adequado
- **Animações**: Smooth transitions, feedback visual com emojis
- **CSS Variables**: Tema facilmente customizável

---

## 💾 Persistência

Tudo armazenado em `localStorage`:
- ✅ Último dia jogado
- ✅ Tentativa do dia
- ✅ Dados do jogador (ID, nome, stats)
- ✅ Todos os scores históricos
- ✅ Customização do personagem

---

## 🚀 Como Rodar

```bash
# Instalar
npm install

# Dev server
npm start

# Build
ng build

# Testes
npm test
```

Depois acesse `http://localhost:4200`

---

## 🎮 Fluxo do Jogo

1. **Home**: Jogador entra com nome
2. **Game**: Vê humor do dia, tenta adivinhar música
3. **Result**: Vê percentual de match (0-100%)
4. **Lock**: Bloqueado por 24h (até próximo dia)
5. **Ranking**: Compete no ranking diário e geral

---

## 📝 Padrões de Código

✅ **Standalone components** (sem módulos)
✅ **Angular Signals** para estado reativo
✅ **Injeção de dependência** com `inject()`
✅ **TypeScript strict mode**
✅ **Comentários em português**
✅ **Path aliases** (@core, @shared, @features)
✅ **Clean code**: funções pequenas e focadas

---

## 🔮 Próximos Passos (Sugestões)

- [ ] Backend para persistência em servidor
- [ ] Autenticação com OAuth
- [ ] Integração Spotify API para validação de músicas
- [ ] Temas customizáveis
- [ ] Achievements/badges
- [ ] PWA (offline support)
- [ ] Compartilhar scores nas redes
- [ ] Multiplayer/competição em tempo real
- [ ] Push notifications para novo dia
- [ ] Dark mode

---

## 📦 Tech Stack

- ✅ Angular 21+
- ✅ TypeScript (strict mode)
- ✅ Angular Signals (reactivity)
- ✅ SCSS (mobile-first)
- ✅ Standalone Components
- ✅ Dependency Injection
- ✅ localStorage (no backend)

---

**O esqueleto está pronto! Agora você pode:**
- Adicionar lógica de validação de músicas
- Conectar a um backend
- Refinar o algoritmo de matching
- Adicionar mais features visuais
- Publicar como PWA

🎵 **Happy coding! Develop with cozy vibes** 🌙
