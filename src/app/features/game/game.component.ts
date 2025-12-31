import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService, MusicMatchService, PlayerService } from '@core/services';
import { GameScore } from '@shared/models';

/**
 * GameComponent
 * Tela principal do jogo onde o jogador:
 * - Vê o humor do dia
 * - Entra com sua adivinhação de música
 * - Obtém o percentual de correspondência
 * - Vê o resultado final
 */
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  gameStateService = inject(GameStateService);
  musicMatchService = inject(MusicMatchService);
  playerService = inject(PlayerService);

  gameState = this.gameStateService.getGameState;
  hasPlayedToday = this.gameStateService.hasPlayedToday;
  currentScore = this.gameStateService.currentScore;
  currentMood = this.gameStateService.currentMood;
  error = this.gameStateService.error;

  artistInput = signal('');
  musicInput = signal('');
  isSubmitting = signal(false);
  showResult = signal(false);
  resultData = signal<GameScore | null>(null);

  constructor() {}

  feedbackMessage(): string {
    const percentage = this.gameState().currentScore?.matchPercentage ||
      this.resultData()?.matchPercentage ||
      0;
    return this.musicMatchService.generateFeedback(percentage);
  }

  onSubmitGuess(): void {
    const artist = this.artistInput().trim().toLowerCase();
    const music = this.musicInput().trim().toLowerCase();

    if (!artist || !music) return;

    this.isSubmitting.set(true);

    const mood = this.gameState().currentMood;
    if (!mood) {
      this.isSubmitting.set(false);
      return;
    }

    // Chamar API assincronamente com artista e música separados
    this.musicMatchService
      .calculateMatchPercentage(artist, music, mood.id)
      .then((resp) => {
        // Se o backend retornou fallback por não encontrar a música, mostrar erro amigável
        if (resp.source === 'fallback' && resp.message && resp.message.includes('Música não encontrada')) {
          this.gameStateService.setError('Música não encontrada. Verifique se o artista ou o nome da música estão corretos e tente novamente.');
          this.isSubmitting.set(false);
          return;
        }

        // Limpar qualquer erro anterior
        this.gameStateService.clearError();

        const matchPercentage = resp.matchPercentage ?? 0;

        const score: GameScore = {
          playerId: this.playerService.currentPlayer()?.id || '',
          playerName: this.playerService.currentPlayer()?.name || 'Anônimo',
          mood: mood.id,
          userGuess: `${artist} - ${music}`,
          matchPercentage,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
        };

        // Registrar no estado do jogo
        this.gameStateService.submitGuess(score.userGuess, matchPercentage);

        // Registrar no serviço de jogadores
        this.playerService.recordScore(score);

        // Mostrar resultado
        this.resultData.set(score);
        this.showResult.set(true);

        this.isSubmitting.set(false);
        this.artistInput.set('');
        this.musicInput.set('');
      })
      .catch((error) => {
        console.error('Erro ao processar guess:', error);
        this.isSubmitting.set(false);
      });
  }
}
