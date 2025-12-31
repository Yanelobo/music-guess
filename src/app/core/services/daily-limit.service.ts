import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

/**
 * DailyLimitService
 * Gerencia as limitações diárias do jogo:
 * - Controla se o jogador já jogou hoje
 * - Reseta o estado a cada novo dia
 * - Persiste a data do último jogo
 */
@Injectable({
  providedIn: 'root',
})
export class DailyLimitService {
  private readonly LAST_PLAYED_DATE_KEY = 'game:last-played-date';
  private readonly DAILY_GUESS_KEY = 'game:daily-guess';

  constructor(private storage: StorageService) {}

  /**
   * Verifica se o jogador já fez sua tentativa diária
   * @returns true se já jogou hoje, false caso contrário
   */
  hasPlayedToday(): boolean {
    const lastPlayedDate = this.storage.get<string>(this.LAST_PLAYED_DATE_KEY);
    if (!lastPlayedDate) {
      return false;
    }

    const today = this.getTodayDateString();
    return lastPlayedDate === today;
  }

  /**
   * Registra que o jogador fez sua tentativa diária
   * @param guessData - Dados da tentativa (música, score, etc)
   */
  recordDailyPlay(guessData: DailyGuessData): void {
    const today = this.getTodayDateString();
    this.storage.set(this.LAST_PLAYED_DATE_KEY, today);
    this.storage.set(this.DAILY_GUESS_KEY, guessData);
  }

  /**
   * Obtém a tentativa diária do jogador
   * @returns Dados da tentativa ou undefined se não existe
   */
  getDailyGuess(): DailyGuessData | undefined {
    return this.storage.get<DailyGuessData>(this.DAILY_GUESS_KEY);
  }

  /**
   * Limpa os dados da tentativa diária (usado ao resetar o jogo)
   */
  clearDailyGuess(): void {
    this.storage.remove(this.DAILY_GUESS_KEY);
  }

  /**
   * Obtém a data do último jogo
   * @returns Data formatada como YYYY-MM-DD ou undefined
   */
  getLastPlayedDate(): string | undefined {
    return this.storage.get<string>(this.LAST_PLAYED_DATE_KEY);
  }

  /**
   * Retorna a data de hoje no formato YYYY-MM-DD para comparação
   * @returns String com data formatada
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Reseta manualmente os dados diários (útil para testes)
   */
  resetDaily(): void {
    this.storage.remove(this.LAST_PLAYED_DATE_KEY);
    this.clearDailyGuess();
  }
}

/**
 * Interface para os dados da tentativa diária
 */
export interface DailyGuessData {
  mood: string; // Humor do dia (ex: "chill", "energetic")
  userGuess: string; // Música que o jogador adivinhou
  matchPercentage: number; // Percentual de correspondência (0-100)
  timestamp: number; // Timestamp da tentativa
}
