import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/main-page/ui/main-page/main-page.component').then(
        m => m.MainPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
