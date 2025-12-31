import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Interface para resposta do backend
 */
interface MatchResponse {
  matchPercentage: number;
  source: 'acousticbrainz' | 'fallback';
  message?: string;
  features?: {
    energy?: number;
    danceability?: number;
    acousticness?: number;
    instrumentalness?: number;
    valence?: number;
  };
  mbid?: string;
}

/**
 * MusicMatchService
 * Gerencia a lógica de matching entre a música do jogador e o humor do dia
 * Integra com backend Node.js que faz proxy para MusicBrainz + AcousticBrainz
 */
@Injectable({
  providedIn: 'root',
})
export class MusicMatchService {
  private readonly BACKEND_API = `${environment.backendUrl}/api`;

  /**
   * Método principal: calcula correspondência entre música e mood
   * Chama o backend Node.js que faz proxy para as APIs
   * @param artist - Nome do artista
   * @param title - Nome da música
   * @param moodId - ID do mood do dia
   * @returns Percentual de correspondência (0-100)
   */
  async calculateMatchPercentage(
    artist: string,
    title: string,
    moodId: string
  ): Promise<MatchResponse> {
    if (!artist || !title || !moodId) {
      return {
        matchPercentage: 0,
        source: 'fallback',
        message: 'Parâmetros inválidos',
      };
    }

    try {
      const url = `${this.BACKEND_API}/music/match`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist: artist.trim(),
          title: title.trim(),
          moodId: moodId,
        }),
      });

      if (!response.ok) {
        console.error('Erro do servidor:', response.status);
        return {
          matchPercentage: this.calculateFallbackScore(moodId),
          source: 'fallback',
          message: 'Erro do servidor ao buscar música',
        };
      }

      const data = (await response.json()) as MatchResponse;
      return data;
    } catch (error) {
      console.error('Erro ao calcular match:', error);
      return {
        matchPercentage: this.calculateFallbackScore(moodId),
        source: 'fallback',
        message: 'Erro de rede ao contatar o backend',
      };
    }
  }

  /**
   * Score de fallback quando as features acústicas não estão disponíveis
   * Usa um hash determinístico baseado na data
   */
  private calculateFallbackScore(moodId: string): number {
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
   * Gera feedback baseado no percentual de match
   */
  generateFeedback(percentage: number): string {
    if (percentage >= 80) {
      return '🎉 Que correspondência incrível! A vibe bate perfeitamente!';
    } else if (percentage >= 60) {
      return '😊 Muito bom! A música combina bem com o humor do dia.';
    } else if (percentage >= 40) {
      return '🤔 Não é ruim, mas a vibe poderia ser mais próxima.';
    } else if (percentage >= 20) {
      return '😅 Hmm, essa música está um pouco longe do humor pedido.';
    } else {
      return '❌ A vibe dessa música é bem diferente do mood solicitado.';
    }
  }
}
