import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

// __dirname is not defined in ES module context; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

/**
 * Tipos para leaderboard
 */
interface ScoreEntry {
  playerId: string;
  playerName: string;
  mood: string;
  userGuess: string;
  matchPercentage: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
}

async function loadLeaderboard(): Promise<ScoreEntry[]> {
  try {
    const content = await fs.readFile(LEADERBOARD_FILE, 'utf-8');
    const data = JSON.parse(content) as ScoreEntry[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // If file doesn't exist or parse error, return empty
    return [];
  }
}

async function saveLeaderboard(entries: ScoreEntry[]): Promise<void> {
  const tmp = LEADERBOARD_FILE + '.tmp';
  const content = JSON.stringify(entries, null, 2);
  await fs.writeFile(tmp, content, 'utf-8');
  await fs.rename(tmp, LEADERBOARD_FILE);
}

/**
 * Interface para features acústicas
 */
interface AcousticFeatures {
  energy?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  valence?: number;
}

/**
 * Interface para resposta da MusicBrainz
 */
interface MusicBrainzRecording {
  id: string;
  title: string;
  'artist-credit'?: Array<{ name: string }>;
}

/**
 * Busca a música na MusicBrainz e tenta encontrar features acústicas
 */
async function searchRecordingWithFeatures(artist: string, title: string): Promise<{ recording: MusicBrainzRecording; features: AcousticFeatures } | null> {
  try {
    const query = encodeURIComponent(`artist:"${artist}" recording:"${title}"`);
    const url = `https://musicbrainz.org/ws/2/recording/?query=${query}&fmt=json&limit=10`;

    console.log(`🔍 Buscando em MusicBrainz: ${artist} - ${title}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MusicGuessGame/1.0 ( https://github.com/user/music-guess )',
      },
    });

    if (!response.ok) {
      console.error(`❌ MusicBrainz error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const recordings = (data as any).recordings || [];

    console.log(`📊 Encontrado ${recordings.length} resultados`);

    if (recordings.length === 0) {
      console.log(`⚠️ Nenhuma música encontrada para: ${artist} - ${title}`);
      return null;
    }

    // Tentar cada gravação até encontrar uma com features
    for (let i = 0; i < recordings.length; i++) {
      const recording = recordings[i];
      console.log(`\n🔄 Tentando gravação ${i + 1}/${recordings.length}: "${recording.title}" (ID: ${recording.id})`);

      const features = await getAcousticFeatures(recording.id);

      if (features && features.energy !== undefined) {
        console.log(`✅ Selecionado: ${recording.title} (ID: ${recording.id})`);
        return { recording, features };
      } else {
        console.log(`⚠️ Esta gravação não tem features disponíveis, tentando próxima...`);
      }
    }

    console.log(`❌ Nenhuma gravação tem features acústicas disponíveis`);
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar em MusicBrainz:', error);
    return null;
  }
}

/**
 * Obtém features acústicas da AcousticBrainz (usando High-Level data com mood)
 */
async function getAcousticFeatures(mbid: string): Promise<AcousticFeatures | null> {
  try {
    const url = `https://acousticbrainz.org/api/v1/${mbid}/high-level`;

    console.log(`🎵 Buscando mood data do AcousticBrainz para MBID: ${mbid}`);
    console.log(`   URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MusicGuessGame/1.0 ( https://github.com/user/music-guess )',
      },
    });

    if (!response.ok) {
      console.error(`⚠️ AcousticBrainz ${response.status}: Dados não disponíveis`);
      const text = await response.text();
      console.error(`   Response: ${text.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const highlevel = (data as any)?.highlevel;

    if (!highlevel) {
      console.log(`⚠️ Nenhum high-level data disponível`);
      return null;
    }

    // Extrair probabilidades dos moods
    const moodHappy = highlevel['mood_happy']?.probability ?? 0;
    const moodRelaxed = highlevel['mood_relaxed']?.probability ?? 0;
    const moodSad = highlevel['mood_sad']?.probability ?? 0;
    const moodAcoustic = highlevel['mood_acoustic']?.probability ?? 0;
    const moodAggressive = highlevel['mood_aggressive']?.probability ?? 0;
    const moodParty = highlevel['mood_party']?.probability ?? 0;
    const voiceInstrumental = highlevel['voice_instrumental']?.all?.instrumental ?? 0;

    // Mapear moods para features acústicas
    const features: AcousticFeatures = {
      energy: moodParty * 0.8 + moodAggressive * 0.2, // party + aggressive = energia
      danceability: moodParty, // party = danceability
      acousticness: moodAcoustic,
      instrumentalness: voiceInstrumental,
      valence: moodHappy, // happy = positive valence
    };

    console.log(`✅ High-level mood data:`, {
      happy: moodHappy,
      relaxed: moodRelaxed,
      sad: moodSad,
      acoustic: moodAcoustic,
      aggressive: moodAggressive,
      party: moodParty,
      instrumental: voiceInstrumental,
    });

    return features;
  } catch (error) {
    console.error('❌ Erro ao buscar mood data:', error);
    return null;
  }
}

/**
 * Calcula scores para cada mood baseado nas features acústicas
 */
function calculateMoodScores(features: AcousticFeatures): Record<string, number> {
  const energy = features.energy ?? 0.5;
  const danceability = features.danceability ?? 0.5;
  const acousticness = features.acousticness ?? 0.5;
  const instrumentalness = features.instrumentalness ?? 0.5;
  const valence = features.valence ?? 0.5;

  const normalizeMoodScore = (score: number) => Math.min(1, Math.max(0, score));

  return {
    chill: normalizeMoodScore(acousticness * 0.6 + (1 - energy) * 0.4),
    energetic: normalizeMoodScore(energy * 0.7 + danceability * 0.3),
    melancholic: normalizeMoodScore((1 - valence) * 0.6 + acousticness * 0.4),
    joyful: normalizeMoodScore(valence * 0.7 + danceability * 0.3),
    focus: normalizeMoodScore(instrumentalness * 0.8 + (1 - energy) * 0.2),
  };
}

/**
 * Score de fallback usando hash determinístico
 */
function calculateFallbackScore(moodId: string): number {
  const today = new Date().toISOString().split('T')[0];
  const combined = `${moodId}|${today}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash) % 100;
}

/**
 * Endpoint para calcular correspondência de música com mood
 */
app.post('/api/music/match', async (req: Request, res: Response) => {
  try {
    const { artist, title, moodId } = req.body;

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎮 Nova requisição recebida`);
    console.log(`   Artista: ${artist}`);
    console.log(`   Música: ${title}`);
    console.log(`   Mood: ${moodId}`);
    console.log(`${'='.repeat(50)}`);

    if (!artist || !title || !moodId) {
      return res.status(400).json({
        error: 'Parâmetros inválidos. Requeridos: artist, title, moodId',
      });
    }

    // Buscar em MusicBrainz e tentar encontrar features
    const result = await searchRecordingWithFeatures(artist, title);

    if (!result) {
      console.log(`⚠️ Usando fallback score (nenhuma música com features encontrada)`);
      // Retornar score de fallback se não encontrar
      return res.json({
        matchPercentage: calculateFallbackScore(moodId),
        source: 'fallback',
        message: 'Música não encontrada na base de dados com features acústicas. Usando score aleatório do dia.',
      });
    }

    const { recording, features } = result;

    // Calcular scores para cada mood
    const moodScores = calculateMoodScores(features);
    const targetScore = moodScores[moodId as keyof typeof moodScores] || 0;
    const matchPercentage = Math.round(targetScore * 100);

    console.log(`🎯 Scores calculados:`, moodScores);
    console.log(`✅ Match final: ${matchPercentage}% (${moodId})`);
    console.log(`${'='.repeat(50)}\n`);

    return res.json({
      matchPercentage,
      source: 'acousticbrainz',
      features: {
        energy: features.energy,
        danceability: features.danceability,
        acousticness: features.acousticness,
        instrumentalness: features.instrumentalness,
        valence: features.valence,
      },
      mbid: recording.id,
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Endpoint para diagnosticar AcousticBrainz diretamente
 */
app.post('/api/debug/acousticbrainz', async (req: Request, res: Response) => {
  try {
    const { mbid } = req.body;

    if (!mbid) {
      return res.status(400).json({
        error: 'Parâmetro inválido. Requerido: mbid',
      });
    }

    console.log(`\n🔧 Testando AcousticBrainz diretamente com MBID: ${mbid}`);
    const features = await getAcousticFeatures(mbid);

    if (features) {
      return res.json({
        success: true,
        mbid,
        features,
      });
    } else {
      return res.json({
        success: false,
        mbid,
        message: 'MBID não encontrado ou sem features no AcousticBrainz',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao testar AcousticBrainz',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Endpoint para testar se uma música tem features acústicas disponíveis
 */
app.post('/api/music/check', async (req: Request, res: Response) => {
  try {
    const { artist, title } = req.body;

    if (!artist || !title) {
      return res.status(400).json({
        error: 'Parâmetros inválidos. Requeridos: artist, title',
      });
    }

    console.log(`\n🔍 Verificando: ${artist} - ${title}`);

    const result = await searchRecordingWithFeatures(artist, title);

    if (result) {
      const { recording, features } = result;
      return res.json({
        found: true,
        artist,
        title,
        musicbrainzId: recording.id,
        recordingTitle: recording.title,
        features: {
          energy: features.energy,
          danceability: features.danceability,
          acousticness: features.acousticness,
          instrumentalness: features.instrumentalness,
          valence: features.valence,
        },
      });
    } else {
      return res.json({
        found: false,
        artist,
        title,
        message: 'Música não encontrada com features acústicas disponíveis no AcousticBrainz',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao verificar música',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Submete um score ao leaderboard (persistido)
 * Expect body: ScoreEntry
 */
app.post('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<ScoreEntry>;

    if (
      !payload ||
      typeof payload.playerId !== 'string' ||
      typeof payload.playerName !== 'string' ||
      typeof payload.userGuess !== 'string' ||
      typeof payload.matchPercentage !== 'number' ||
      typeof payload.timestamp !== 'number' ||
      typeof payload.date !== 'string'
    ) {
      return res.status(400).json({ error: 'Payload inválido para leaderboard' });
    }

    const entry: ScoreEntry = {
      playerId: payload.playerId,
      playerName: payload.playerName,
      mood: payload.mood || 'unknown',
      userGuess: payload.userGuess,
      matchPercentage: Math.max(0, Math.min(100, Math.round(payload.matchPercentage))),
      date: payload.date,
      timestamp: payload.timestamp,
    };

    const current = await loadLeaderboard();

    // Append and keep only recent N (but store everything). We'll keep all, but return top on fetch.
    current.push(entry);
    await saveLeaderboard(current);

    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar leaderboard:', error);
    return res.status(500).json({ error: 'Erro ao salvar leaderboard' });
  }
});

/**
 * Retorna leaderboard ordenado. Query param: limit (default 50)
 */
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const all = await loadLeaderboard();

    // Ordena por matchPercentage descendente e agrupa por player (pega melhor por jogador)
    const bestByPlayer = new Map<string, ScoreEntry>();
    all.forEach((s) => {
      const exist = bestByPlayer.get(s.playerId);
      if (!exist || s.matchPercentage > exist.matchPercentage || (s.matchPercentage === exist.matchPercentage && s.timestamp > exist.timestamp)) {
        bestByPlayer.set(s.playerId, s);
      }
    });

    const ranking = Array.from(bestByPlayer.values()).sort((a, b) => b.matchPercentage - a.matchPercentage || b.timestamp - a.timestamp).slice(0, limit);

    return res.json({ count: ranking.length, leaderboard: ranking });
  } catch (error) {
    console.error('Erro ao ler leaderboard:', error);
    return res.status(500).json({ error: 'Erro ao ler leaderboard' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎵 Music Guess Backend rodando em http://localhost:${PORT}`);
  console.log(`📍 Endpoint: POST http://localhost:${PORT}/api/music/match`);
  console.log(`🔍 Teste: POST http://localhost:${PORT}/api/music/check`);
});

// Garantir que o arquivo de leaderboard exista na primeira execução
async function ensureLeaderboardFile() {
  try {
    const existing = await fs.readFile(LEADERBOARD_FILE, 'utf-8').catch(() => null);
    if (!existing) {
      await saveLeaderboard([]);
      console.log(`✅ Arquivo de leaderboard criado: ${LEADERBOARD_FILE}`);
    }
  } catch (err) {
    console.warn('Não foi possível criar leaderboard file automaticamente:', err);
  }
}

ensureLeaderboardFile();
