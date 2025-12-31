import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout.component';
import { HomeComponent } from '@features/game/home.component';
import { GameComponent } from '@features/game/game.component';
import { RankingComponent } from '@features/ranking/ranking.component';
import { CharacterCustomizerComponent } from '@features/character-customizer/character-customizer.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'game',
        component: GameComponent,
      },
      {
        path: 'ranking',
        component: RankingComponent,
      },
      {
        path: 'character',
        component: CharacterCustomizerComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
