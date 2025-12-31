import { Injectable } from '@angular/core';

/**
 * StorageService
 * Abstração genérica para localStorage com métodos fortemente tipados.
 * Facilita a persistência de dados com tipos seguros e serialização automática.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Obtém um valor do localStorage com desserialização automática
   * @param key - Chave do item
   * @param defaultValue - Valor padrão se a chave não existir
   * @returns O valor desserializado ou o valor padrão
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Erro ao recuperar item do localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Armazena um valor no localStorage com serialização automática
   * @param key - Chave do item
   * @param value - Valor a ser armazenado
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao armazenar item no localStorage: ${key}`, error);
    }
  }

  /**
   * Remove um item do localStorage
   * @param key - Chave do item a remover
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover item do localStorage: ${key}`, error);
    }
  }

  /**
   * Limpa todo o localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage', error);
    }
  }

  /**
   * Verifica se uma chave existe no localStorage
   * @param key - Chave a verificar
   * @returns true se a chave existe, false caso contrário
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
