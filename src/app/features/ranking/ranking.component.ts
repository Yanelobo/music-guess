import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerService } from '@core/services';
import { LeaderboardService } from '@core/services/leaderboard.service';
import { GameScore } from '@shared/models';

/**
 * RankingComponent
 * Exibe ranking dos top 5 jogadores:
 * - Ranking diário (top 5 de hoje)
 * - Ranking geral (top 5 de todos os tempos)
 */
@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
})
export class RankingComponent {
  playerService = inject(PlayerService);
  leaderboardService = inject(LeaderboardService);
  selectedTab: 'daily' | 'alltime' | 'global' = 'daily';
  globalLeaderboard: GameScore[] = [];

  private refreshIntervalId: any = null;

  constructor() {
    this.loadGlobalLeaderboard();
    // auto-refresh a cada 30s
    this.refreshIntervalId = setInterval(() => this.loadGlobalLeaderboard(), 30_000);
  }

  async loadGlobalLeaderboard() {
    try {
      this.globalLeaderboard = await this.leaderboardService.fetchLeaderboard(50);
    } catch (e) {
      console.warn('Erro ao carregar leaderboard global:', e);
      this.globalLeaderboard = [];
    }
  }

  // Limpar interval quando o componente for destruído
  ngOnDestroy() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  getMedalEmoji(position: number): string {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return medals[position] || '·';
  }
}
