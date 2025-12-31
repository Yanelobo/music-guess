# 🎵 Music Guess - Estrutura do Projeto

## Visão Geral

Music Guess é um jogo web **cozy** e **mobile-first** construído com Angular (SPA, standalone components). O jogo é simples: a cada dia, um novo "humor musical" é escolhido, e o jogador tenta adivinhar uma música que combina com aquele mood.

## Stack Técnico

- **Framework**: Angular 21+ (Latest)
- **Rendering**: Standalone Components (sem módulos)
- **Estado**: Angular Signals
- **Persistência**: localStorage com StorageService
- **Estilos**: SCSS com design mobile-first
- **TypeScript**: Strict mode com type safety

## Arquitetura Modular

```
src/
├── app/
│   ├── core/                          # Serviços e lógica de negócio
│   │   └── services/
│   │       ├── storage.service.ts     # Abstração para localStorage (genérica)
│   │       ├── daily-limit.service.ts # Gerencia limite diário
│   │       ├── game-state.service.ts  # Estado global (signals)
│   │       ├── player.service.ts      # Gerencia jogadores e ranking
│   │       ├── music-match.service.ts # Lógica de matching de músicas
│   │       └── index.ts               # Barrel export
│   │
│   ├── shared/                        # Componentes reutilizáveis e modelos
│   │   ├── models/
│   │   │   └── index.ts               # Interfaces e tipos (Mood, Player, etc)
│   │   └── components/
│   │       └── layout.component.ts    # Layout principal com navegação
│   │
│   ├── features/                      # Features do jogo (rotas)
│   │   ├── game/
│   │   │   ├── home.component.ts      # Tela inicial/welcome
│   │   │   └── game.component.ts      # Tela principal do jogo
│   │   ├── ranking/
│   │   │   └── ranking.component.ts   # Ranking diário e geral (top 5)
│   │   └── character-customizer/
│   │       └── character-customizer.component.ts # Customização de personagem
│   │
│   ├── app.ts                         # Root component
│   ├── app.routes.ts                  # Configuração de rotas
│   └── app.config.ts                  # Configuração da aplicação
│
├── assets/                            # Imagens e assets estáticos
│   └── images/
│
├── styles.scss                        # Estilos globais
├── index.html                         # HTML raiz
└── main.ts                            # Entry point

```

## Core Services

### StorageService
Abstração genérica para `localStorage` com métodos fortemente tipados.

```typescript
// Métodos principais:
get<T>(key: string, defaultValue?: T): T | undefined
set<T>(key: string, value: T): void
remove(key: string): void
clear(): void
has(key: string): boolean
```

### DailyLimitService
Gerencia a limitação diária do jogo:
- Controla se o jogador já jogou hoje
- Persiste data do último jogo
- Reseta automaticamente a cada novo dia

### GameStateService
Estado global do jogo usando **Angular Signals**:
- `isLoading`: carregamento
- `hasPlayedToday`: se jogou hoje
- `currentMood`: humor do dia
- `currentScore`: score da tentativa
- `selectedCharacter`: personagem customizado
- `error`: mensagens de erro

### PlayerService
Gerencia jogadores e ranking:
- Criação/obtenção de jogador
- Registro de scores
- Ranking diário (top 5)
- Ranking geral (top 5 todos os tempos)
- Customização do personagem

### MusicMatchService
Lógica de matching entre música e humor:
- Calcula percentual de correspondência (0-100%)
- Gera feedback ao jogador
- Algoritmo determinístico (mesmo input = mesmo resultado)

## Modelos de Dados

### Mood
```typescript
interface Mood {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}
```

### Player
```typescript
interface Player {
  id: string;
  name: string;
  createdAt: number;
  dailyPlays: number;
  totalPlays: number;
  dailyScore?: number;
}
```

### GameScore
```typescript
interface GameScore {
  playerId: string;
  playerName: string;
  mood: string;
  userGuess: string;
  matchPercentage: number;
  date: string;
  timestamp: number;
}
```

### Character
```typescript
interface Character {
  playerId: string;
  skinColor: string;
  hairStyle: string;
  outfit: string;
  accessories: string[];
  lastUpdated: number;
}
```

## Componentes

### HomeComponent
- **Rota**: `/`
- Tela inicial/welcome
- Entrada de nome do jogador
- Instruções de como jogar

### GameComponent
- **Rota**: `/game`
- Interface principal do jogo
- Exibe humor do dia
- Input para adivinhação da música
- Mostra resultado e percentual de match

### RankingComponent
- **Rota**: `/ranking`
- Ranking diário (top 5 de hoje)
- Ranking geral (top 5 de todos os tempos)
- Abas para alternar entre os dois

### CharacterCustomizerComponent
- **Rota**: `/character`
- Customização de personagem
- Opções: cor de pele, cabelo, outfit, acessórios
- Prévia em tempo real

### LayoutComponent
- Componente wrapper para todas as rotas
- Navegação principal (header sticky)
- Router outlet para conteúdo das páginas
- Footer cozy

## Fluxo do Jogo

1. **Inicial**: Jogador entra com seu nome
2. **Home**: Sistema cria/carrega perfil do jogador
3. **Game**: 
   - Sistema seleciona humor do dia (determinístico)
   - Jogador tenta adivinhar uma música
   - Sistema calcula correspondência (0-100%)
   - Resultado é salvo no ranking
4. **Limite Diário**: Após 1 tentativa, jogo fica bloqueado até o próximo dia
5. **Ranking**: Jogador pode visualizar top 5 de hoje e geral

## Persistência

Tudo é salvo em `localStorage`:
- Último dia jogado
- Tentativa do dia
- Dados do jogador
- Todos os scores históricos
- Customização do personagem

## Responsivo & Mobile-First

- CSS Grid/Flexbox para layouts responsivos
- Media queries para breakpoints: 768px, 480px
- Gestos touch-friendly
- Espaçamento adequado para celulares
- Fontes legíveis em qualquer tamanho

## Tema Cozy

- Paleta de cores warm: purples, pinks, beiges
- Gradientes suaves
- Sombras subtis
- Animações smooth
- Ícones/emojis para feedback visual
- Typography confortável

## Como Rodaro Projeto

```bash
# Instalar dependências
npm install

# Rodar aplicação (dev server)
npm start
# ou
ng serve

# Build para produção
ng build

# Rodar testes
npm test
```

## Padrões de Código

- **Standalone Components**: Todos os componentes são standalone
- **Signals**: Uso de Signals para estado reativo
- **Services**: Injeção de dependência via `providedIn: 'root'`
- **Type Safety**: TypeScript strict mode
- **Comments**: Comentários em português explicando a lógica
- **Clean Code**: Nomes descritivos, funções pequenas e focadas

## Próximas Melhorias (Futuro)

- [ ] Autenticação de usuários
- [ ] Backend para persistência em servidor
- [ ] Multiplayer/competição em tempo real
- [ ] Integração com APIs de música (Spotify)
- [ ] Temas customizáveis
- [ ] Achievements/badges
- [ ] Compartilhamento de scores
- [ ] Push notifications para novo dia
- [ ] PWA (Progressive Web App)

---

**Desenvolvido com ❤️ como um jogo cozy** 🎵
