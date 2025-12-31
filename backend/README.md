# 🎵 Music Guess Backend

Backend Node.js/Express que funciona como proxy para as APIs MusicBrainz e AcousticBrainz, eliminando problemas de CORS no navegador.

## Setup

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Rodar em Desenvolvimento

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### 3. Build para Produção

```bash
npm run build
npm start
```

---

## Endpoints

### POST `/api/music/match`

Calcula a correspondência entre uma música e um mood.

**Request:**
```json
{
  "artist": "Bon Iver",
  "title": "Holocene",
  "moodId": "melancholic"
}
```

**Response (Sucesso):**
```json
{
  "matchPercentage": 85,
  "source": "acousticbrainz",
  "features": {
    "energy": 0.3,
    "danceability": 0.1,
    "acousticness": 0.9,
    "instrumentalness": 0.7,
    "valence": 0.2
  },
  "mbid": "4f4068cb-7001-47a3-a2fd-9a30f164f5ee"
}
```

**Response (Fallback - música não encontrada):**
```json
{
  "matchPercentage": 42,
  "source": "fallback",
  "message": "Música não encontrada na base de dados acústica"
}
```

---

## Como Funciona

1. **Frontend (Angular)** envia artista + música
2. **Backend (Node.js)** busca em **MusicBrainz** pela música
3. Se encontrada, **AcousticBrainz** retorna features acústicas
4. **Backend mapeia** features para mood score
5. **Retorna resultado** sem problemas de CORS

---

## Variáveis de Ambiente (Opcional)

Crie um `.env` na pasta `backend/`:

```
PORT=3001
NODE_ENV=development
```

---

## Troubleshooting

### Erro: "ECONNREFUSED" no frontend
- Certifique-se que o backend está rodando em `localhost:3001`
- Execute `npm run dev` na pasta backend

### Erro: "Cannot find module 'express'"
- Execute `npm install` na pasta backend

### API lenta
- AcousticBrainz pode ser lento na primeira consulta de uma música
- Adicione cache se necessário (não implementado por padrão)

---

## Arquitetura

```
Frontend (Angular)
    ↓ [POST /api/music/match]
Backend (Express)
    ├→ MusicBrainz API (busca música)
    └→ AcousticBrainz API (features acústicas)
    ↓
Return matchPercentage
```
