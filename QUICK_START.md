# 🚀 Quick Start - Music Guess

## Pré-requisitos
- Node.js 18+
- npm ou yarn

## Setup Completo (5 minutos)

### 1️⃣ Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

✅ Você verá:
```
🎵 Music Guess Backend rodando em http://localhost:3001
📍 Endpoint: POST http://localhost:3001/api/music/match
```

### 2️⃣ Terminal 2 - Frontend

```bash
npm install  # Primeira vez apenas
npm start
```

✅ Abra o navegador em `http://localhost:4200`

---

## 🎮 Testando o Jogo

1. Digite seu nome na tela inicial
2. Você verá um **mood** (Chill, Energetic, etc)
3. Digite o **artista** e **música** que acha que combina
4. Clique em "✨ Enviar Adivinhação"
5. Veja o resultado com base em análise acústica real!

---

## 📊 Como Funciona

**Seu Guess → Angular Frontend → Backend Node.js → APIs Externas → Score**

```
Input: "Bon Iver" - "Holocene"
   ↓
POST http://localhost:3001/api/music/match
{
  "artist": "Bon Iver",
  "title": "Holocene",
  "moodId": "melancholic"
}
   ↓
Backend busca em MusicBrainz → encontra MBID
   ↓
Backend consulta AcousticBrainz → obtém features
   ↓
Backend mapeia features para mood score
   ↓
Response: { matchPercentage: 85, source: "acousticbrainz" }
   ↓
Frontend mostra: "85% - Que correspondência incrível!"
```

---

## ⚙️ Configuração Avançada

### Mudar Porto do Backend

Edite `backend/server.ts`:
```typescript
const PORT = 3001; // Mude para outro valor
```

E atualize `src/app/core/services/music-match.service.ts`:
```typescript
private readonly BACKEND_API = 'http://localhost:3001/api'; // Mude a porta
```

### Ambiente de Produção

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Deploy a pasta dist/music-guess
```

---

## 🆘 Troubleshooting

**Erro: "Failed to fetch from localhost:3001"**
- Certifique-se que o backend está rodando
- Verifique se a porta 3001 não está em uso

**Erro: "Cannot find module 'express'"**
- Execute `npm install` na pasta backend

**Música não encontrada**
- É normal! MusicBrainz não tem todas as músicas
- O jogo usa fallback automático (score aleatório diário)

---

## 📝 Notas

- ⏰ **Uma tentativa por dia** - voltando tomorrow para uma nova chance
- 🔄 **Features acústicas reais** - baseado em análise da música
- 📱 **Mobile-first** - jogue em qualquer dispositivo
- 💾 **Sem servidor** - tudo persiste localmente (localStorage)
