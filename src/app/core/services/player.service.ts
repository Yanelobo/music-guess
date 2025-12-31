import { Injectable, signal, computed } from '@angular/core';
import { Player, GameScore, Character } from '@shared/models';
import { StorageService } from './storage.service';

/**
 * PlayerService
 * Gerencia dados dos jogadores e ranking
 * Responsável por:
 * - Gerenciar perfil do jogador atual
 * - Manter histórico de scores (diários e todos os tempos)
 * - Gerar ranking (top 5 diário e geral)
 * - Gerenciar customização do personagem
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly CURRENT_PLAYER_KEY = 'player:current';
  private readonly ALL_SCORES_KEY = 'scores:all';
  private readonly CHARACTER_KEY = 'character:current';
  private readonly ALL_PLAYERS_KEY = 'players:all';

  // Signals
  private currentPlayerSignal = signal<Player | null>(null);
  private allScoresSignal = signal<GameScore[]>([]);
  private currentCharacterSignal = signal<Character | null>(null);
  private allPlayersSignal = signal<Player[]>([]);

  // Read-only computed
  currentPlayer = this.currentPlayerSignal.asReadonly();
  allScores = this.allScoresSignal.asReadonly();
  currentCharacter = this.currentCharacterSignal.asReadonly();
  allPlayers = this.allPlayersSignal.asReadonly();

  // Computed signals para ranking
  dailyRanking = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayScores = this.allScoresSignal()
      .filter((score) => score.date === today)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);

    return todayScores;
  });

  allTimeRanking = computed(() => {
    // Agrupa scores por jogador e pega o melhor de cada um
    const playerScores = new Map<string, GameScore[]>();

    this.allScoresSignal().forEach((score) => {
      if (!playerScores.has(score.playerId)) {
        playerScores.set(score.playerId, []);
      }
      playerScores.get(score.playerId)!.push(score);
    });

    // Cria ranking ordenado pelo melhor score de cada jogador
    const ranking: GameScore[] = [];
    playerScores.forEach((scores) => {
      const bestScore = scores.reduce((best, current) =>
        current.matchPercentage > best.matchPercentage ? current : best
      );
      ranking.push(bestScore);
    });

    return ranking.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);
  });

  constructor(private storage: StorageService) {
    this.loadPlayerData();
    this.loadAllScores();
    this.loadCharacter();
    this.loadAllPlayers();
  }

  /**
   * Cria ou obtém um jogador
   * @param playerName - Nome do jogador
   * @returns O jogador criado ou existente
   */
  getOrCreatePlayer(playerName: string): Player {
    let player = this.currentPlayerSignal();

    if (!player) {
      player = {
        id: this.generatePlayerId(),
        name: playerName,
        createdAt: Date.now(),
        dailyPlays: 0,
        totalPlays: 0,
      };

      this.savePlayer(player);
      this.addPlayerToAllPlayers(player);
    }

    return player;
  }

  /**
   * Salva o jogador atual
   */
  private savePlayer(player: Player): void {
    this.currentPlayerSignal.set(player);
    this.storage.set(this.CURRENT_PLAYER_KEY, player);
  }

  /**
   * Carrega dados do jogador do armazenamento
   */
  private loadPlayerData(): void {
    const player = this.storage.get<Player>(this.CURRENT_PLAYER_KEY);
    if (player) {
      this.currentPlayerSignal.set(player);
    }
  }

  /**
   * Atualiza estatísticas do jogador
   */
  updatePlayerStats(): void {
    const player = this.currentPlayerSignal();
    if (!player) return;

    const today = new Date().toISOString().split('T')[0];
    const todayScores = this.allScoresSignal().filter(
      (score) => score.playerId === player.id && score.date === today
    );

    player.dailyPlays = todayScores.length;
    player.totalPlays = this.allScoresSignal().filter(
      (score) => score.playerId === player.id
    ).length;

    this.savePlayer(player);
  }

  /**
   * Registra um novo score do jogador
   */
  recordScore(score: GameScore): void {
    const scores = this.allScoresSignal();
    scores.push(score);
    this.allScoresSignal.set([...scores]);
    this.storage.set(this.ALL_SCORES_KEY, [...scores]);

    this.updatePlayerStats();
    // Enviar score para o backend para persistência global (não bloquear a UI)
    try {
      fetch('http://localhost:3001/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(score),
      }).catch((err) => console.warn('Não foi possível enviar score ao backend:', err));
    } catch (err) {
      console.warn('Erro ao tentar postar score ao backend:', err);
    }
  }

  /**
   * Carrega todos os scores
   */
  private loadAllScores(): void {
    const scores = this.storage.get<GameScore[]>(this.ALL_SCORES_KEY, []) || [];
    this.allScoresSignal.set(scores);
  }

  /**
   * Define o personagem do jogador
   */
  setCharacter(character: Character): void {
    this.currentCharacterSignal.set(character);
    this.storage.set(this.CHARACTER_KEY, character);
  }

  /**
   * Carrega o personagem salvo
   */
  private loadCharacter(): void {
    const character = this.storage.get<Character>(this.CHARACTER_KEY);
    if (character) {
      this.currentCharacterSignal.set(character);
    }
  }

  /**
   * Obtém um jogador pelo ID
   */
  getPlayerById(playerId: string): Player | undefined {
    return this.allPlayersSignal().find((p) => p.id === playerId);
  }

  /**
   * Adiciona um novo jogador à lista de todos os jogadores
   */
  private addPlayerToAllPlayers(player: Player): void {
    const allPlayers = this.allPlayersSignal();
    if (!allPlayers.find((p) => p.id === player.id)) {
      this.allPlayersSignal.set([...allPlayers, player]);
      this.storage.set(this.ALL_PLAYERS_KEY, [...allPlayers, player]);
    }
  }

  /**
   * Carrega lista de todos os jogadores
   */
  private loadAllPlayers(): void {
    const players = this.storage.get<Player[]>(this.ALL_PLAYERS_KEY, []) || [];
    this.allPlayersSignal.set(players);
  }

  /**
   * Gera um ID único para um novo jogador
   */
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reseta dados do jogador (útil para testes)
   */
  resetAllData(): void {
    this.currentPlayerSignal.set(null);
    this.allScoresSignal.set([]);
    this.currentCharacterSignal.set(null);
    this.allPlayersSignal.set([]);
    this.storage.remove(this.CURRENT_PLAYER_KEY);
    this.storage.remove(this.ALL_SCORES_KEY);
    this.storage.remove(this.CHARACTER_KEY);
    this.storage.remove(this.ALL_PLAYERS_KEY);
  }

  /**
   * Busca leaderboard global do backend
   * @param limit - número máximo de entradas retornadas
   */
  async fetchLeaderboard(limit = 50): Promise<GameScore[]> {
    try {
      const url = `http://localhost:3001/api/leaderboard?limit=${encodeURIComponent(String(limit))}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('Erro ao buscar leaderboard:', res.status);
        return [];
      }
      const data = await res.json();
      return (data.leaderboard || []) as GameScore[];
    } catch (error) {
      console.warn('Erro ao buscar leaderboard:', error);
      return [];
    }
  }
}
