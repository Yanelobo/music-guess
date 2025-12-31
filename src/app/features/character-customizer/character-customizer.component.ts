import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CHARACTER_OPTIONS, Character } from '@shared/models';
import { PlayerService } from '@core/services';

/**
 * CharacterCustomizerComponent
 * Permite ao jogador customizar seu personagem com:
 * - Cor de pele
 * - Estilo de cabelo
 * - Roupas/outfit
 * - Acessórios
 */
@Component({
  selector: 'app-character-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-customizer.component.html',
  styleUrl: './character-customizer.component.scss',
})
export class CharacterCustomizerComponent {
  playerService = inject(PlayerService);

  // Opções de customização
  skinColorOptions = CHARACTER_OPTIONS.skinColors;
  hairStyleOptions = CHARACTER_OPTIONS.hairStyles;
  outfitOptions = CHARACTER_OPTIONS.outfits;
  accessoriesOptions = CHARACTER_OPTIONS.accessories;

  // Signals para seleção
  selectedSkinColor = signal<string>('medium');
  selectedHairStyle = signal<string>('short');
  selectedOutfit = signal<string>('casual');
  selectedAccessories = signal<string[]>([]);
  saveSuccess = signal(false);

  // Mapa de cores para renderização
  private colorMap: Record<string, string> = {
    light: '#f4c5a0',
    medium: '#d4a574',
    dark: '#8b6f47',
  };

  private hairColorMap: Record<string, string> = {
    short: '#3d2817',
    long: '#3d2817',
    curly: '#3d2817',
  };

  private outfitColorMap: Record<string, string> = {
    casual: '#ff8a80',
    cozy: '#ffb74d',
    elegant: '#ba68c8',
  };

  previewColor = signal('#e8d4c0');

  constructor() {
    // Carregar personagem salvo se existir
    const savedCharacter = this.playerService.currentCharacter();
    if (savedCharacter) {
      this.selectedSkinColor.set(savedCharacter.skinColor);
      this.selectedHairStyle.set(savedCharacter.hairStyle);
      this.selectedOutfit.set(savedCharacter.outfit);
      this.selectedAccessories.set(savedCharacter.accessories);
    }
  }

  getSkinColor(): string {
    return this.colorMap[this.selectedSkinColor()] || this.colorMap['medium'];
  }

  getSkinColorValue(skinId: string): string {
    return this.colorMap[skinId] || this.colorMap['medium'];
  }

  getHairStyle(): string {
    return this.hairColorMap[this.selectedHairStyle()] || '#3d2817';
  }

  getOutfitColor(): string {
    return this.outfitColorMap[this.selectedOutfit()] || this.outfitColorMap['casual'];
  }

  toggleAccessory(accessoryId: string): void {
    const current = this.selectedAccessories();
    if (current.includes(accessoryId)) {
      this.selectedAccessories.set(current.filter((a) => a !== accessoryId));
    } else {
      this.selectedAccessories.set([...current, accessoryId]);
    }
  }

  saveCharacter(): void {
    const currentPlayer = this.playerService.currentPlayer();
    if (!currentPlayer) return;

    const character: Character = {
      playerId: currentPlayer.id,
      skinColor: this.selectedSkinColor(),
      hairStyle: this.selectedHairStyle(),
      outfit: this.selectedOutfit(),
      accessories: this.selectedAccessories(),
      lastUpdated: Date.now(),
    };

    this.playerService.setCharacter(character);

    // Mostrar mensagem de sucesso
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 2000);
  }
}
