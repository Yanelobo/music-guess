import { Injectable } from '@angular/core';
import { GameScore } from '@shared/models';

/**
 * LeaderboardService
 * Encapsula chamadas ao backend para obter o leaderboard global
 */
@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private readonly BASE = 'http://localhost:3001/api';

  async fetchLeaderboard(limit = 50): Promise<GameScore[]> {
    try {
      const url = `${this.BASE}/leaderboard?limit=${encodeURIComponent(String(limit))}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.leaderboard || []) as GameScore[];
    } catch (err) {
      console.warn('Erro ao buscar leaderboard global:', err);
      return [];
    }
  }
}
