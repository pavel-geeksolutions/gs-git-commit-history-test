import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'git-history',
    loadChildren: 'src/app/git-history/git-history.module#GitHistoryModule'
  },
  {path: '', redirectTo: 'git-history', pathMatch: 'full'},
  {path: '**', redirectTo: 'git-history'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
