import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHistoryComponent } from './git-history.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: GitHistoryComponent
  }
];

@NgModule({
  declarations: [GitHistoryComponent],
  imports: [
    CommonModule,
    NgbModule,
    NgSelectModule,
    RouterModule.forChild(routes),
    FormsModule
  ]
})
export class GitHistoryModule {}
