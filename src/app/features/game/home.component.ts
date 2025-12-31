import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '@core/services';

/**
 * HomeComponent
 * Tela inicial/welcome onde o jogador entra com seu nome
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  playerService = inject(PlayerService);
  router = inject(Router);

  playerName = signal('');
  isLoading = signal(false);

  constructor() {}

  onStartGame(): void {
    const name = this.playerName().trim();
    if (!name) return;

    this.isLoading.set(true);

    try {
      // Criar ou obter jogador
      this.playerService.getOrCreatePlayer(name);

      // Aguardar um pouco para feedback visual
      setTimeout(() => {
        this.isLoading.set(false);
        this.router.navigate(['/game']);
      }, 500);
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      this.isLoading.set(false);
    }
  }
}
