import { Injectable, signal, computed } from '@angular/core';
import {
  GameState,
  Mood,
  GameScore,
  Character,
  AVAILABLE_MOODS,
} from '@shared/models';
import { DailyLimitService } from './daily-limit.service';

/**
 * GameStateService
 * Gerencia o estado global do jogo usando Angular Signals
 * Responsável por:
 * - Estado do jogo (loading, scores, moods)
 * - Sincronização com persistência diária
 * - Seleção de humor diário
 * - Histórico de tentativas
 */
@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  // Signals privados para estado interno
  private isLoadingSignal = signal(false);
  private hasPlayedTodaySignal = signal(false);
  private currentMoodSignal = signal<Mood | null>(null);
  private currentScoreSignal = signal<GameScore | null>(null);
  private selectedCharacterSignal = signal<Character | null>(null);
  private errorSignal = signal<string | null>(null);

  // Signals públicos (read-only computed)
  isLoading = this.isLoadingSignal.asReadonly();
  hasPlayedToday = this.hasPlayedTodaySignal.asReadonly();
  currentMood = this.currentMoodSignal.asReadonly();
  currentScore = this.currentScoreSignal.asReadonly();
  selectedCharacter = this.selectedCharacterSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals
  isGameLocked = computed(() => this.hasPlayedTodaySignal());
  canPlayGame = computed(() => !this.isGameLocked() && !this.isLoadingSignal());

  /**
   * Obtém o estado completo do jogo
   */
  getGameState = computed<GameState>(() => ({
    isLoading: this.isLoadingSignal(),
    hasPlayedToday: this.hasPlayedTodaySignal(),
    currentMood: this.currentMoodSignal(),
    currentScore: this.currentScoreSignal(),
    selectedCharacter: this.selectedCharacterSignal(),
    error: this.errorSignal(),
  }));

  constructor(private dailyLimit: DailyLimitService) {
    this.initializeGameState();
  }

  /**
   * Inicializa o estado do jogo ao carregar a aplicação
   */
  private initializeGameState(): void {
    this.isLoadingSignal.set(true);

    try {
      // Verificar se jogou hoje
      const hasPlayed = this.dailyLimit.hasPlayedToday();
      this.hasPlayedTodaySignal.set(hasPlayed);

      // Se já jogou, carregar dados da tentativa
      if (hasPlayed) {
        const dailyGuess = this.dailyLimit.getDailyGuess();
        if (dailyGuess) {
          const mood = AVAILABLE_MOODS.find((m) => m.id === dailyGuess.mood);
          if (mood) {
            this.currentMoodSignal.set(mood);
          }

          // Construir GameScore a partir do DailyGuessData
          const score: GameScore = {
            playerId: '', // Será preenchido quando houver autenticação
            playerName: '', // Será preenchido quando houver autenticação
            mood: dailyGuess.mood,
            userGuess: dailyGuess.userGuess,
            matchPercentage: dailyGuess.matchPercentage,
            date: new Date(dailyGuess.timestamp).toISOString().split('T')[0],
            timestamp: dailyGuess.timestamp,
          };
          this.currentScoreSignal.set(score);
        }
      } else {
        // Se não jogou, selecionar mood do dia
        const todayMood = this.selectTodayMood();
        this.currentMoodSignal.set(todayMood);
      }
    } catch (error) {
      console.error('Erro ao inicializar estado do jogo:', error);
      this.errorSignal.set('Erro ao inicializar o jogo');
    } finally {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Seleciona o humor do dia de forma determinística baseado na data
   * Mesma data = mesmo humor para todos os jogadores
   */
  private selectTodayMood(): Mood {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const moodIndex = dayOfYear % AVAILABLE_MOODS.length;
    return AVAILABLE_MOODS[moodIndex];
  }

  /**
   * Registra uma tentativa de jogo
   * @param userGuess - Música que o jogador adivinhou
   * @param matchPercentage - Percentual de correspondência
   */
  submitGuess(userGuess: string, matchPercentage: number): void {
    const mood = this.currentMoodSignal();
    if (!mood) {
      this.errorSignal.set('Nenhum humor disponível');
      return;
    }

    try {
      const timestamp = Date.now();

      // Registrar na persistência diária
      this.dailyLimit.recordDailyPlay({
        mood: mood.id,
        userGuess,
        matchPercentage,
        timestamp,
      });

      // Atualizar estado
      const score: GameScore = {
        playerId: '',
        playerName: '',
        mood: mood.id,
        userGuess,
        matchPercentage,
        date: new Date(timestamp).toISOString().split('T')[0],
        timestamp,
      };

      this.currentScoreSignal.set(score);
      this.hasPlayedTodaySignal.set(true);
    } catch (error) {
      console.error('Erro ao submeter tentativa:', error);
      this.errorSignal.set('Erro ao salvar a tentativa');
    }
  }

  /**
   * Atualiza o personagem selecionado
   * @param character - Dados do personagem
   */
  setSelectedCharacter(character: Character): void {
    this.selectedCharacterSignal.set(character);
  }

  /**
   * Limpa o erro
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Define um erro de forma explícita
   * @param message - Mensagem de erro a ser exibida
   */
  setError(message: string | null): void {
    this.errorSignal.set(message);
  }

  /**
   * Reseta o estado do jogo (útil para testes e reset manual)
   */
  resetGameState(): void {
    this.isLoadingSignal.set(false);
    this.hasPlayedTodaySignal.set(false);
    this.currentMoodSignal.set(null);
    this.currentScoreSignal.set(null);
    this.selectedCharacterSignal.set(null);
    this.errorSignal.set(null);
    this.dailyLimit.resetDaily();
  }
}
