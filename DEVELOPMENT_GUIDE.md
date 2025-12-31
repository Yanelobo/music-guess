# 📖 Guia de Desenvolvimento - Music Guess

## Começando

### Inicializar a Aplicação
```bash
npm install
npm start
```

Acesse `http://localhost:4200` no navegador.

---

## 🏗️ Arquitetura

### Camadas

```
UI (Components)
    ↓
State Management (Signals)
    ↓
Services (Business Logic)
    ↓
Storage (localStorage)
```

### Fluxo de Dados

1. **Componente** dispara ação (ngSubmit, click)
2. **Service** processa lógica
3. **Signal** atualiza estado
4. **Component** renderiza novo estado
5. **localStorage** persiste dados

---

## 📋 Checklist: Como Adicionar uma Nova Feature

### 1. Criar o Componente
```bash
# Criar arquivo em src/app/features/meu-feature/
# Usar syntax standalone
```

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meu-feature',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Meu Feature</div>`,
  styles: []
})
export class MeuFeatureComponent {
  // Injetar serviços
  meuService = inject(MeuService);

  // State com signals
  dados = signal([]);
}
```

### 2. Adicionar Rota
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'meu-feature',
    component: MeuFeatureComponent
  }
];
```

### 3. Adicionar Link na Navegação
```typescript
// shared/components/layout.component.ts
<a routerLink="/meu-feature">Meu Feature</a>
```

### 4. Criar Service (se necessário)
```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeuService {
  dados = signal([]);

  obterDados() {
    // lógica aqui
  }
}
```

---

## 🎯 Padrões de Código

### ✅ Como Usar Signals

```typescript
// Criar
const contador = signal(0);

// Ler
console.log(contador());

// Modificar
contador.set(5);
contador.update(v => v + 1);

// Computed
const dobro = computed(() => contador() * 2);

// Read-only (expor ao template)
readonly contador$ = this.sinal.asReadonly();
```

### ✅ Como Injetar Serviços

```typescript
// ❌ Evitar (deprecated)
constructor(private meuService: MeuService) {}

// ✅ Usar
meuService = inject(MeuService);
```

### ✅ Como Usar localStorage

```typescript
import { StorageService } from '@core/services';

export class MeuComponent {
  storage = inject(StorageService);

  salvarDados() {
    this.storage.set('minha-chave', { dados: 'exemplo' });
  }

  carregarDados() {
    const dados = this.storage.get<MinhaInterface>('minha-chave');
  }
}
```

### ✅ Binding com Signals no Template

```html
<!-- ❌ Evitar two-way binding com signals -->
<input [(ngModel)]="sinal()">

<!-- ✅ Usar property + event binding -->
<input [ngModel]="sinal()" (ngModelChange)="sinal.set($event)">

<!-- ✅ Ou usar uma função -->
<input (ngModelChange)="atualizar($event)">

<!-- Para readonly signals -->
<p>{{ sinal() }}</p>
```

---

## 🎨 Estilos

### Variáveis CSS Disponíveis

```scss
// Cores
--primary-purple: #6c5ce7;
--primary-purple-light: #a29bfe;
--primary-pink: #fd79a8;

// Fundos
--bg-primary: linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%);
--bg-secondary: #ffffff;
--bg-tertiary: #f8f7f3;

// Texto
--text-primary: #2c3e50;
--text-secondary: #666666;
--text-muted: #999999;

// Espaçamento
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;

// Border Radius
--radius-sm: 0.5rem;
--radius-md: 0.75rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;

// Sombras
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
```

### Mobile-First Breakpoints

```scss
// Tablet
@media (max-width: 768px) {
  // ajustes para tablet
}

// Mobile
@media (max-width: 480px) {
  // ajustes para mobile
}
```

---

## 🔍 Debugging

### Verificar Signals no Console

```typescript
// No componente
console.log(this.sinal());

// Com timing
console.time('operacao');
// fazer algo
console.timeEnd('operacao');
```

### Ver localStorage

```javascript
// No console do navegador
localStorage.getItem('game:last-played-date');
localStorage.getItem('scores:all');
JSON.parse(localStorage.getItem('player:current'));
```

### Limpar localStorage

```javascript
localStorage.clear();
```

---

## 📝 Naming Conventions

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | `MeuComponent` | `GameComponent` |
| Service | `MeuService` | `GameStateService` |
| Interface | `MinhaInterface` | `GameScore`, `Player` |
| Signal | `meuSignal` | `contador`, `dados` |
| Propriedade | `minhaPropriedade` | `playerName`, `userGuess` |
| Método | `meuMetodo()` | `submitGuess()`, `calculateMatch()` |
| Arquivo | `meu.component.ts` | `game.component.ts` |
| Pasta | `meu-feature` | `character-customizer` |

---

## 🐛 Erros Comuns

### ❌ Property 'X' does not exist

```typescript
// ❌ Errado
<p>{{ sinal }}</p>

// ✅ Certo
<p>{{ sinal() }}</p>
```

### ❌ Unsupported expression in two-way binding

```typescript
// ❌ Errado
<input [(ngModel)]="sinal()">

// ✅ Certo
<input [ngModel]="sinal()" (ngModelChange)="sinal.set($event)">
```

### ❌ Property 'X' used before initialization

```typescript
// ❌ Errado
constructor(private service: MyService) {
  this.dados = this.service.dados; // service não existe ainda
}

// ✅ Certo
service = inject(MyService);
```

### ❌ Cannot find module '@core/...'

```typescript
// Verificar tsconfig.json tem os paths configurados:
// "paths": {
//   "@core/*": ["app/core/*"],
//   "@shared/*": ["app/shared/*"],
//   "@features/*": ["app/features/*"]
// }
```

---

## 📚 Recursos

- **Angular Docs**: https://angular.dev
- **Signals Guide**: https://angular.dev/guide/signals
- **TypeScript**: https://www.typescriptlang.org/docs
- **SCSS**: https://sass-lang.com/documentation

---

## ✨ Tips & Tricks

### Performance

```typescript
// ✅ Use change detection OnPush para componentes puros
@Component({
  selector: 'app-pure',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Type Safety

```typescript
// ✅ Sempre tipifique retornos
function obterJogador(id: string): Player | null {
  return ...
}
```

### Readability

```typescript
// ✅ Use comentários para lógica complexa
// Calcula match usando similaridade de Levenshtein
private levenshteinDistance(s1: string, s2: string): number {
  ...
}
```

---

## 🚢 Deploy

### Build para Produção
```bash
ng build --configuration production
```

Output em `dist/`

### Deploy no Vercel/Netlify

```bash
# Conectar repo ao Vercel/Netlify
# Framework: Angular
# Build command: ng build
# Publish directory: dist/
```

---

**Qualquer dúvida? Revise os arquivos comentados em `src/app/` 🎵**
